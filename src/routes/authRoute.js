const express = require('express');
const router = express.Router();
const axios = require("axios");
const { getUserByEmail, createUser } = require('../services/userService');
const { generateToken } = require('../utils/jwt');
const bcrypt = require('bcrypt');

// Route unique pour signup (local OU oauth)
// router.post('/signup', async (req, res) => {
//   try {
//     const { email, password, first_name, last_name, authType, oauthProvider } = req.body;

//     if (!email || !first_name || !last_name || !authType) {
//       return res.status(400).json({ error: 'Champs requis manquants' });
//     }

//     const existing = await getUserByEmail(email);
//     if (existing) return res.status(400).json({ error: 'Email déjà utilisé' });

//     // Cas 1 : Auth locale
//     if (authType === 'local') {
//       if (!password) return res.status(400).json({ error: 'Mot de passe requis' });

//       const newUser = await createUser({
//         email,
//         password,
//         first_name,
//         last_name,
//         authType,
//         oauthProvider: null,
//         preferences: { notificationsActivated: true },
//         subscription: { type: 'basic', status: 'active',date_start: new Date()  }
//       });

//       const token = generateToken(newUser);
//       return res.status(201).json({ token });
//     }

//     // Cas 2 : Auth OAuth (Google, Facebook, etc.)
//     if (authType === 'oauth') {
//       const newUser = await createUser({
//         email,
//         first_name,
//         last_name,
//         authType,
//         oauthProvider,
//         preferences: { notificationsActivated: true },
//         subscription: { type: 'basic', status: 'active',date_start: new Date()  }
//       });

//       const token = generateToken(newUser);
//       return res.status(201).json({ token });
//     }

//     return res.status(400).json({ error: 'Type d\'authentification non reconnu' });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });
router.post('/signup', async (req, res) => {
  try {
    const { email, password, first_name, last_name, authType, oauthProvider } = req.body;

    if (!email || !first_name || !last_name || !authType) {
      return res.status(400).json({ error: 'Champs requis manquants' });
    }

    const existing = await getUserByEmail(email);
    if (existing) return res.status(400).json({ error: 'Email déjà utilisé' });

    // Cas 1 : Auth locale
    if (authType === 'local') {
      if (!password) return res.status(400).json({ error: 'Mot de passe requis' });

      const newUser = await createUser({
        email,
        password,
        first_name,
        last_name,
        authType,
        oauthProvider: null,
        preferences: { notificationsActivated: true },
        subscription: {
          type: 'basic',
          status: 'active',
          date_start: new Date()
        },
        emailVerified: false // 👈 important
      });

      // ✅ Envoi de l'e-mail de confirmation
      try {
        const confirmationLink = `http://localhost:3000/verify?userId=${newUser._id}`;
        console.log("📤 Envoi de l'e-mail à", newUser.email, "avec lien", confirmationLink);

        await axios.post('http://localhost:3005/api/email/confirmation', {
          email: newUser.email,
          confirmationLink,
        });

        console.log("📧 Email de confirmation envoyé !");
      } catch (err) {
        console.error("❌ Erreur envoi e-mail confirmation :", err.message);
      }

      const token = generateToken(newUser);
      return res.status(201).json({ token });
    }

    // Cas 2 : Auth OAuth
    if (authType === 'oauth') {
      const newUser = await createUser({
        email,
        first_name,
        last_name,
        authType,
        oauthProvider,
        preferences: { notificationsActivated: true },
        subscription: {
          type: 'basic',
          status: 'active',
          date_start: new Date()
        },
        emailVerified: true
      });

      const token = generateToken(newUser);
      return res.status(201).json({ token });
    }

    return res.status(400).json({ error: 'Type d\'authentification non reconnu' });

  } catch (err) {
    console.error("❌ Erreur signup:", err.message);
    res.status(500).json({ error: err.message });
  }
});
// Route unique pour login (local ou oauth)
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

    // Cas 1 : login local
    if (authType === 'local') {
      if (!password) return res.status(400).json({ error: 'Mot de passe requis' });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ error: 'Mot de passe incorrect' });

      const token = generateToken(user);
      return res.json({ token });
    }

    // Cas 2 : login OAuth (appelé depuis le service OAuth)
    if (authType === 'oauth') {
      const token = generateToken(user);
      return res.json({ token });
    }

    return res.status(400).json({ error: 'Type d\'authentification non reconnu' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;

