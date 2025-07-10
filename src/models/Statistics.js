const mongoose = require('mongoose');

const statisticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true
    // exemple : 'object_created', 'login', 'payment', 'ia_request'
  },
  date: {
    type: Date,
    default: Date.now
  },
  details: {
    type: mongoose.Schema.Types.Mixed, 
    default: {}
  }
});

module.exports = mongoose.model('Statistics', statisticsSchema);
