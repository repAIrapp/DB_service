const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  objectrepairedId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ObjectRepaired',
    required: true
  },
  type: {
    type: String,
    enum: ['info', 'warning', 'success', 'error', 'status_update'], 
    required: true
  },
  message: {
    type: String,
    required: true
  },
  sendDate: {
    type: Date,
    default: Date.now
  },
  objectStatus: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'], 
    default: 'pending'
  }
});

module.exports = mongoose.model('Notification', notificationSchema);
