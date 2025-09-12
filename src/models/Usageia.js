const mongoose = require('mongoose');

const aiUsageSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  date: { type: String, required: true }, // format YYYY-MM-DD (Europe/Paris)
  count: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now }
});

// Un seul compteur par (userId, date)
aiUsageSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('AiUsage', aiUsageSchema);
