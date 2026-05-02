const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Apply authentication to all routes
router.use(authenticate);

// ========== TEST ROUTE (remove after testing) ==========
router.get('/test', (req, res) => {
  res.json({ message: 'Patient routes working', userId: req.user?._id });
});

// ========== PATIENT DASHBOARD ROUTES ==========
router.get('/profile', authorize('patient'), patientController.getOwnProfile);
router.get('/my-health-logs', authorize('patient'), patientController.getMyHealthLogs);
router.get('/my-prescriptions', authorize('patient'), patientController.getMyPrescriptions);
router.get('/my-appointments', authorize('patient'), patientController.getMyAppointments);
router.get('/my-referrals', authorize('patient'), patientController.getMyReferrals);
router.get('/my-doctor', authorize('patient'), patientController.getMyDoctorInfo);

// ========== EXISTING ROUTES ==========
router.get('/', patientController.getAllPatients);
router.get('/all/for-selection', authorize('doctor'), patientController.getAllPatientsForSelection);
router.get('/:id', patientController.getPatientById);
router.get('/:id/summary', patientController.getPatientHealthSummary);
router.get('/:id/doctors', patientController.getPatientDoctors);

router.post('/', (req, res, next) => {
  if (req.user.role === 'doctor' || req.user.role === 'admin') {
    return patientController.createPatient(req, res, next);
  }
  return res.status(403).json({ message: 'Access denied. Only doctors and admins can create patients.' });
});

router.post('/:patientId/assign-doctor', authorize('doctor'), patientController.assignDoctorToPatient);
router.put('/:id', authorize('doctor'), patientController.updatePatient);
router.delete('/:id', authorize('doctor'), patientController.deletePatient);
router.delete('/:patientId/remove-from-list', authorize('doctor'), patientController.removePatientFromDoctorList);

router.post('/:patientId/request-doctor-change', authorize('doctor'), patientController.requestDoctorChange);
router.post('/:patientId/approve-doctor-change', authenticate, patientController.approveDoctorChange);
router.post('/:patientId/reject-doctor-change', authenticate, patientController.rejectDoctorChange);
router.get('/:patientId/notifications', authenticate, patientController.getNotifications);
router.patch('/:patientId/notifications/:notificationId/read', authenticate, patientController.markNotificationRead);

// Update patient's blood type
router.put('/blood-type', authenticate, authorize('patient'), patientController.updateBloodType);

module.exports = router;