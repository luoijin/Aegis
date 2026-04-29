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

// POST routes - Allow doctors AND admins to create patients
router.post('/', (req, res, next) => {
  if (req.user.role === 'doctor' || req.user.role === 'admin') {
    return patientController.createPatient(req, res, next);
  }
  return res.status(403).json({ message: 'Access denied. Only doctors and admins can create patients.' });
});

router.post('/:patientId/assign-doctor', authorize('doctor'), patientController.assignDoctorToPatient);

// PUT routes
router.put('/:id', authorize('doctor'), patientController.updatePatient);

// DELETE routes
router.delete('/:id', authorize('doctor'), patientController.deletePatient);
router.delete('/:patientId/remove-from-list', authorize('doctor'), patientController.removePatientFromDoctorList);

// Doctor change request routes
router.post('/:patientId/request-doctor-change', authorize('doctor'), patientController.requestDoctorChange);
router.post('/:patientId/approve-doctor-change', authenticate, patientController.approveDoctorChange);
router.post('/:patientId/reject-doctor-change', authenticate, patientController.rejectDoctorChange);
router.get('/:patientId/notifications', authenticate, patientController.getNotifications);
router.patch('/:patientId/notifications/:notificationId/read', authenticate, patientController.markNotificationRead);

module.exports = router;