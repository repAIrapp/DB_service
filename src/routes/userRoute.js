// const express = require('express');
// const router = express.Router();
// const {
//   createUser,
//   getUserByEmail,
//   getUserById,
//   updateUserPreferences
// } = require('../services/userService');

// // Créer un utilisateur
// router.post('/', async (req, res) => {
//   try {
//     const user = await createUser(req.body);
//     res.status(201).json(user);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// // Récupérer un utilisateur par email
// router.get('/by-email', async (req, res) => {
//   try {
//     const user = await getUserByEmail(req.query.email);
//     if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
//     res.json(user);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Récupérer un utilisateur par ID
// router.get('/:id', async (req, res) => {
//   try {
//     const user = await getUserById(req.params.id);
//     if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
//     res.json(user);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Mettre à jour les préférences
// router.patch('/:id/preferences', async (req, res) => {
//   try {
//     const user = await updateUserPreferences(req.params.id, req.body);
//     res.json(user);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });
// // Créer un utilisateur via OAuth (appelé par le service OAuth)
// router.post('/oauth', async (req, res) => {
//   try {
//     const { email, first_name, last_name, oauthProvider } = req.body;

//     // Vérifie s’il existe déjà
//     const existing = await getUserByEmail(email);
//     if (existing) return res.status(200).json(existing); // déjà enregistré

//     const user = await createUser({
//       email,
//       first_name,
//       last_name,
//       authType: 'oauth',
//       oauthProvider,
//       preferences: { notificationsActivated: true },
//       subscription: { type: 'basic', status: 'active' }
//     });

//     res.status(201).json(user);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });


// module.exports = router;



const express = require('express');
const router = express.Router();
const {
  createUser,
  getUserByEmail,
  getUserById,
  updateUserPreferences
} = require('../services/userService');

const verifyToken = require('../middleware/authMiddleware');

// ✅ Créer un utilisateur (local)
router.post('/', async (req, res) => {
  try {
    const user = await createUser(req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ Créer un utilisateur via OAuth (appelé par le service OAuth)
router.post('/oauth', async (req, res) => {
  try {
    const { email, first_name, last_name, oauthProvider } = req.body;

    const existing = await getUserByEmail(email);
    if (existing) return res.status(200).json(existing); // Déjà enregistré

    const user = await createUser({
      email,
      first_name,
      last_name,
      authType: 'oauth',
      oauthProvider,
      preferences: { notificationsActivated: true },
      subscription: { type: 'basic', status: 'active' }
    });

    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 🔍 Récupérer un utilisateur par email (pas besoin de JWT)
router.get('/by-email', async (req, res) => {
  try {
    const user = await getUserByEmail(req.query.email);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔐 Récupérer un utilisateur par ID (protégé)
router.get('/:id', verifyToken, async (req, res) => {
  if (req.user.id !== req.params.id) {
    return res.status(403).json({ error: 'Accès non autorisé' });
  }

  try {
    const user = await getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔐 Mettre à jour les préférences (protégé)
router.patch('/:id/preferences', verifyToken, async (req, res) => {
  if (req.user.id !== req.params.id) {
    return res.status(403).json({ error: 'Accès non autorisé' });
  }

  try {
    const user = await updateUserPreferences(req.params.id, req.body);
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
// 🔁 Mettre à jour l'abonnement (appelé après paiement)
router.patch('/subscription/:userId', async (req, res) => {
  try {
    const { type, status, date_start, date_end } = req.body;
    const user = await getUserById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });

    user.subscription = {
      type: type || user.subscription.type,
      status: status || user.subscription.status,
      date_start: date_start ? new Date(date_start) : user.subscription.date_start,
      date_end: date_end ? new Date(date_end) : user.subscription.date_end,
    };

    await user.save();
    res.json({ message: 'Abonnement mis à jour', subscription: user.subscription });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
