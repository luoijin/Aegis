const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctor.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate, authorize('doctor'));

// Patients
router.get('/patients', doctorController.getPatients);
router.get('/patients/:id', doctorController.getPatientById);
router.put('/patients/:id/medical-record', doctorController.updateMedicalRecord);

// Health Logs
router.post('/health-logs/:patientId', doctorController.addHealthLog);
router.get('/health-logs/:patientId', doctorController.getHealthLogs);

// Referrals
router.post('/referrals', doctorController.createReferral);
router.get('/referrals/received', doctorController.getReceivedReferrals);
router.put('/referrals/:id/respond', doctorController.respondToReferral);

// Prescriptions
router.post('/prescriptions', doctorController.createPrescription);
router.get('/prescriptions/:patientId', doctorController.getPrescriptions);

// Appointments
router.post('/appointments', doctorController.createAppointment);
router.put('/appointments/:id', doctorController.updateAppointment);

// Notifications
router.get('/notifications', doctorController.getNotifications);
router.put('/notifications/:id/read', doctorController.markNotificationRead);

module.exports = router;