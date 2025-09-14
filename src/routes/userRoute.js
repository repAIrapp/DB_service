// const express = require('express');
// const router = express.Router();
// const axios = require("axios");
// const { body, validationResult } = require("express-validator");
// const User = require('../models/User'); 
// const { 
//   createUser,
//   getUserByEmail,
//   getUserById,
//   updateUserPreferences,
//   updateUserSubscription
// } = require('../services/userService');

// const verifyToken = require('../middleware/authMiddleware');
// router.post(
//   '/',
//   [
//     body("email").isEmail().withMessage("Email invalide"),
//     body("first_name").notEmpty().withMessage("Prénom requis"),
//     body("last_name").notEmpty().withMessage("Nom requis"),
//     body("password").isLength({ min: 6 }).withMessage("Mot de passe trop court"),
//   ],
//   async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }

//     try {
//       const user = await createUser(req.body);

//       try {
//         const confirmationLink = `http://localhost:3000/verify?userId=${user._id}`;
//         await axios.post('http://localhost:3005/api/email/confirmation', {
//           email: user.email,
//           confirmationLink,
//         });
//       } catch (err) {
//         console.error("Erreur envoi email confirmation :", err);
//       }

//       res.status(201).json(user);
//     } catch (err) {
//   console.error("Erreur création user :", err); 
//   console.log("ERREUR CAPTURÉE DANS ROUTE :", err.message, err.stack);
//   res.status(500).json({
//     error: err.message,
//     stack: err.stack
//   });
// }

//   }
// );

// router.post('/oauth', async (req, res) => {
//   try {
//     const { email, first_name, last_name, oauthProvider } = req.body;

//     const existing = await getUserByEmail(email);
//     if (existing) return res.status(200).json(existing); // Déjà enregistré

//     const user = await createUser({
//       email,
//       first_name,
//       last_name,
//       authType: 'oauth',
//       oauthProvider,
//       preferences: { notificationsActivated: true },
//       subscription: { type: 'basic', status: 'active' },
//       emailVerified: true 
//     });

//     res.status(201).json(user);
//   } catch (err) {
//     console.error("Erreur création user oauth :", err);
//     res.status(400).json({ error: err.message });
//   }
// });

// //récupérer un utilisateur par email (pas besoin de JWT)
// router.get('/by-email', async (req, res) => {
//   try {
//     const user = await getUserByEmail(req.query.email);
//     if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
//     res.json(user);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // récupérer un utilisateur par ID (protected)
// router.get('/:id', verifyToken, async (req, res) => {
//   if (req.user.id !== req.params.id) {
//     return res.status(403).json({ error: 'Accès non autorisé' });
//   }

//   try {
//     const user = await getUserById(req.params.id);
//     if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
//     res.json(user);
//   } catch (err) {
//     console.error("Erreur getbyemail :", err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // mettre à jour les préférences (protégé)
// router.patch('/:id/preferences', verifyToken, async (req, res) => {
//   if (req.user.id !== req.params.id) {
//     return res.status(403).json({ error: 'Accès non autorisé' });
//   }

//   try {
//     const user = await updateUserPreferences(req.params.id, req.body);
//     res.json(user);
//   } catch (err) {
//     console.error("Erreur création user :", err);
//     res.status(400).json({ error: err.message });
//   }
// });
// // mettre à jour l'abonnement (appelé après paiement)
// router.patch('/subscription/:userId', async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const sub = req.body.subscription || req.body;

//     const user = await updateUserSubscription(userId, sub);
//     if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });

//     return res.json({
//       message: 'Abonnement mis à jour',
//       subscription: user.subscription
//     });
//   } catch (err) {
//     console.error("Erreur user patch subscription:", err);
//     return res.status(500).json({ error: err.message });
//   }
// });

// // vérifier l'email après clic sur le lien de confirmation
// router.patch('/:id/verify-email', async (req, res) => {
//   try {
//     const user = await getUserById(req.params.id);
//     if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });

//     user.emailVerified = true;
//     await user.save();

//     res.json({ message: 'Email vérifié avec succès' });
//   } catch (err) { // eslint-disable-line no-unused-vars
//     console.error("Erreur user patch verify email :", err);
//     res.status(500).json({ error: 'Erreur lors de la vérification de l’email' });
//   }
// });


// module.exports = router;







// services/db/src/routes/user.js (ou équivalent)
// const express = require('express');
// const router = express.Router();
// const axios = require('axios');
// const { body, validationResult } = require('express-validator');

// const {
//   createUser,
//   getUserByEmail,
//   getUserById,
//   updateUserPreferences,
//   updateUserSubscription,
// } = require('../services/userService');

// const verifyToken = require('../middleware/authMiddleware');

