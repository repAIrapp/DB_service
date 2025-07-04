const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'supersecret';

function generateToken(user) {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      authType: user.authType,
      role: user.role || 'user' // si tu veux gérer les rôles plus tard
    },
    SECRET,
    { expiresIn: '7d' }
  );
}

function verifyToken(token) {
  return jwt.verify(token, SECRET);
}

module.exports = { generateToken, verifyToken };
