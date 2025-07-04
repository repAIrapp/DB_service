const express = require('express');
const router = express.Router();

// Import des sous-routeurs
const userRoute = require('./userRoute');
const objectRoute = require('./objectRoute');
const iaRoute = require('./iaRoute');
const authRoute= require('./authRoute');


// Ajout des sous-routeurs
router.use('/users', userRoute);           // /api/users
router.use('/objects', objectRoute);       // /api/objects
router.use('/ia-requests', iaRoute);       // /api/ia-requests
router.use('/auth', authRoute );

module.exports = router;