// // --- URLs de base ---
// // FRONTEND_URL déjà présent dans ton .env (Render & local)
// const FRONT_BASE_URL =
//   (process.env.FRONTEND_URL || process.env.FRONT_BASE_URL || 'http://localhost:3000').replace(/\/+$/, '');

// // NOTIF_BASE_URL à ajouter sur Render pour le service notif
// // ex: https://ton-notif-service.onrender.com
// const NOTIF_BASE_URL =
//   (process.env.NOTIF_BASE_URL || 'http://localhost:3005').replace(/\/+$/, '');

// // --------------- Routes ---------------

// router.post(
//   '/',
//   [
//     body('email').isEmail().withMessage('Email invalide'),
//     body('first_name').notEmpty().withMessage('Prénom requis'),
//     body('last_name').notEmpty().withMessage('Nom requis'),
//     body('password').isLength({ min: 6 }).withMessage('Mot de passe trop court'),
//   ],
//   async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }

//     try {
//       const user = await createUser(req.body);

//       // -------- Envoi de l'email de confirmation via notif-service --------
//       try {
//         const confirmationLink = `${FRONT_BASE_URL}/verify?userId=${user._id}`;

//         const resp = await axios.post(
//           `${NOTIF_BASE_URL}/api/email/confirmation`,
//           { email: user.email, confirmationLink },
//           { timeout: 10000 }
//         );

//         // log léger pour diagnostiquer en prod sans bruit
//         console.log('[USER][MAIL] notif-service OK:', resp.status, resp.data?.message || resp.data);
//       } catch (err) {
//         // on log l’erreur mais on ne bloque pas la création du user
//         console.error('[USER][MAIL] notif-service FAILED:', {
//           message: err?.message,
//           status: err?.response?.status,
//           data: err?.response?.data,
//         });
//       }
//       // -------------------------------------------------------------------

//       return res.status(201).json(user);
//     } catch (err) {
//       console.error('Erreur création user :', err);
//       return res.status(500).json({ error: err.message });
//     }
//   }
// );

// // OAuth signup (inchangé)
// router.post('/oauth', async (req, res) => {
//   try {
//     const { email, first_name, last_name, oauthProvider } = req.body;

//     const existing = await getUserByEmail(email);
//     if (existing) return res.status(200).json(existing);

//     const user = await createUser({
//       email,
//       first_name,
//       last_name,
//       authType: 'oauth',
//       oauthProvider,
//       preferences: { notificationsActivated: true },
//       subscription: { type: 'basic', status: 'active' },
//       emailVerified: true,
//     });

//     res.status(201).json(user);
//   } catch (err) {
//     console.error('Erreur création user oauth :', err);
//     res.status(400).json({ error: err.message });
//   }
// });

// // récupérer un utilisateur par email (public)
// router.get('/by-email', async (req, res) => {
//   try {
//     const user = await getUserByEmail(req.query.email);
//     if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
//     res.json(user);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // récupérer un utilisateur par ID (protégé)
// router.get('/:id', verifyToken, async (req, res) => {
//   if (req.user.id !== req.params.id) {
//     return res.status(403).json({ error: 'Accès non autorisé' });
//   }

//   try {
//     const user = await getUserById(req.params.id);
//     if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
//     res.json(user);
//   } catch (err) {
//     console.error('Erreur getbyemail :', err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // mettre à jour les préférences (protégé)
// router.patch('/:id/preferences', verifyToken, async (req, res) => {
//   if (req.user.id !== req.params.id) {
//     return res.status(403).json({ error: 'Accès non autorisé' });
//   }

//   try {
//     const user = await updateUserPreferences(req.params.id, req.body);
//     res.json(user);
//   } catch (err) {
//     console.error('Erreur update preferences :', err);
//     res.status(400).json({ error: err.message });
//   }
// });

// // mettre à jour l'abonnement
// router.patch('/subscription/:userId', async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const sub = req.body.subscription || req.body;

//     const user = await updateUserSubscription(userId, sub);
//     if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });

//     return res.json({
//       message: 'Abonnement mis à jour',
//       subscription: user.subscription,
//     });
//   } catch (err) {
//     console.error('Erreur user patch subscription:', err);
//     return res.status(500).json({ error: err.message });
//   }
// });

// // vérifier l'email après clic sur le lien de confirmation
// router.patch('/:id/verify-email', async (req, res) => {
//   try {
//     const user = await getUserById(req.params.id);
//     if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });

//     user.emailVerified = true;
//     await user.save();

//     res.json({ message: 'Email vérifié avec succès' });
//   } catch (err) {
//     console.error('Erreur user patch verify email :', err);
//     res.status(500).json({ error: 'Erreur lors de la vérification de l’email' });
//   }
// });

// module.exports = router;



// services/db/src/routes/userRoute.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
const { body, validationResult } = require('express-validator');

const {
  createUser,
  getUserByEmail,
  getUserById,
  updateUserPreferences,
  updateUserSubscription,
} = require('../services/userService');

