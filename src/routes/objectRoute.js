const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');

const {
  createObject,
  getObjectsByUser,
  getObjectById,
  updateObjectStatus,
  deleteObject
} = require('../services/objectService');

router.post('/', verifyToken, async (req, res) => {
  try {
    const object = await createObject(req.body);
    res.status(201).json(object);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/user/:userId', verifyToken, async (req, res) => {
  if (req.user.id !== req.params.userId) {
    return res.status(403).json({ error: 'Accès non autorisé' });
  }

  try {
    const objects = await getObjectsByUser(req.params.userId);
    res.json(objects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const object = await getObjectById(req.params.id);
    if (!object) return res.status(404).json({ error: 'Objet non trouvé' });
    res.json(object);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/status', verifyToken, async (req, res) => {
  try {
    const object = await updateObjectStatus(req.params.id, req.body.status);
    res.json(object);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await deleteObject(req.params.id);
    res.json({ message: 'Objet supprimé' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
