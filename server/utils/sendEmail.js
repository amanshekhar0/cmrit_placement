// Transactional email helper. Prefers Gmail SMTP via Nodemailer (works for any
// recipient without a verified domain); falls back to Resend's HTTP API.

const nodemailer = require('nodemailer');

const RESEND_API_URL = 'https://api.resend.com/emails';

let transporter = null;
function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port,
    secure: port === 465, // implicit TLS on 465, STARTTLS on 587
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  return transporter;
}

async function sendViaSmtp({ to, subject, html }) {
  const t = getTransporter();
  const from = process.env.SMTP_FROM || `CMRIT Placement <${process.env.SMTP_USER}>`;
  const info = await t.sendMail({
    from,
    to: Array.isArray(to) ? to.join(',') : to,
    subject,
    html,
  });
  return { id: info.messageId, provider: 'smtp' };
}

async function sendViaResend({ to, subject, html }) {
  const from = process.env.RESEND_FROM || 'CMRIT Placement <onboarding@resend.dev>';
  const res = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend API ${res.status}: ${text}`);
  }
  return { ...(await res.json()), provider: 'resend' };
}

async function sendEmail({ to, subject, html }) {
  if (getTransporter()) {
    return sendViaSmtp({ to, subject, html });
  }
  if (process.env.RESEND_API_KEY) {
    return sendViaResend({ to, subject, html });
  }
  console.warn('No email provider configured (SMTP_* or RESEND_API_KEY) — skipping email to', to);
  return { skipped: true };
}

function purchaseEmailHtml({ name, amount, paymentId }) {
  const rupees = amount ? (amount / 100).toFixed(0) : '49';
  const greeting = name ? `Hi ${name},` : 'Hi there,';
  const appUrl = process.env.APP_URL || 'https://cmritplacement.vercel.app';

  return `
  <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#fafafa;padding:32px 0;">
    <div style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #e4e4e7;border-radius:16px;overflow:hidden;">
      <div style="background:#18181b;padding:24px 28px;">
        <h1 style="margin:0;color:#ffffff;font-size:18px;font-weight:600;letter-spacing:-0.02em;">CMRIT Placement Portal</h1>
      </div>
      <div style="padding:28px;">
        <p style="margin:0 0 14px;color:#18181b;font-size:15px;">${greeting}</p>
        <p style="margin:0 0 18px;color:#3f3f46;font-size:14px;line-height:1.6;">
          Your payment of <strong>₹${rupees}</strong> was successful and your
          <strong>Premium Notes bundle</strong> is now unlocked. 🎉
          Head back to the portal and open the <strong>Notes</strong> tab to download every PDF.
        </p>
        <a href="${appUrl}" style="display:inline-block;background:#18181b;color:#ffffff;text-decoration:none;font-size:14px;font-weight:500;padding:11px 20px;border-radius:10px;">
          Open the portal →
        </a>
        ${paymentId ? `<p style="margin:22px 0 0;color:#a1a1aa;font-size:12px;">Payment reference: ${paymentId}</p>` : ''}
        <p style="margin:6px 0 0;color:#a1a1aa;font-size:12px;">Access is tied to this email address.</p>
      </div>
      <div style="padding:16px 28px;border-top:1px solid #f4f4f5;">
        <p style="margin:0;color:#a1a1aa;font-size:11px;">© ${new Date().getFullYear()} CMRIT Placement Portal</p>
      </div>
    </div>
  </div>`;
}

async function sendNotesPurchaseEmail(to, name, { amount, paymentId } = {}) {
  return sendEmail({
    to,
    subject: 'Your CMRIT Placement notes are unlocked 🎉',
    html: purchaseEmailHtml({ name, amount, paymentId }),
  });
}

module.exports = { sendEmail, sendNotesPurchaseEmail };
