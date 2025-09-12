const express = require('express');
const router = express.Router();
const AiUsage = require('../models/Usageia');
const User = require('../models/User'); // ton modèle User déjà existant
const { parisDateKey } = require('../utils/parisDate'); // à créer juste après

// Quotas par plan
const QUOTAS = { basic: 5, premium: 100 };

router.post('/consume', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId requis' });

    // Récupérer le plan depuis User
    const user = await User.findById(userId).lean();
    const plan = user?.subscription?.type === 'premium' ? 'premium' : 'basic';
    const limit = plan === 'premium' ? QUOTAS.premium : QUOTAS.basic;

    // Clé journalière Europe/Paris
    const dateKey = parisDateKey();

    // Incrémenter le compteur (créé si pas encore existant)
    const usage = await AiUsage.findOneAndUpdate(
      { userId, date: dateKey },
      { $inc: { count: 1 }, $set: { updatedAt: new Date() } },
      { upsert: true, new: true }
    );

    const count = usage.count;
    const remaining = Math.max(0, limit - count);

    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', remaining);

    if (count > limit) {
      return res.status(429).json({
        error: 'Quota quotidien atteint',
        message: `Plan ${plan}: ${limit} diagnostics/jour.`,
        limit,
        remaining: 0
      });
    }

    return res.json({ ok: true, plan, limit, remaining });
  } catch (err) {
    console.error('Erreur consommation quota:', err.message);
    return res.status(500).json({ error: 'Erreur interne quota' });
  }
});

module.exports = router;
