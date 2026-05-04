const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctor.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// All doctor routes require authentication and doctor role
router.use(authenticate);
router.use(authorize('doctor'));

// ========== DASHBOARD ==========
router.get('/dashboard/stats', doctorController.getDashboardStats);

// ========== PATIENT MANAGEMENT ==========
router.get('/patients', doctorController.getPatients);
router.get('/patients/search', doctorController.searchPatients);
router.get('/patients/:id', doctorController.getPatientById);
router.put('/patients/:id/medical-record', doctorController.updateMedicalRecord);
router.post('/patients/:patientId/assign', doctorController.assignPatientToDoctor);
router.delete('/patients/:patientId/remove', doctorController.removePatient);

// ========== HEALTH LOGS (VITALS) ==========
router.post('/patients/:patientId/health-logs', doctorController.addHealthLog);
router.get('/patients/:patientId/health-logs', doctorController.getHealthLogs);
router.get('/patients/:patientId/trends', doctorController.getVitalsTrends);
router.put('/health-logs/:logId', doctorController.updateHealthLog);
router.delete('/health-logs/:logId', doctorController.deleteHealthLog);

// ========== REFERRAL SYSTEM ==========
router.get('/doctors', doctorController.getAllDoctors);
router.post('/referrals', doctorController.createReferral);
router.get('/referrals/sent', doctorController.getSentReferrals);
router.get('/referrals/received', doctorController.getReceivedReferrals);
router.put('/referrals/:id/respond', doctorController.respondToReferral);
router.get('/referrals/:id', doctorController.getReferralById);

// ========== APPOINTMENT SYSTEM ==========
router.get('/appointments', doctorController.getAppointments);
router.get('/appointments/stats', doctorController.getAppointmentStats);
router.post('/appointments', doctorController.createAppointment);
router.put('/appointments/:id', doctorController.updateAppointment);
router.delete('/appointments/:id', doctorController.deleteAppointment);

// ========== PRESCRIPTION SYSTEM ==========

router.get('/prescriptions', doctorController.getPrescriptions);
router.post('/prescriptions', doctorController.createPrescription);
router.put('/prescriptions/:id', doctorController.updatePrescription);
router.delete('/prescriptions/:id', doctorController.deletePrescription);

// ========== ANALYTICS ==========
router.get('/analytics/patient-stats', doctorController.getPatientAnalytics);
router.get('/analytics/conditions', doctorController.getConditionOptions);
router.post('/patients/:patientId/conditions', doctorController.addPatientCondition);
router.put('/patients/:patientId/conditions/:conditionId', doctorController.updatePatientCondition);

// ========== CONDITION MANAGEMENT ==========
router.get('/analytics/conditions', doctorController.getConditionOptions);
router.post('/patients/:patientId/conditions', doctorController.addPatientCondition);
router.put('/patients/:patientId/conditions/:conditionId', doctorController.updatePatientCondition);
router.delete('/patients/:patientId/conditions/:conditionId', doctorController.deletePatientCondition);

module.exports = router;