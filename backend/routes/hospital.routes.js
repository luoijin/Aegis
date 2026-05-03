const express = require('express');
const router = express.Router();
const hospitalController = require('../controllers/hospital.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Public routes (authenticated users can view hospitals)
router.get('/', authenticate, hospitalController.getHospitals);
router.get('/:id', authenticate, hospitalController.getHospitalById);

// Admin only routes
router.post('/', authenticate, authorize('admin'), hospitalController.createHospital);
router.put('/:id', authenticate, authorize('admin'), hospitalController.updateHospital);
router.delete('/:id', authenticate, authorize('admin'), hospitalController.deleteHospital);

module.exports = router;