const IARequest = require('../models/IArequest');

// créer une requete ia
async function createIARequest(data) {
  const iaRequest = new IARequest(data);
  return await iaRequest.save();
}

// récupérer les requêtes ia par utilisateur
async function getIARequestsByUser(userId) {
  return await IARequest.find({ userId }).populate('objectrepairedId');
}

// récupérer une requête ia par ID
async function getIARequestById(id) {
  return await IARequest.findById(id).populate('objectrepairedId');
}

// mettre à jour le résultat généré par l’ia
async function updateIAResult(id, resultIA) {
  return await IARequest.findByIdAndUpdate(id, { resultIA }, { new: true });
}

module.exports = {
  createIARequest,
  getIARequestsByUser,
  getIARequestById,
  updateIAResult
};
