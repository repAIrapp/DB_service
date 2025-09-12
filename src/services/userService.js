const User = require('../models/User');

async function createUser(data) {
  try {
    console.log("createUser input:", data);

    const existing = await User.findOne({ email: data.email });
    if (existing) throw new Error('Email déjà utilisé');

    const user = new User({
      email: data.email,
      password: data.password,
      first_name: data.first_name,
      last_name: data.last_name,
      authType: data.authType || 'local',
      oauthProvider: data.oauthProvider || null,
      emailVerified: data.emailVerified || false,
      preferences: data.preferences || { notificationsActivated: true },
      subscription: data.subscription || {
        type: 'basic',
        status: 'active',
        date_start: new Date(),
        date_end: null,
      },
    });

    const savedUser = await user.save();
    console.log("Utilisateur créé:", savedUser._id);
    return savedUser;
  } catch (err) {
    console.error("Erreur dans createUser:", err);
    throw err;
  }
}

// récupérer un utilisateur par email
async function getUserByEmail(email) {
  return await User.findOne({ email });
}

// récupérer un utilisateur par ID
async function getUserById(id) {
  return await User.findById(id);
}

// mettre à jour les préférences
async function updateUserPreferences(id, preferences) {
  return await User.findByIdAndUpdate(id, { preferences }, { new: true });
}

//mettre à jour l'abonnement
async function updateUserSubscription(userId, sub) {
  const update = {
    ...(sub.type        ? { 'subscription.type': sub.type } : {}),
    ...(sub.status      ? { 'subscription.status': sub.status } : {}),
    ...(sub.date_start  ? { 'subscription.date_start': new Date(sub.date_start) } : {}),
    ...(sub.date_end    ? { 'subscription.date_end': new Date(sub.date_end) } : {}),
  };

  return await User.findByIdAndUpdate(
    userId,
    { $set: update },
    { new: true, runValidators: true }
  );
}

module.exports = {
  createUser,
  getUserByEmail,
  getUserById,
  updateUserPreferences,
  updateUserSubscription, 
};
