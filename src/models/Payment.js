const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'succeeded', 'failed', 'refunded'],
    default: 'pending'
  },
  date: {
    type: Date,
    default: Date.now
  },
  subscriptionType: {
    type: String,
    enum: ['basic', 'premium', 'pro'],
    required: true
  }
});

module.exports = mongoose.model('Payment', paymentSchema);
