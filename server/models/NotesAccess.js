const mongoose = require('mongoose');

// One document per email that is entitled to the notes bundle.
// Keyed by email (not a User _id) so an admin can grant access to a
// student who has not logged in yet — the entitlement is matched the
// moment they sign in with that Google account.
const notesAccessSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  grantedVia: {
    type: String,
    enum: ['payment', 'manual'],
    required: true,
  },
  paymentId: {
    type: String, // razorpay_payment_id when granted via payment
  },
  orderId: {
    type: String,
  },
  grantedBy: {
    type: String, // admin email when granted manually
  },
  token: {
    type: String, // access token generated on grant, shown to user + admin
  },
  welcomeEmailSent: {
    type: Boolean,
    default: false, // ensures the purchase email is sent only once
  },
}, { timestamps: true });

module.exports = mongoose.model('NotesAccess', notesAccessSchema);
