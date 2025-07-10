const ObjectRepaired = require('../models/Objectrepaired');

// créer un objet à réparer
async function createObject(data) {
  const object = new ObjectRepaired(data);
  return await object.save();
}

// récupérer tous les objets d’un utilisateur
async function getObjectsByUser(userId) {
  return await ObjectRepaired.find({ userId });
}

// récupérer un objet par ID
async function getObjectById(id) {
  return await ObjectRepaired.findById(id);
}

// mettre à jour le statut d’un objet
async function updateObjectStatus(id, status) {
  return await ObjectRepaired.findByIdAndUpdate(
    id,
    { status, modificationDate: new Date() },
    { new: true }
  );
}

// supprimer un objet
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
