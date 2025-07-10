const mongoose = require('mongoose');

const objectRepairedSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true
  },
  objectname: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'], 
    default: 'pending'
  },
  creationDate: {
    type: Date,
    default: Date.now
  },
  modificationDate: {
    type: Date,
    default: Date.now
  }
});

objectRepairedSchema.pre('save', function(next) {
  this.modificationDate = new Date();
  next();
});

module.exports = mongoose.model('ObjectRepaired', objectRepairedSchema);
