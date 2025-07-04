const User = require('../models/User');

// Créer un utilisateur
async function createUser(data) {
  const existing = await User.findOne({ email: data.email });
  if (existing) throw new Error('Email déjà utilisé');

  const user = new User(data);
  return await user.save();
}

// Récupérer un utilisateur par email
async function getUserByEmail(email) {
  return await User.findOne({ email });
}

// Récupérer un utilisateur par ID
async function getUserById(id) {
  return await User.findById(id);
}

// Mettre à jour les préférences
async function updateUserPreferences(id, preferences) {
  return await User.findByIdAndUpdate(id, { preferences }, { new: true });
}

module.exports = {
  createUser,
  getUserByEmail,
  getUserById,
  updateUserPreferences
};
