const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

// GET routes
router.get('/', patientController.getAllPatients);
router.get('/all/for-selection', authorize('doctor'), patientController.getAllPatientsForSelection);
router.get('/:id', patientController.getPatientById);
router.get('/:id/summary', patientController.getPatientHealthSummary);
router.get('/:id/doctors', patientController.getPatientDoctors);

// POST routes
router.post('/', authorize('doctor'), patientController.createPatient);
router.post('/:patientId/assign-doctor', authorize('doctor'), patientController.assignDoctorToPatient);

// PUT routes
router.put('/:id', authorize('doctor'), patientController.updatePatient);

// DELETE routes
router.delete('/:id', authorize('doctor'), patientController.deletePatient);
router.delete('/:patientId/remove-from-list', authorize('doctor'), patientController.removePatientFromDoctorList);

module.exports = router;