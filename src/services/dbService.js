const User = require('../models/User');
const RepairObject = require('../models/Objectrepaired');

// Utilisateur
async function createUser(data) {
  const user = new User(data);
  return await user.save();
}

async function findUserByEmail(email) {
  return await User.findOne({ email });
}

// Objet à réparer
async function createRepairObject(data) {
  const obj = new RepairObject(data);
  return await obj.save();
}

async function getUserObjects(userId) {
  return await RepairObject.find({ userId });
}

module.exports = {
  createUser,
  findUserByEmail,
  createRepairObject,
  getUserObjects,
};
