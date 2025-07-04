// const express = require('express');
// const router = express.Router();
// const {
//   createIARequest,
//   getIARequestsByUser,
//   getIARequestById,
//   updateIAResult
// } = require('../services/iarequestService');

// // ➕ Créer une requête IA (image + texte descriptif)
// router.post('/', async (req, res) => {
//   try {
//     const iaRequest = await createIARequest(req.body);
//     res.status(201).json(iaRequest);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// // 📋 Obtenir toutes les requêtes d’un utilisateur
// router.get('/user/:userId', async (req, res) => {
//   try {
//     const requests = await getIARequestsByUser(req.params.userId);
//     res.json(requests);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // 🔎 Obtenir une requête IA par ID
// router.get('/:id', async (req, res) => {
//   try {
//     const request = await getIARequestById(req.params.id);
//     if (!request) return res.status(404).json({ error: 'Requête IA non trouvée' });
//     res.json(request);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // 🧠 Mettre à jour le résultat généré par l’IA
// router.patch('/:id/result', async (req, res) => {
//   try {
//     const updated = await updateIAResult(req.params.id, req.body.resultIA);
//     res.json(updated);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// module.exports = router;


const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');

const {
  createIARequest,
  getIARequestsByUser,
  getIARequestById,
  updateIAResult
} = require('../services/iarequestService');

// ➕ Créer une requête IA (auth requis)
router.post('/', verifyToken, async (req, res) => {
  try {
    const iaRequest = await createIARequest(req.body);
    res.status(201).json(iaRequest);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 📋 Obtenir toutes les requêtes d’un utilisateur (auth requis)
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

// 🔎 Obtenir une requête IA par ID (optionnellement protégé)
router.get('/:id', async (req, res) => {
  try {
    const request = await getIARequestById(req.params.id);
    if (!request) return res.status(404).json({ error: 'Requête IA non trouvée' });
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//  Mettre à jour le résultat généré par l’IA (optionnel, interne)
router.patch('/:id/result', verifyToken, async (req, res) => {
  try {
    const updated = await updateIAResult(req.params.id, req.body.resultIA);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
