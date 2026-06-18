const mongoose = require('mongoose');

// Audit trail for every Razorpay order created for the notes bundle.
const paymentSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  orderId: {
    type: String,
    required: true,
    unique: true, // razorpay_order_id
  },
  paymentId: {
    type: String, // razorpay_payment_id, set after a successful capture
  },
  amount: {
    type: Number,
    required: true, // amount in paise
  },
  currency: {
    type: String,
    default: 'INR',
  },
  status: {
    type: String,
    enum: ['created', 'paid', 'failed'],
    default: 'created',
  },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
