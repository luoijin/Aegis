const express = require('express');
const router = express.Router();
const User = require('../models/User.model');
const { register, login, getProfile, createDoctorByAdmin, fixMissingPatientRecords } = require('../controllers/auth.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// ========== PUBLIC ROUTES ==========
router.post('/login', login);

// ========== PROTECTED ROUTES ==========
router.get('/profile', authenticate, getProfile);

// Update profile (doctor/patient can update their own profile)
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { firstName, lastName, phone } = req.body;
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (firstName) user.profile.firstName = firstName;
    if (lastName) user.profile.lastName = lastName;
    if (phone) user.profile.phone = phone;
    
    await user.save();
    
    res.json({ 
      message: 'Profile updated successfully', 
      profile: user.profile 
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Change password
router.put('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }
    
    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ========== REGISTRATION ROUTES ==========
// Admin-only: Create doctor account (must be before the register route)
router.post('/create-doctor', authenticate, authorize('admin'), createDoctorByAdmin);

// Public registration (only patients)
router.post('/register', register);

// ========== ADMIN ONLY ROUTES ==========
router.post('/fix-patient-records', authenticate, authorize('doctor'), fixMissingPatientRecords);

module.exports = router;