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
router.post('/hospitals', adminController.createHospital);
router.put('/hospitals/:id', adminController.updateHospital);
router.delete('/hospitals/:id', adminController.deleteHospital);

// Doctors
router.get('/doctors', adminController.getAllDoctors);
router.put('/doctors/:id', adminController.updateDoctorByAdmin);
router.patch('/doctors/:id/status', adminController.updateDoctorStatus);
router.delete('/doctors/:id', adminController.deleteDoctorByAdmin);

// Patients 
router.get('/patients', adminController.getAllPatients);
router.delete('/patients/:id', adminController.deletePatientByAdmin);
router.put('/patients/:id', adminController.updatePatientByAdmin);

// Specializations CRUD routes
router.get('/specializations', adminController.getSpecializations);
router.post('/specializations', adminController.createSpecialization);
router.put('/specializations/:id', adminController.updateSpecialization);
router.delete('/specializations/:id', adminController.deleteSpecialization);

module.exports = router;