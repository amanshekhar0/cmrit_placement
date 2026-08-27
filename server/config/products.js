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
// Both dials default to 0: a signed-out or unpaid visitor sees NO question
// text at all, only how many questions each company has. The counts are what
// the public pages and the paywall card are built from, and they are computed
// from the full entry server-side -- the withheld text is never serialised
// into the response, so there is nothing to read out of the network tab.
//
// Raise either number in the environment to reopen a metered preview without
// touching any other file.
const SAMPLING = {
  // Technical + programming questions shown per company before the lock.
  FREE_TECH_SAMPLE: parseInt(process.env.FREE_TECH_SAMPLE || '0', 10),
  // HR questions per company. Set to the string 'all' to make them fully free
  // again (they used to be the SEO engine); any number meters them.
  FREE_HR_SAMPLE:
    process.env.FREE_HR_SAMPLE === 'all'
      ? null
      : parseInt(process.env.FREE_HR_SAMPLE || '0', 10),
};

module.exports = { PRODUCTS, SAMPLING };
