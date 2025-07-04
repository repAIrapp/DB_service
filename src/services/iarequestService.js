const IARequest = require('../models/IArequest');

// Créer une requête IA
async function createIARequest(data) {
  const iaRequest = new IARequest(data);
  return await iaRequest.save();
}

// Récupérer les requêtes IA par utilisateur
async function getIARequestsByUser(userId) {
  return await IARequest.find({ userId }).populate('objectrepairedId');
}

// Récupérer une requête IA par ID
async function getIARequestById(id) {
  return await IARequest.findById(id).populate('objectrepairedId');
}

// Mettre à jour le résultat généré par l’IA
async function updateIAResult(id, resultIA) {
  return await IARequest.findByIdAndUpdate(id, { resultIA }, { new: true });
}

module.exports = {
  createIARequest,
  getIARequestsByUser,
  getIARequestById,
  updateIAResult
};
