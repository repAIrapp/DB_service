const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name:  { type: String, required: true },
  email:      { type: String, required: true, unique: true,match: [/.+@.+\..+/, 'Format email invalide'] },
  password:   { type: String }, 
  authType:   { type: String, enum: ['local', 'oauth'], default: 'local' },
  oauthProvider: { type: String, enum: ['google', 'facebook', null], default: null },
  preferences: {
    notificationsActivated: { type: Boolean, default: true }
  },
  subscription: {
    type:       { type: String, enum: ['basic', 'premium', 'pro'], default: 'basic' },
    date_start: { type: Date },
    date_end:   { type: Date , default: null},
    status:     { type: String, enum: ['active', 'inactive', 'expired'], default: 'inactive' }
  },
  createdAt: { type: Date, default: Date.now },
  emailVerified: {
  type: Boolean,
  default: false
}

});

userSchema.pre('save', async function (next) {
  if (this.isModified('password') && this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
