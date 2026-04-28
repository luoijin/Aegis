const express = require('express');
const router = express.Router();
const { register, login, getProfile, fixMissingPatientRecords } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authenticate, getProfile);
router.post('/fix-patients', authenticate, fixMissingPatientRecords);

module.exports = router;