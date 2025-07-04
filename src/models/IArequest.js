const mongoose = require('mongoose');

const iaRequestSchema = new mongoose.Schema({
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
  imageUrl: {
    type: String,
    //required: true
  },
  text: {
    type: String,
    required: true
  },
  resultIA: {
    type: String // résultat retourné par l'IA (description, solution...)
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('IARequest', iaRequestSchema);
