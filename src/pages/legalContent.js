/**
 * Business details used across the legal pages and the Razorpay checkout.
 *
 * ---------------------------------------------------------------------------
 * ACTION REQUIRED BEFORE GOING LIVE
 * ---------------------------------------------------------------------------
 * Razorpay verifies these against your KYC submission, and a mismatch is one of
 * the most common activation rejections. Every value marked TODO must be your
 * real, verifiable detail -- not a placeholder, and not the college's details
 * unless the account is genuinely registered to the college.
 *
 * These pages are standard-form templates, not legal advice. Read them, and
 * make sure each statement is actually true of how you operate.
 */
export const BUSINESS = {
  // TODO: the legal entity name on your Razorpay account. For an individual /
  // sole proprietor this is your own full name, exactly as on your PAN.
  legalName: 'TODO_LEGAL_NAME',

  // The name students see. Safe to keep.
  tradeName: 'CMRIT Placement Portal',

  // TODO: a real, monitored address. Razorpay requires a full postal address.
  address: {
    line1: 'TODO_ADDRESS_LINE_1',
    line2: 'TODO_ADDRESS_LINE_2',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: 'TODO_PIN',
    country: 'India',
  },

  // TODO: a monitored inbox. This is where refund and support mail lands, and
  // it must be reachable -- Razorpay tests it.
  supportEmail: 'TODO_SUPPORT_EMAIL',

  // TODO: a reachable phone number, required for Razorpay activation.
  supportPhone: 'TODO_PHONE',

  siteUrl: 'https://cmritplacement.vercel.app',

  // Support turnaround you are actually willing to honour.
  responseTimeHours: 48,
};

export const PRICING = {
  amountInr: 99,
  durationDays: 60,
  productName: 'CMRIT Placement Pass',
};

// Last substantive revision of the policy text below. Update when you edit it.
export const POLICY_LAST_UPDATED = '26 August 2026';
