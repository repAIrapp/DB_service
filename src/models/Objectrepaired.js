const mongoose = require('mongoose');

const objectRepairedSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // 👈 référence à la collection users
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
    enum: ['pending', 'in_progress', 'completed', 'cancelled'], // tu peux adapter
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

// Met à jour automatiquement modificationDate avant chaque save
objectRepairedSchema.pre('save', function(next) {
  this.modificationDate = new Date();
  next();
});

module.exports = mongoose.model('ObjectRepaired', objectRepairedSchema);
