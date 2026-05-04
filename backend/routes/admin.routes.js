// backend/routes/admin.routes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);
router.use(authorize('admin'));

// Dashboard
router.get('/dashboard/stats', adminController.getDashboardStats);

// Hospitals
router.get('/hospitals', adminController.getHospitals);
router.get('/hospitals/stats', adminController.getAllHospitalsWithStats);
router.get('/hospitals/:id/doctors', adminController.getHospitalWithDoctors);
router.post('/hospitals', adminController.createHospital);
router.put('/hospitals/:id', adminController.updateHospital);
router.delete('/hospitals/:id', adminController.deleteHospital);
router.get('/hospitals/:id', adminController.getHospitalById);

// Doctors
router.get('/doctors', adminController.getAllDoctors);
router.put('/doctors/:id', adminController.updateDoctorByAdmin);
router.patch('/doctors/:id/status', adminController.updateDoctorStatus);
router.delete('/doctors/:id', adminController.deleteDoctorByAdmin);
router.put('/doctors/:doctorId/hospital', adminController.updateDoctorHospital);

// Patients
router.get('/patients', adminController.getAllPatients);
router.put('/patients/:id', adminController.updatePatientByAdmin);
router.patch('/patients/:id/status', adminController.updatePatientStatus);
router.delete('/patients/:id', adminController.deletePatientByAdmin);

// Specializations
router.get('/specializations', adminController.getSpecializations);
router.post('/specializations', adminController.createSpecialization);
router.put('/specializations/:id', adminController.updateSpecialization);
router.delete('/specializations/:id', adminController.deleteSpecialization);
router.post('/specializations/cleanup', adminController.cleanupOrphanedSpecializations);

// Analytics
router.get('/analytics/patients', adminController.getGlobalPatientAnalytics);

module.exports = router;