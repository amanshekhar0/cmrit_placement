const express = require('express');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const router = express.Router();

const Payment = require('../models/Payment');
const Access = require('../models/Access');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');
const { attachAccess } = require('../middleware/subscriptionMiddleware');
const { adminLimiter } = require('../middleware/rateLimiter');
const { grantAccess } = require('../utils/accessService');
const { PRODUCTS, SAMPLING } = require('../config/products');
const { sendPassPurchaseEmail } = require('../utils/sendEmail');

const BUNDLE = PRODUCTS.bundle;
const AMOUNT_PAISE = BUNDLE.priceInr * 100;

function getRazorpay() {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// Send the "pass activated" email exactly once per purchase term. Both the
// in-page verify and the webhook fire for the same payment, so we atomically
// claim the send before actually emailing.
async function maybeSendPurchaseEmail(email, name, info) {
  const lower = String(email).toLowerCase();
  const claim = await Access.findOneAndUpdate(
    { email: lower, product: 'bundle', welcomeEmailSent: { $ne: true } },
    { $set: { welcomeEmailSent: true } },
    { new: true }
  );
  if (!claim) return; // already sent for this term, or no entitlement yet

  try {
    await sendPassPurchaseEmail(lower, name, { ...info, expiresAt: claim.expiresAt });
  } catch (err) {
    console.error('Failed to send pass email to', lower, '-', err.message);
    // Release the claim so a later trigger can retry the send.
    await Access.updateOne(
      { email: lower, product: 'bundle' },
      { $set: { welcomeEmailSent: false } }
    );
  }
}

// --------------------------------------------------------------
// GET /api/subscription/status - what does the caller currently own?
// --------------------------------------------------------------
router.get('/status', verifyToken, attachAccess, async (req, res) => {
  try {
    const { questions, notes, lifetime, expiresAt, products } = req.access;
    const daysLeft = expiresAt
      ? Math.max(0, Math.ceil((expiresAt - Date.now()) / (24 * 60 * 60 * 1000)))
      : null;

    res.json({
      success: true,
      hasAccess: questions || notes,
      access: { questions, notes },
      lifetime,
      expiresAt,
      daysLeft,
      products,
      price: BUNDLE.priceInr,
      durationDays: BUNDLE.durationDays,
      freeSample: SAMPLING.FREE_TECH_SAMPLE,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// --------------------------------------------------------------
// POST /api/subscription/create-order - start the bundle payment
// --------------------------------------------------------------
router.post('/create-order', verifyToken, async (req, res) => {
  try {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(503).json({ success: false, message: 'Payments are not configured yet.' });
    }
    const email = req.user.email.toLowerCase();

    const order = await getRazorpay().orders.create({
      amount: AMOUNT_PAISE,
      currency: 'INR',
      receipt: `pass_${Date.now()}`,
      notes: { email, product: 'bundle' },
    });

    await Payment.findOneAndUpdate(
      { orderId: order.id },
      { email, orderId: order.id, amount: AMOUNT_PAISE, currency: 'INR', status: 'created' },
      { upsert: true, new: true }
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
    res.status(500).json({ success: false, message: 'Could not start the payment.' });
  }
});

// --------------------------------------------------------------
// POST /api/subscription/verify-payment - verify signature, grant the pass
// --------------------------------------------------------------
router.post('/verify-payment', verifyToken, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Missing payment details.' });
    }

    // The order must belong to the authenticated user, or anyone could claim
    // someone else's successful payment as their own.
    const payment = await Payment.findOne({ orderId: razorpay_order_id });
    if (!payment || payment.email !== req.user.email.toLowerCase()) {
      return res.status(403).json({
        success: false,
        message: 'This order does not belong to your account.',
      });
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

    const access = await grantAccess(req.user.email, 'bundle', {
      grantedVia: 'payment',
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    });

    await maybeSendPurchaseEmail(req.user.email, req.user.name, {
      amount: BUNDLE.priceInr,
      paymentId: razorpay_payment_id,
    });

    res.json({
      success: true,
      message: 'Pass activated.',
      token: access.token,
      expiresAt: access.expiresAt,
    });
  } catch (error) {
    console.error('verify-payment error:', error);
    res.status(500).json({ success: false, message: 'Could not verify the payment.' });
  }
});

// --------------------------------------------------------------
// POST /api/subscription/webhook - Razorpay server-to-server confirmation.
//
// Fires even if the user closes the tab before the in-page verify runs. No
// auth (Razorpay calls it), but every request is authenticated by its HMAC
// over the raw body against the webhook secret.
// --------------------------------------------------------------
router.post('/webhook', async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) return res.status(503).json({ success: false, message: 'Webhook not configured' });

    const signature = req.headers['x-razorpay-signature'];
    const expected = crypto.createHmac('sha256', secret).update(req.rawBody).digest('hex');

    if (!signature || expected !== signature) {
      return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
    }

    const event = req.body.event;
    const entity = req.body.payload && req.body.payload.payment && req.body.payload.payment.entity;

    if ((event === 'payment.captured' || event === 'order.paid') && entity) {
      const orderId = entity.order_id;
      const paymentId = entity.id;
      const payment = await Payment.findOne({ orderId });

      // Only act on orders we created for THIS product. The notes flow has its
      // own webhook, and a shared endpoint must not double-grant across them.
      const isBundleOrder = !!(entity.notes && entity.notes.product === 'bundle');

      if (isBundleOrder) {
        const email = (payment && payment.email) || (entity.notes && entity.notes.email);
        if (email) {
          if (payment) {
            payment.status = 'paid';
            payment.paymentId = paymentId;
            await payment.save();
          }
          await grantAccess(email, 'bundle', {
            grantedVia: 'payment',
            paymentId,
            orderId,
          });
          await maybeSendPurchaseEmail(email, '', {
            amount: BUNDLE.priceInr,
            paymentId,
          });
        }
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('webhook error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// --------------------------------------------------------------
// Admin: grant / revoke / list
// --------------------------------------------------------------
router.post('/admin/grant', adminLimiter, verifyAdmin, async (req, res) => {
  try {
    const { email, product = 'bundle' } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'email is required' });
    if (!PRODUCTS[product]) return res.status(400).json({ success: false, message: 'Unknown product' });

    const access = await grantAccess(email, product, {
      grantedVia: 'manual',
      grantedBy: req.user.email,
    });
    res.json({ success: true, data: access });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/admin/revoke', adminLimiter, verifyAdmin, async (req, res) => {
  try {
    const { email, product = 'bundle' } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'email is required' });

    // Expire rather than delete, so the purchase history survives a revoke.
    const access = await Access.findOneAndUpdate(
      { email: String(email).toLowerCase(), product },
      { $set: { expiresAt: new Date() } },
      { new: true }
    );
    if (!access) return res.status(404).json({ success: false, message: 'No such entitlement' });
    res.json({ success: true, data: access });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/admin/list', adminLimiter, verifyAdmin, async (req, res) => {
  try {
    const all = await Access.find().sort({ createdAt: -1 });
    const now = new Date();
    res.json({
      success: true,
      count: all.length,
      active: all.filter((a) => a.expiresAt === null || a.expiresAt > now).length,
      data: all,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
