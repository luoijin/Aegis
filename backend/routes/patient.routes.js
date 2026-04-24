const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

router.post('/', authorize('doctor'), patientController.createPatient);
router.get('/', patientController.getAllPatients);
router.get('/:id', patientController.getPatientById);
router.put('/:id', authorize('doctor'), patientController.updatePatient);
router.delete('/:id', authorize('doctor'), patientController.deletePatient);
router.get('/:id/summary', patientController.getPatientHealthSummary);

module.exports = router;