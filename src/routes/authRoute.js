// const express = require('express');
// const router = express.Router();
// const axios = require("axios");
// const { getUserByEmail, createUser } = require('../services/userService');
// const { generateToken } = require('../utils/jwt');
// const bcrypt = require('bcrypt');
// const { body, validationResult } = require('express-validator');

// // --- RÈGLES DE MOT DE PASSE ---
// const passwordRules = [
//   body('password')
//     .if(body('authType').equals('local'))
//     .isString().withMessage('Mot de passe invalide')
//     .isLength({ min: 12, max: 128 }).withMessage('Au moins 12 caractères')
//     .matches(/[a-z]/).withMessage('Au moins une minuscule')
//     .matches(/[A-Z]/).withMessage('Au moins une majuscule')
//     .matches(/\d/).withMessage('Au moins un chiffre')
//     .matches(/[^\w\s]/).withMessage('Au moins un caractère spécial')
//     .custom((value, { req }) => {
//       const lower = value.toLowerCase();
//       const parts = [
//         req.body.first_name,
//         req.body.last_name,
//         (req.body.email || '').split('@')[0],
//       ].filter(Boolean).map(s => String(s).toLowerCase());
//       if (parts.some(p => p.length >= 3 && lower.includes(p))) {
//         throw new Error('Ne pas inclure votre nom/prénom/email');
//       }
//       if (/(.)\1{2,}/.test(value)) throw new Error('Évitez les répétitions (aaa, !!!)');
//       if (/0123|1234|2345|3456|4567|5678|6789|9876|8765/i.test(value)) {
//         throw new Error('Évitez les suites de chiffres');
//       }
//       return true;
//     }),
//   body('confirmPassword')
//     .if(body('authType').equals('local'))
//     .exists().withMessage('Confirmation requise')
//     .bail()
//     .custom((v, { req }) => v === req.body.password)
//     .withMessage('Les mots de passe ne correspondent pas'),
// ];

// router.post(
//   '/signup',
//   [
//     body('email').isEmail().withMessage('Email invalide'),
//     body('first_name').isString().isLength({ min: 1 }).withMessage('Prénom requis'),
//     body('last_name').isString().isLength({ min: 1 }).withMessage('Nom requis'),
//     body('authType').isIn(['local', 'oauth']).withMessage('Type auth invalide'),
//     body('password').if(body('authType').equals('local')).exists().withMessage('Mot de passe requis'),
//     ...passwordRules,
//   ],
//   async (req, res) => {
//     try {
//       //NE DÉCLARER QU’UNE SEULE FOIS
//       const valErrors = validationResult(req);
//       if (!valErrors.isEmpty()) {
//         console.warn('Signup validation failed:', valErrors.array());
//         return res.status(400).json({
//           errors: valErrors.array().map(e => ({ field: e.path, msg: e.msg })),
//         });
//       }

//       const { email, password, first_name, last_name, authType, oauthProvider } = req.body;

//       const existing = await getUserByEmail(email);
//       if (existing) {
//         console.warn('Signup blocked: email already used ->', email);
//         return res.status(400).json({ error: 'Email déjà utilisé' });
//       }

//       if (authType === 'local') {
//         // PAS DE hash ici : le modèle Mongoose fait déjà le hash en pre('save')
//         const newUser = await createUser({
//           email,
//           password, // en clair ici, le hook Mongoose hashera une seule fois
//           first_name,
//           last_name,
//           authType,
//           oauthProvider: null,
//           preferences: { notificationsActivated: true },
//           subscription: { type: 'basic', status: 'active', date_start: new Date() },
//           emailVerified: false
//         });

//         // Email de confirmation (non bloquant)
//         try {
//           const confirmationLink = `http://localhost:3000/verify?userId=${newUser._id}`;
//           await axios.post('http://localhost:3005/api/email/confirmation', {
//             email: newUser.email,
//             confirmationLink,
//           });
//         } catch (err) {
//           console.error("Erreur envoi e-mail confirmation :", err.message);
//           console.error("Détails notif-service :", err.response?.status, err.response?.data);
//         }

//         const token = generateToken(newUser);
//         return res.status(201).json({ token });
//       }

//       if (authType === 'oauth') {
//         const newUser = await createUser({
//           email,
//           first_name,
//           last_name,
//           authType,
//           oauthProvider,
//           preferences: { notificationsActivated: true },
//           subscription: { type: 'basic', status: 'active', date_start: new Date() },
//           emailVerified: true
//         });
//         const token = generateToken(newUser);
//         return res.status(201).json({ token });
//       }

//       return res.status(400).json({ error: "Type d'authentification non reconnu" });
//     } catch (err) {
//       console.error("Erreur signup:", err.message);
//       res.status(500).json({ error: err.message });
//     }
//   }
// );

// router.post('/login', async (req, res) => {
//   try {
//     const { email, password, authType } = req.body;

//     if (!email || !authType) {
//       return res.status(400).json({ error: 'Champs requis manquants' });
//     }

//     const user = await getUserByEmail(email);
//     if (!user || user.authType !== authType) {
//       return res.status(401).json({ error: 'Utilisateur non trouvé ou type incorrect' });
//     }

//     if (authType === 'local') {
//       if (!password) return res.status(400).json({ error: 'Mot de passe requis' });
//       const isMatch = await bcrypt.compare(password, user.password);
//       if (!isMatch) return res.status(401).json({ error: 'Mot de passe incorrect' });

//       const token = generateToken(user);
//       return res.json({ token });
//     }

//     if (authType === 'oauth') {
//       const token = generateToken(user);
//       return res.json({ token });
//     }

//     return res.status(400).json({ error: 'Type d\'authentification non reconnu' });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// module.exports = router;



