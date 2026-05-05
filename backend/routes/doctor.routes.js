const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctor.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Custom middleware to allow both doctor and admin
const authorizeDoctorOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  if (req.user.role === 'doctor' || req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Access denied. Doctor or Admin role required.' });
};

// Apply authentication to all routes
router.use(authenticate);

// ========== DASHBOARD (Doctor only) ==========
router.get('/dashboard/stats', authorize('doctor'), doctorController.getDashboardStats);

// ========== PATIENT MANAGEMENT (Doctor only for write operations) ==========
router.get('/patients', authorize('doctor'), doctorController.getPatients);
router.get('/patients/search', authorize('doctor'), doctorController.searchPatients);
router.put('/patients/:id/medical-record', authorize('doctor'), doctorController.updateMedicalRecord);
router.post('/patients/:patientId/assign', authorize('doctor'), doctorController.assignPatientToDoctor);
router.delete('/patients/:patientId/remove', authorize('doctor'), doctorController.removePatient);

// ========== PATIENT VIEW (Allow both doctor and admin) ==========
router.get('/patients/:id', authorizeDoctorOrAdmin, doctorController.getPatientById);

// ========== HEALTH LOGS (VITALS) ==========
router.post('/patients/:patientId/health-logs', authorize('doctor'), doctorController.addHealthLog);
router.get('/patients/:patientId/health-logs', authorizeDoctorOrAdmin, doctorController.getHealthLogs);
router.get('/patients/:patientId/trends', authorize('doctor'), doctorController.getVitalsTrends);
router.put('/health-logs/:logId', authorize('doctor'), doctorController.updateHealthLog);
router.delete('/health-logs/:logId', authorize('doctor'), doctorController.deleteHealthLog);

// ========== PRESCRIPTION ROUTES ==========
router.get('/prescriptions', authorizeDoctorOrAdmin, doctorController.getPrescriptions);
router.get('/prescriptions/:id', authorizeDoctorOrAdmin, doctorController.getPrescriptionById);
router.post('/prescriptions', authorize('doctor'), doctorController.createPrescription);
router.put('/prescriptions/:id', authorize('doctor'), doctorController.updatePrescription);
router.delete('/prescriptions/:id', authorize('doctor'), doctorController.deletePrescription);

// ========== APPOINTMENT ROUTES ==========
router.get('/appointments', authenticate, authorize('doctor'), doctorController.getAppointments);
router.get('/appointments/stats', authenticate, authorize('doctor'), doctorController.getAppointmentStats);
router.get('/appointments/:id', authenticate, authorize('doctor'), doctorController.getAppointmentById);
router.post('/appointments', authenticate, authorize('doctor'), doctorController.createAppointment);
router.put('/appointments/:id', authenticate, authorize('doctor'), doctorController.updateAppointment);
router.delete('/appointments/:id', authenticate, authorize('doctor'), doctorController.deleteAppointment);

// ========== REFERRAL ROUTES ==========
router.get('/doctors', authenticate, authorize('doctor'), doctorController.getAllDoctors);
router.post('/referrals', authenticate, authorize('doctor'), doctorController.createReferral);
router.get('/referrals/sent', authenticate, authorize('doctor'), doctorController.getSentReferrals);
router.get('/referrals/received', authenticate, authorize('doctor'), doctorController.getReceivedReferrals);
router.get('/referrals', authenticate, authorize('doctor'), doctorController.getReferrals);
router.get('/referrals/:id', authenticate, authorize('doctor'), doctorController.getReferralById);
router.put('/referrals/:id/respond', authenticate, authorize('doctor'), doctorController.respondToReferral);

// ========== CONDITION MANAGEMENT (Doctor only) ==========
router.get('/analytics/conditions', authorize('doctor'), doctorController.getConditionOptions);
router.get('/analytics/patient-stats', authorize('doctor'), doctorController.getPatientAnalytics);
router.post('/patients/:patientId/conditions', authorize('doctor'), doctorController.addPatientCondition);
router.put('/patients/:patientId/conditions/:conditionId', authorize('doctor'), doctorController.updatePatientCondition);
router.delete('/patients/:patientId/conditions/:conditionId', authorize('doctor'), doctorController.deletePatientCondition);

module.exports = router;