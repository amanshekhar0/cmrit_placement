const express = require('express');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const https = require('https');
const http = require('http');
const router = express.Router();

const cloudinary = require('../config/cloudinary');
const Note = require('../models/Note');
const Access = require('../models/Access');
const { getEntitlements, grantAccess: grantProductAccess } = require('../utils/accessService');
const Payment = require('../models/Payment');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');
const { adminLimiter } = require('../middleware/rateLimiter');
const { sendNotesPurchaseEmail } = require('../utils/sendEmail');

const PRICE_INR = parseInt(process.env.NOTES_PRICE_INR || '49', 10);
const AMOUNT_PAISE = PRICE_INR * 100;

function getRazorpay() {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// Capability-based: true for a legacy lifetime notes grant OR an active
// bundle pass. Callers never need to know which product paid for it.
async function userHasAccess(email) {
  const caps = await getEntitlements(email);
  return caps.notes;
}

// The Access doc backing a user's notes entitlement, preferring the bundle
// (which carries the current expiry) over a legacy lifetime notes grant.
async function notesAccessDoc(email) {
  const lower = String(email).toLowerCase();
  const docs = await Access.find({ email: lower, product: { $in: ['bundle', 'notes'] } });
  const now = new Date();
  const active = docs.filter((d) => d.expiresAt === null || d.expiresAt > now);
  return active.find((d) => d.product === 'bundle') || active[0] || null;
}

// Grant (or refresh) notes access for an email, guaranteeing an access token.
// Used by both payment paths and manual admin grants.
async function grantAccess(email, fields) {
  return grantProductAccess(email, 'notes', fields);
}

// Build a signed Cloudinary preview image of the PDF's first page.
// When `clear` is false we render a heavily blurred teaser SERVER-SIDE, so the
// un-blurred image is never delivered to a user without access (more secure
// than a CSS blur, which still ships the real pixels to the browser).
function buildPreviewUrl(note, clear) {
  const transformation = clear
    ? [{ page: 1, width: 900, quality: 'auto' }]
    : [{ page: 1, width: 600, effect: 'blur:2000', quality: 'auto:low' }];
  return cloudinary.url(note.publicId, {
    resource_type: note.resourceType || 'image',
    type: 'authenticated',
    sign_url: true,
    secure: true,
    format: 'jpg',
    transformation,
  });
}

// Send the "notes unlocked" email exactly once per buyer. Both the in-page
// verify and the webhook may fire for the same payment, so we atomically
// "claim" the send via the welcomeEmailSent flag before emailing.
async function maybeSendPurchaseEmail(email, name, info) {
  const lower = String(email).toLowerCase();
  const claim = await Access.findOneAndUpdate(
    { email: lower, product: 'notes', welcomeEmailSent: { $ne: true } },
    { $set: { welcomeEmailSent: true } },
    { new: true }
  );
  if (!claim) return; // already sent, or no access record

  try {
    await sendNotesPurchaseEmail(lower, name, info);
  } catch (err) {
    console.error('Failed to send purchase email to', lower, '-', err.message);
    // Release the claim so a later trigger can retry the send.
    await Access.updateOne({ email: lower, product: 'notes' }, { $set: { welcomeEmailSent: false } });
  }
}

// ──────────────────────────────────────────────────────────────
// Student-facing routes (any logged-in CMRIT user)
// ──────────────────────────────────────────────────────────────

// GET /api/notes/access — does the current user own the bundle?
router.get('/access', verifyToken, async (req, res) => {
  try {
    const access = await notesAccessDoc(req.user.email);
    res.json({
      success: true,
      hasAccess: !!access,
      price: PRICE_INR,
      token: access ? access.token : null,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/notes — list notes with a signed first-page preview image each.
// Locked users get a SERVER-SIDE blurred teaser; entitled users get the clear one.
router.get('/', verifyToken, async (req, res) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 });
    const access = await notesAccessDoc(req.user.email);
    const hasAccess = !!access;

    const data = notes.map((n) => ({
      _id: n._id,
      title: n.title,
      description: n.description,
      bytes: n.bytes,
      format: n.format,
      createdAt: n.createdAt,
      previewUrl: buildPreviewUrl(n, hasAccess),
    }));

    res.json({
      success: true,
      hasAccess,
      price: PRICE_INR,
      token: hasAccess ? access.token : null,
      data,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/notes/:id/download — gated; returns a short-lived signed Cloudinary URL
router.get('/:id/download', verifyToken, async (req, res) => {
  try {
    const hasAccess = await userHasAccess(req.user.email);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Purchase the notes bundle to access downloads.',
      });
    }

    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    const expiresAt = Math.floor(Date.now() / 1000) + 300; // valid for 5 minutes

    // Raw assets embed the extension in the public_id. Drop the format if it
    // is already present there so we don't end up with `file.pdf.pdf`.
    let format = note.format || '';
    if (format && note.publicId.toLowerCase().endsWith('.' + format.toLowerCase())) {
      format = '';
    }

    const url = cloudinary.utils.private_download_url(note.publicId, format || 'pdf', {
      resource_type: note.resourceType || 'image',
      type: 'authenticated',
      expires_at: expiresAt,
      attachment: false,
    });

    res.json({ success: true, url, expiresAt });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/notes/:id/proxy — streams the PDF through our server so pdfjs-dist
// can load it without running into Cloudinary's CORS restrictions.
router.get('/:id/proxy', verifyToken, async (req, res) => {
  try {
    const hasAccess = await userHasAccess(req.user.email);
    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'Purchase the notes bundle to access downloads.' });
    }

    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    const expiresAt = Math.floor(Date.now() / 1000) + 300;
    let format = note.format || '';
    if (format && note.publicId.toLowerCase().endsWith('.' + format.toLowerCase())) {
      format = '';
    }

    // Generate a short-lived Cloudinary URL to fetch from server-side
    const cloudinaryUrl = cloudinary.utils.private_download_url(note.publicId, format || 'pdf', {
      resource_type: note.resourceType || 'image',
      type: 'authenticated',
      expires_at: expiresAt,
      attachment: false,
    });

    // Stream the PDF from Cloudinary through our server so the browser
    // never touches Cloudinary directly (avoids CORS issues in pdfjs-dist).
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // Prevent the browser from treating this as a download
    res.setHeader('Content-Disposition', 'inline');

    const protocol = cloudinaryUrl.startsWith('https') ? https : http;
    protocol.get(cloudinaryUrl, (proxyRes) => {
      if (proxyRes.statusCode !== 200) {
        res.status(proxyRes.statusCode).end();
        return;
      }
      proxyRes.pipe(res);
    }).on('error', (err) => {
      console.error('Proxy fetch error:', err);
      if (!res.headersSent) res.status(502).json({ success: false, message: 'Failed to fetch document.' });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/notes/create-order — start a ₹49 UPI payment
router.post('/create-order', verifyToken, async (req, res) => {
  try {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ success: false, message: 'Payment gateway is not configured.' });
    }

    const email = req.user.email;
    if (await userHasAccess(email)) {
      return res.status(400).json({ success: false, message: 'You already have access to the notes bundle.' });
    }

    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount: AMOUNT_PAISE,
      currency: 'INR',
      receipt: `notes_${Date.now()}`,
      notes: { email, purpose: 'notes_bundle' },
    });

    await Payment.findOneAndUpdate(
      { orderId: order.id },
      { email, orderId: order.id, amount: AMOUNT_PAISE, currency: 'INR', status: 'created' },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('create-order error:', error);
    const message = (error && error.error && error.error.description) || error.message;
    res.status(500).json({ success: false, message });
  }
});

// POST /api/notes/verify-payment — verify the Razorpay signature and grant access
router.post('/verify-payment', verifyToken, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Missing payment fields.' });
    }

    // The order must belong to the authenticated user.
    const payment = await Payment.findOne({ orderId: razorpay_order_id });
    if (!payment || payment.email !== req.user.email) {
      return res.status(403).json({ success: false, message: 'This order does not belong to your account.' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      payment.status = 'failed';
      await payment.save();
      return res.status(400).json({ success: false, message: 'Payment verification failed.' });
    }

    payment.status = 'paid';
    payment.paymentId = razorpay_payment_id;
    await payment.save();

    const access = await grantAccess(req.user.email, {
      grantedVia: 'payment',
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    });

    // Best-effort confirmation email (never fails the request).
    await maybeSendPurchaseEmail(req.user.email, req.user.name, {
      amount: payment.amount,
      paymentId: razorpay_payment_id,
    });

    res.json({
      success: true,
      message: 'Payment verified. You now have access to the notes bundle.',
      token: access.token,
    });
  } catch (error) {
    console.error('verify-payment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/notes/webhook — Razorpay server-to-server confirmation.
// Reliability backup: grants access even if the user closes the tab before
// the frontend verify-payment call runs. No auth (called by Razorpay), but
// every request is authenticated by its HMAC signature against the webhook secret.
router.post('/webhook', async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      // Not configured yet — acknowledge so Razorpay stops retrying.
      return res.status(200).json({ success: true, message: 'Webhook not configured' });
    }

    const signature = req.headers['x-razorpay-signature'];
    const body = req.rawBody || Buffer.from(JSON.stringify(req.body || {}));
    const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');

    if (!signature || expected !== signature) {
      return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
    }

    const event = req.body.event;
    const entity = req.body.payload && req.body.payload.payment && req.body.payload.payment.entity;

    if ((event === 'payment.captured' || event === 'order.paid') && entity) {
      const orderId = entity.order_id;
      const paymentId = entity.id;
      const notesEmail = entity.notes && entity.notes.email;

      // Prefer the email we stored on our own order; fall back to the
      // email Razorpay echoes back in the payment notes.
      const payment = await Payment.findOne({ orderId });
      const email = (payment && payment.email) || notesEmail;

      if (email) {
        if (payment && payment.status !== 'paid') {
          payment.status = 'paid';
          payment.paymentId = paymentId;
          await payment.save();
        }
        await grantAccess(email, { grantedVia: 'payment', paymentId, orderId });

        // Confirmation email (deduped against the in-page verify path).
        await maybeSendPurchaseEmail(email, null, { amount: entity.amount, paymentId });
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('webhook error:', error);
    // 500 so Razorpay retries on a transient failure on our side.
    res.status(500).json({ success: false, message: error.message });
  }
});

// ──────────────────────────────────────────────────────────────
// Admin routes
// ──────────────────────────────────────────────────────────────

// POST /api/notes/admin/upload-signature — signed params for a direct
// browser → Cloudinary upload (keeps large PDFs off the serverless function).
router.post('/admin/upload-signature', adminLimiter, verifyAdmin, async (req, res) => {
  try {
    if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return res.status(500).json({ success: false, message: 'File storage is not configured.' });
    }

    const timestamp = Math.round(Date.now() / 1000);
    const folder = 'cmrit_notes';
    const paramsToSign = { folder, timestamp, type: 'authenticated' };
    const signature = cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET);

    res.json({
      success: true,
      signature,
      timestamp,
      folder,
      type: 'authenticated',
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/notes/admin — persist note metadata after a successful upload
router.post('/admin', adminLimiter, verifyAdmin, async (req, res) => {
  try {
    const { title, description, publicId, format, bytes, resourceType } = req.body;
    if (!title || !publicId) {
      return res.status(400).json({ success: false, message: 'Title and uploaded file are required.' });
    }

    const note = await Note.create({
      title: title.trim(),
      description: (description || '').trim(),
      publicId,
      format: format || 'pdf',
      bytes: bytes || 0,
      resourceType: resourceType || 'image',
      uploadedBy: req.user.email,
    });

    res.status(201).json({ success: true, data: note });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE /api/notes/admin/:id — remove a note (Cloudinary asset + metadata)
router.delete('/admin/:id', adminLimiter, verifyAdmin, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    try {
      await cloudinary.uploader.destroy(note.publicId, {
        resource_type: note.resourceType || 'image',
        type: 'authenticated',
      });
    } catch (e) {
      console.error('Cloudinary destroy error:', e.message);
    }

    await note.deleteOne();
    res.json({ success: true, message: 'Note deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/notes/admin/grants — list everyone who has access
router.get('/admin/grants', verifyAdmin, async (req, res) => {
  try {
    const grants = await Access.find({ product: 'notes' }).sort({ createdAt: -1 });
    res.json({ success: true, data: grants });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/notes/admin/grant — manually grant access to an email
router.post('/admin/grant', adminLimiter, verifyAdmin, async (req, res) => {
  try {
    let { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'A valid email is required.' });
    }
    email = email.trim().toLowerCase();

    const grant = await grantAccess(email, { grantedVia: 'manual', grantedBy: req.user.email });

    res.json({ success: true, data: grant });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE /api/notes/admin/grant/:email — revoke access
router.delete('/admin/grant/:email', adminLimiter, verifyAdmin, async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email).trim().toLowerCase();
    await Access.findOneAndDelete({ email, product: 'notes' });
    res.json({ success: true, message: 'Access revoked' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