// services/db/src/routes/auth.js (ou authRoute.js)
const express = require('express');
const router = express.Router();
const axios = require('axios');
const { getUserByEmail, createUser } = require('../services/userService');
const { generateToken } = require('../utils/jwt');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');

// --- Bases URL depuis l'environnement ---
const FRONT_BASE_URL = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/+$/, '');
const NOTIF_BASE_URL = (process.env.NOTIF_BASE_URL || 'http://localhost:3005').replace(/\/+$/, '');

// --- RÈGLES DE MOT DE PASSE ---
const passwordRules = [
  body('password')
    .if(body('authType').equals('local'))
    .isString().withMessage('Mot de passe invalide')
    .isLength({ min: 12, max: 128 }).withMessage('Au moins 12 caractères')
    .matches(/[a-z]/).withMessage('Au moins une minuscule')
    .matches(/[A-Z]/).withMessage('Au moins une majuscule')
    .matches(/\d/).withMessage('Au moins un chiffre')
    .matches(/[^\w\s]/).withMessage('Au moins un caractère spécial')
    .custom((value, { req }) => {
      const lower = value.toLowerCase();
      const parts = [
        req.body.first_name,
        req.body.last_name,
        (req.body.email || '').split('@')[0],
      ].filter(Boolean).map(s => String(s).toLowerCase());
      if (parts.some(p => p.length >= 3 && lower.includes(p))) {
        throw new Error('Ne pas inclure votre nom/prénom/email');
      }
      if (/(.)\1{2,}/.test(value)) throw new Error('Évitez les répétitions (aaa, !!!)');
      if (/0123|1234|2345|3456|4567|5678|6789|9876|8765/i.test(value)) {
        throw new Error('Évitez les suites de chiffres');
      }
      return true;
    }),
  body('confirmPassword')
    .if(body('authType').equals('local'))
    .exists().withMessage('Confirmation requise')
    .bail()
    .custom((v, { req }) => v === req.body.password)
    .withMessage('Les mots de passe ne correspondent pas'),
];

// ==================== ROUTES ====================

router.post(
  '/signup',
  [
    body('email').isEmail().withMessage('Email invalide'),
    body('first_name').isString().isLength({ min: 1 }).withMessage('Prénom requis'),
    body('last_name').isString().isLength({ min: 1 }).withMessage('Nom requis'),
    body('authType').isIn(['local', 'oauth']).withMessage('Type auth invalide'),
    body('password').if(body('authType').equals('local')).exists().withMessage('Mot de passe requis'),
    ...passwordRules,
  ],
  async (req, res) => {
    try {
      const valErrors = validationResult(req);
      if (!valErrors.isEmpty()) {
        console.warn('Signup validation failed:', valErrors.array());
        return res.status(400).json({
          errors: valErrors.array().map(e => ({ field: e.path, msg: e.msg })),
        });
      }

      const { email, password, first_name, last_name, authType, oauthProvider } = req.body;

      const existing = await getUserByEmail(email);
      if (existing) {
        console.warn('Signup blocked: email already used ->', email);
        return res.status(400).json({ error: 'Email déjà utilisé' });
      }

      if (authType === 'local') {
        // Le hook Mongoose hash déjà
        const newUser = await createUser({
          email,
          password,
          first_name,
          last_name,
          authType,
          oauthProvider: null,
          preferences: { notificationsActivated: true },
          subscription: { type: 'basic', status: 'active', date_start: new Date() },
          emailVerified: false,
        });

        // Email de confirmation (non bloquant)
        const confirmationLink = `${FRONT_BASE_URL}/verify?userId=${newUser._id}`;
        try {
          console.log('[AUTH][MAIL] call ->', `${NOTIF_BASE_URL}/api/email/confirmation`, {
            email: newUser.email, confirmationLink
          });

          const resp = await axios.post(
            `${NOTIF_BASE_URL}/api/email/confirmation`,
            { email: newUser.email, confirmationLink },
            { timeout: 10000 }
          );

          console.log('[AUTH][MAIL] notif-service OK:', resp.status, resp.data?.message || resp.data);
        } catch (err) {
          const aj = err?.toJSON?.() || {};
          console.error('[AUTH][MAIL] notif-service FAILED:', {
            message: err?.message,
            code: err?.code || aj.code,
            urlTried: err?.config?.url,
            status: err?.response?.status,
            data: err?.response?.data,
          });
        }

        const token = generateToken(newUser);
        return res.status(201).json({ token });
      }

      if (authType === 'oauth') {
        const newUser = await createUser({
          email,
          first_name,
          last_name,
          authType,
          oauthProvider,
          preferences: { notificationsActivated: true },
          subscription: { type: 'basic', status: 'active', date_start: new Date() },
          emailVerified: true,
        });
        const token = generateToken(newUser);
        return res.status(201).json({ token });
      }

      return res.status(400).json({ error: "Type d'authentification non reconnu" });
    } catch (err) {
      console.error('Erreur signup:', err.message);
      res.status(500).json({ error: err.message });
    }
  }
);

router.post('/login', async (req, res) => {
  try {
    const { email, password, authType } = req.body;

    if (!email || !authType) {
      return res.status(400).json({ error: 'Champs requis manquants' });
    }

    const user = await getUserByEmail(email);
    if (!user || user.authType !== authType) {
      return res.status(401).json({ error: 'Utilisateur non trouvé ou type incorrect' });
    }

    if (authType === 'local') {
      if (!password) return res.status(400).json({ error: 'Mot de passe requis' });
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ error: 'Mot de passe incorrect' });

      const token = generateToken(user);
      return res.json({ token });
    }

    if (authType === 'oauth') {
      const token = generateToken(user);
      return res.json({ token });
    }

    return res.status(400).json({ error: "Type d'authentification non reconnu" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