const verifyToken = require('../middleware/authMiddleware');

// --------- BASE URLS (prod => FRONTEND_URL obligatoire) ----------
const isProd = process.env.NODE_ENV === 'production';

const FRONT_BASE_URL = (() => {
  const v = (process.env.FRONTEND_URL || '').trim().replace(/\/+$/, '');
  if (isProd && !v) throw new Error('FRONTEND_URL manquante en production');
  return v || 'http://localhost:3000';
})();

const NOTIF_BASE_URL = (() => {
  const v = (process.env.NOTIF_BASE_URL || '').trim().replace(/\/+$/, '');
  // en prod on préfère aussi forcer sa présence pour éviter un fallback
  if (isProd && !v) throw new Error('NOTIF_BASE_URL manquante en production');
  return v || 'http://localhost:3005';
})();

// ---------------------------------------------------------------

// création utilisateur (classique)
router.post(
  '/',
  [
    body('email').isEmail().withMessage('Email invalide'),
    body('first_name').notEmpty().withMessage('Prénom requis'),
    body('last_name').notEmpty().withMessage('Nom requis'),
    body('password').isLength({ min: 6 }).withMessage('Mot de passe trop court'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const user = await createUser(req.body);

      // ---- Envoi e-mail confirmation (non bloquant) ----
      const confirmationLink = `${FRONT_BASE_URL}/verify?userId=${user._id}`;
      console.log('[USER][MAIL] FRONTEND_URL used =', FRONT_BASE_URL);
      console.log('[USER][MAIL] confirmationLink =', confirmationLink);

      try {
        const resp = await axios.post(
          `${NOTIF_BASE_URL}/api/email/confirmation`,
          { email: user.email, confirmationLink },
          { timeout: 10000 }
        );
        console.log('[USER][MAIL] notif-service OK:', resp.status, resp.data?.message || resp.data);
      } catch (err) {
        const aj = err?.toJSON?.() || {};
        console.error('[USER][MAIL] notif-service FAILED:', {
          message: err?.message,
          code: err?.code || aj.code,
          urlTried: err?.config?.url,
          status: err?.response?.status,
          data: err?.response?.data,
        });
      }
      // ---------------------------------------------------

      return res.status(201).json(user);
    } catch (err) {
      console.error('Erreur création user :', err);
      return res.status(500).json({ error: err.message });
    }
  }
);

// signup OAuth (inchangé, pas d’email de confirmation)
router.post('/oauth', async (req, res) => {
  try {
    const { email, first_name, last_name, oauthProvider } = req.body;

    const existing = await getUserByEmail(email);
    if (existing) return res.status(200).json(existing);

    const user = await createUser({
      email,
      first_name,
      last_name,
      authType: 'oauth',
      oauthProvider,
      preferences: { notificationsActivated: true },
      subscription: { type: 'basic', status: 'active' },
      emailVerified: true,
    });

    res.status(201).json(user);
  } catch (err) {
    console.error('Erreur création user oauth :', err);
    res.status(400).json({ error: err.message });
  }
});

// récupérer un utilisateur par email (public)
router.get('/by-email', async (req, res) => {
  try {
    const user = await getUserByEmail(req.query.email);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// récupérer un utilisateur par ID (protégé)
router.get('/:id', verifyToken, async (req, res) => {
  if (req.user.id !== req.params.id) {
    return res.status(403).json({ error: 'Accès non autorisé' });
  }

  try {
    const user = await getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json(user);
  } catch (err) {
    console.error('Erreur getbyemail :', err);
    res.status(500).json({ error: err.message });
  }
});

// mettre à jour les préférences (protégé)
router.patch('/:id/preferences', verifyToken, async (req, res) => {
  if (req.user.id !== req.params.id) {
    return res.status(403).json({ error: 'Accès non autorisé' });
  }

  try {
    const user = await updateUserPreferences(req.params.id, req.body);
    res.json(user);
  } catch (err) {
    console.error('Erreur update preferences :', err);
    res.status(400).json({ error: err.message });
  }
});

// mise à jour abonnement
router.patch('/subscription/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const sub = req.body.subscription || req.body;

    const user = await updateUserSubscription(userId, sub);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });

    return res.json({
      message: 'Abonnement mis à jour',
      subscription: user.subscription,
    });
  } catch (err) {
    console.error('Erreur user patch subscription:', err);
    return res.status(500).json({ error: err.message });
  }
});

// vérification d’e-mail après clic
router.patch('/:id/verify-email', async (req, res) => {
  try {
    const user = await getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });

    user.emailVerified = true;
    await user.save();

    res.json({ message: 'Email vérifié avec succès' });
  } catch (err) {
    console.error('Erreur user patch verify email :', err);
    res.status(500).json({ error: 'Erreur lors de la vérification de l’email' });
  }
});

module.exports = router;
