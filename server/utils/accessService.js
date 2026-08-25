const crypto = require('crypto');
const Access = require('../models/Access');
const { PRODUCTS } = require('../config/products');

function genToken(product) {
  const prefix = product === 'bundle' ? 'CMRIT-PASS' : 'CMRIT-NOTES';
  return `${prefix}-` + crypto.randomBytes(8).toString('hex').toUpperCase();
}

// Compute the new expiry for a purchase or renewal.
//
// Renewals EXTEND rather than reset: a student who renews with 12 days left
// keeps those 12 days and gets the new term on top. Without the max() a good
// customer would be punished for paying early.
function computeExpiry(existing, durationDays) {
  if (durationDays === null) return null; // lifetime product
  const now = new Date();
  const base = existing && existing.expiresAt && existing.expiresAt > now
    ? existing.expiresAt
    : now;
  return new Date(base.getTime() + durationDays * 24 * 60 * 60 * 1000);
}

// Grant (or renew) a product for an email. Idempotent per (email, product):
// both the in-page verify and the Razorpay webhook may call this for the same
// payment, so a repeat call with the SAME paymentId must not extend twice.
async function grantAccess(email, product, fields = {}) {
  const lower = String(email).toLowerCase();
  const spec = PRODUCTS[product];
  if (!spec) throw new Error(`Unknown product: ${product}`);

  const existing = await Access.findOne({ email: lower, product });

  // Same payment already applied — return as-is rather than double-extending.
  if (existing && fields.paymentId && existing.paymentId === fields.paymentId) {
    return existing;
  }

  const isRenewal = !!existing && fields.grantedVia === 'payment';
  const expiresAt = computeExpiry(existing, spec.durationDays);

  if (!existing) {
    return Access.create({
      email: lower,
      product,
      expiresAt,
      token: genToken(product),
      purchaseCount: 1,
      ...fields,
    });
  }

  Object.assign(existing, fields);
  existing.expiresAt = expiresAt;
  if (!existing.token) existing.token = genToken(product);
  if (isRenewal) {
    existing.purchaseCount = (existing.purchaseCount || 1) + 1;
    // New term, so the previous term's expiry nudge no longer applies.
    existing.expiryReminderSentAt = null;
  }
  await existing.save();
  return existing;
}

// What is this email currently entitled to?
//
// Capability-based rather than product-based: the caller asks "can they see
// questions?", not "did they buy the bundle?". That keeps legacy ₹49 notes
// buyers working without special-casing them at every call site.
async function getEntitlements(email) {
  const lower = String(email || '').toLowerCase();
  // `lifetime` is tracked separately because a null expiresAt is ambiguous on
  // its own: it means both "never expires" and "no entitlement at all".
  const caps = { questions: false, notes: false, lifetime: false, expiresAt: null, products: [] };
  if (!lower) return caps;

  const docs = await Access.find({ email: lower });
  const now = new Date();

  for (const doc of docs) {
    const active = doc.expiresAt === null || doc.expiresAt > now;
    if (!active) continue;

    const grants = (PRODUCTS[doc.product] || {}).grants || {};
    if (grants.questions) caps.questions = true;
    if (grants.notes) caps.notes = true;

    caps.products.push({
      product: doc.product,
      expiresAt: doc.expiresAt,
      token: doc.token,
    });

    if (doc.expiresAt === null) {
      caps.lifetime = true;
    } else if (!caps.expiresAt || doc.expiresAt > caps.expiresAt) {
      // Surface the furthest-out expiry across all active grants.
      caps.expiresAt = doc.expiresAt;
    }
  }

  if (caps.lifetime) caps.expiresAt = null;
  return caps;
}

async function hasAccessTo(email, capability) {
  const caps = await getEntitlements(email);
  return !!caps[capability];
}

module.exports = { grantAccess, getEntitlements, hasAccessTo, genToken, computeExpiry };
