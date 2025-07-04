const ObjectRepaired = require('../models/Objectrepaired');

// Créer un objet à réparer
async function createObject(data) {
  const object = new ObjectRepaired(data);
  return await object.save();
}

// Récupérer tous les objets d’un utilisateur
async function getObjectsByUser(userId) {
  return await ObjectRepaired.find({ userId });
}

// Récupérer un objet par ID
async function getObjectById(id) {
  return await ObjectRepaired.findById(id);
}

// Mettre à jour le statut d’un objet
async function updateObjectStatus(id, status) {
  return await ObjectRepaired.findByIdAndUpdate(
    id,
    { status, modificationDate: new Date() },
    { new: true }
  );
}

// Supprimer un objet
async function deleteObject(id) {
  return await ObjectRepaired.findByIdAndDelete(id);
}

module.exports = {
  createObject,
  getObjectsByUser,
  getObjectById,
  updateObjectStatus,
  deleteObject
};
