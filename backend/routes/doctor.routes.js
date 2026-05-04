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
router.get('/appointments', authorizeDoctorOrAdmin, doctorController.getAppointments);
router.get('/appointments/:id', authorizeDoctorOrAdmin, doctorController.getAppointmentById);
router.get('/appointments/stats', authorize('doctor'), doctorController.getAppointmentStats);
router.post('/appointments', authorize('doctor'), doctorController.createAppointment);
router.put('/appointments/:id', authorize('doctor'), doctorController.updateAppointment);
router.delete('/appointments/:id', authorize('doctor'), doctorController.deleteAppointment);

// ========== REFERRAL ROUTES ==========
router.get('/referrals', authorizeDoctorOrAdmin, doctorController.getReferrals);
router.get('/referrals/sent', authorize('doctor'), doctorController.getSentReferrals);
router.get('/referrals/received', authorize('doctor'), doctorController.getReceivedReferrals);
router.get('/referrals/:id', authorizeDoctorOrAdmin, doctorController.getReferralById);
router.post('/referrals', authorize('doctor'), doctorController.createReferral);
router.put('/referrals/:id/respond', authorize('doctor'), doctorController.respondToReferral);

// ========== CONDITION MANAGEMENT (Doctor only) ==========
router.get('/analytics/conditions', authorize('doctor'), doctorController.getConditionOptions);
router.get('/analytics/patient-stats', authorize('doctor'), doctorController.getPatientAnalytics);
router.post('/patients/:patientId/conditions', authorize('doctor'), doctorController.addPatientCondition);
router.put('/patients/:patientId/conditions/:conditionId', authorize('doctor'), doctorController.updatePatientCondition);
router.delete('/patients/:patientId/conditions/:conditionId', authorize('doctor'), doctorController.deletePatientCondition);

module.exports = router;