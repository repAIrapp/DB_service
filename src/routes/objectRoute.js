// const express = require('express');
// const router = express.Router();
// const {
//   createObject,
//   getObjectsByUser,
//   getObjectById,
//   updateObjectStatus,
//   deleteObject
// } = require('../services/objectService');

// // ➕ Créer un nouvel objet
// router.post('/', async (req, res) => {
//   try {
//     const object = await createObject(req.body);
//     res.status(201).json(object);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// // 📋 Obtenir tous les objets d’un utilisateur
// router.get('/user/:userId', async (req, res) => {
//   try {
//     const objects = await getObjectsByUser(req.params.userId);
//     res.json(objects);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // 🔎 Obtenir un objet par ID
// router.get('/:id', async (req, res) => {
//   try {
//     const object = await getObjectById(req.params.id);
//     if (!object) return res.status(404).json({ error: 'Objet non trouvé' });
//     res.json(object);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // 🛠️ Mettre à jour le statut de l’objet
// router.patch('/:id/status', async (req, res) => {
//   try {
//     const object = await updateObjectStatus(req.params.id, req.body.status);
//     res.json(object);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// // ❌ Supprimer un objet
// router.delete('/:id', async (req, res) => {
//   try {
//     await deleteObject(req.params.id);
//     res.json({ message: 'Objet supprimé' });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// module.exports = router;


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

// ➕ Créer un nouvel objet (auth requis)
router.post('/', verifyToken, async (req, res) => {
  try {
    const object = await createObject(req.body);
    res.status(201).json(object);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 📋 Obtenir tous les objets d’un utilisateur (auth requis)
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

// 🔎 Obtenir un objet par ID (optionnellement protégé)
router.get('/:id', async (req, res) => {
  try {
    const object = await getObjectById(req.params.id);
    if (!object) return res.status(404).json({ error: 'Objet non trouvé' });
    res.json(object);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🛠️ Mettre à jour le statut de l’objet (auth requis)
router.patch('/:id/status', verifyToken, async (req, res) => {
  try {
    const object = await updateObjectStatus(req.params.id, req.body.status);
    res.json(object);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ❌ Supprimer un objet (auth requis)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await deleteObject(req.params.id);
    res.json({ message: 'Objet supprimé' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
