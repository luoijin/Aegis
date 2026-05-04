const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Apply authentication to all routes
router.use(authenticate);

// ========== TEST ROUTE ==========
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Patient routes working!', 
    userId: req.user?._id, 
    role: req.user?.role,
    timestamp: new Date()
  });
});

// ========== PATIENT DASHBOARD ROUTES (for patients themselves) ==========
router.get('/profile', authorize('patient'), patientController.getOwnProfile);
router.put('/profile', authorize('patient'), patientController.updateOwnProfile);  // ← NEW
router.get('/health-summary', authorize('patient'), patientController.getMyHealthSummary);  // ← NEW
router.get('/my-health-logs', authorize('patient'), patientController.getMyHealthLogs);
router.get('/my-prescriptions', authorize('patient'), patientController.getMyPrescriptions);
router.get('/my-appointments', authorize('patient'), patientController.getMyAppointments);
router.get('/my-referrals', authorize('patient'), patientController.getMyReferrals);
router.get('/my-doctor', authorize('patient'), patientController.getMyDoctorInfo);

router.get('/profile', authenticate, authorize('patient'), patientController.getOwnProfile);
router.put('/profile', authenticate, authorize('patient'), patientController.updateOwnProfile);

// ========== AVAILABLE PATIENTS FOR DOCTORS ==========
router.get('/available', authorize('doctor'), patientController.getAvailablePatients);

// ========== DOCTOR PATIENT MANAGEMENT ==========
router.post('/:patientId/assign', authorize('doctor'), patientController.assignDoctorToPatient);
router.delete('/:patientId/remove', authorize('doctor'), patientController.removePatientFromDoctorList);

// ========== BLOOD TYPE UPDATE ==========
router.put('/:id/blood-type', authenticate, authorize('doctor', 'admin'), patientController.updatePatientBloodType);

// ========== GENERAL CRUD ROUTES ==========
router.get('/', patientController.getAllPatients);
router.get('/:id', patientController.getPatientById);
router.get('/:id/summary', patientController.getPatientHealthSummary);
router.get('/:id/doctors', patientController.getPatientDoctors);

router.post('/', (req, res, next) => {
  if (req.user.role === 'doctor' || req.user.role === 'admin') {
    return patientController.createPatient(req, res, next);
  }
  return res.status(403).json({ message: 'Access denied. Only doctors and admins can create patients.' });
});

router.put('/:id', authorize('doctor'), patientController.updatePatient);
router.delete('/:id', authorize('doctor'), patientController.deletePatient);

// ========== DOCTOR CHANGE REQUEST ROUTES ==========
router.post('/:patientId/request-doctor-change', authorize('doctor'), patientController.requestDoctorChange);
router.post('/:patientId/approve-doctor-change', authenticate, patientController.approveDoctorChange);
router.post('/:patientId/reject-doctor-change', authenticate, patientController.rejectDoctorChange);
router.get('/:patientId/notifications', authenticate, patientController.getNotifications);
router.patch('/:patientId/notifications/:notificationId/read', authenticate, patientController.markNotificationRead);

module.exports = router;