const mongoose = require('mongoose');

// One document per (email, product) entitlement.
//
// Keyed by email rather than a User _id so an admin can grant access to a
// student who has not logged in yet — the entitlement is matched the moment
// they sign in with that Google account.
//
// Supersedes the old NotesAccess model, which had no notion of expiry.
// `expiresAt: null` means a lifetime grant (legacy ₹49 notes buyers).
const accessSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    index: true,
  },
  product: {
    type: String,
    enum: ['bundle', 'notes'],
    required: true,
  },
  grantedVia: {
    type: String,
    enum: ['payment', 'manual', 'migration'],
    required: true,
  },
  // null = never expires. Otherwise access is live only while expiresAt > now.
  expiresAt: {
    type: Date,
    default: null,
    index: true,
  },
  paymentId: String,  // razorpay_payment_id when granted via payment
  orderId: String,
  grantedBy: String,  // admin email when granted manually
  // Free-text reason for a manual grant ("class rep", "won the quiz"), so a
  // list of comped accounts is auditable months later.
  note: {
    type: String,
    trim: true,
    maxlength: 200,
  },
  token: String,      // human-readable access token, shown to user + admin
  // Number of times this entitlement has been paid for (first buy + renewals).
  purchaseCount: {
    type: Number,
    default: 1,
  },
  welcomeEmailSent: {
    type: Boolean,
    default: false,
  },
  // Set once the "your pass expires soon" nudge goes out for the current term.
  // Reset on every renewal so the next term gets its own reminder.
  expiryReminderSentAt: {
    type: Date,
    default: null,
  },
}, { timestamps: true });

accessSchema.index({ email: 1, product: 1 }, { unique: true });

accessSchema.methods.isActive = function () {
  return this.expiresAt === null || this.expiresAt > new Date();
};

module.exports = mongoose.model('Access', accessSchema);
