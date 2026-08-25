// Single source of truth for what we sell and what each product unlocks.
//
// `bundle` is the ₹99 / 2-month pass that unlocks BOTH the full question bank
// and the notes library. `notes` is the legacy ₹49 lifetime notes purchase —
// kept so existing buyers keep what they paid for; it is no longer sold.
const PRODUCTS = {
  bundle: {
    id: 'bundle',
    label: 'CMRIT Placement Pass',
    priceInr: parseInt(process.env.BUNDLE_PRICE_INR || '99', 10),
    durationDays: parseInt(process.env.BUNDLE_DURATION_DAYS || '60', 10),
    grants: { questions: true, notes: true },
    onSale: true,
  },
  notes: {
    id: 'notes',
    label: 'Notes Bundle (legacy)',
    priceInr: parseInt(process.env.NOTES_PRICE_INR || '49', 10),
    durationDays: null, // null = lifetime, never expires
    grants: { questions: false, notes: true },
    onSale: false,
  },
};

// How much of the question bank an unpaid visitor can see.
//
// This is the metered-paywall dial. Set FREE_TECH_SAMPLE to 0 to turn the
// whole thing into a hard paywall — nothing else needs to change.
const SAMPLING = {
  // Technical + programming questions shown per company before the lock.
  FREE_TECH_SAMPLE: parseInt(process.env.FREE_TECH_SAMPLE || '5', 10),
  // HR questions are generic and high-volume; they are the SEO engine, so they
  // stay fully free. Flip to a number to meter them too.
  FREE_HR_SAMPLE: process.env.FREE_HR_SAMPLE ? parseInt(process.env.FREE_HR_SAMPLE, 10) : null,
};

module.exports = { PRODUCTS, SAMPLING };
