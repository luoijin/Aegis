const express = require('express');
const router = express.Router();
const hospitalController = require('../controllers/hospital.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Public routes (for patients and doctors)
router.get('/', authenticate, hospitalController.getHospitals);
router.get('/nearby', authenticate, hospitalController.getNearbyHospitals);
router.get('/:id', authenticate, hospitalController.getHospitalById);

// Admin only routes
router.post('/', authenticate, authorize('admin'), hospitalController.createHospital);
router.put('/:id', authenticate, authorize('admin'), hospitalController.updateHospital);

module.exports = router;