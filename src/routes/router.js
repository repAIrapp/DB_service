const express = require('express');
const router = express.Router();

const userRoute = require('./userRoute');
const objectRoute = require('./objectRoute');
const iaRoute = require('./iaRoute');
const authRoute= require('./authRoute');

router.use('/users', userRoute);           
router.use('/objects', objectRoute);       
router.use('/ia-requests', iaRoute);       
router.use('/auth', authRoute );

module.exports = router;
