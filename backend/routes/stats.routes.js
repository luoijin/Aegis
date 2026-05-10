const express = require('express');
const router = express.Router();
const statsController = require('../controllers/stats.controller');

router.get('/platform', statsController.getPlatformStats);

module.exports = router;