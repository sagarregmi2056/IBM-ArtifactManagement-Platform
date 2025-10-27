const express = require('express');
const router = express.Router();
const syncRoutes = require('./syncRoutes');
const chatRoutes = require('./chatRoutes');

router.use('/sync', syncRoutes);
router.use('/chat', chatRoutes);

module.exports = router;
