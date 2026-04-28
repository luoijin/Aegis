const express = require('express');
const router = express.Router();
const { register, login, getProfile, createDoctorByAdmin } = require('../controllers/auth.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', authenticate, getProfile);

// Admin-only routes
router.post('/create-doctor', authenticate, authorize('admin'), createDoctorByAdmin);

module.exports = router;