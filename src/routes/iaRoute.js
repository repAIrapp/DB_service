const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');

const {
  createIARequest,
  getIARequestsByUser,
  getIARequestById,
  updateIAResult
} = require('../services/iarequestService');

router.post('/', verifyToken, async (req, res) => {
  try {
    const iaRequest = await createIARequest(req.body);
    res.status(201).json(iaRequest);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/user/:userId', verifyToken, async (req, res) => {
  if (req.user.id !== req.params.userId) {
    return res.status(403).json({ error: 'Accès non autorisé' });
  }

  try {
    const requests = await getIARequestsByUser(req.params.userId);
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const request = await getIARequestById(req.params.id);
    if (!request) return res.status(404).json({ error: 'Requête IA non trouvée' });
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/result', verifyToken, async (req, res) => {
  try {
    const updated = await updateIAResult(req.params.id, req.body.resultIA);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
