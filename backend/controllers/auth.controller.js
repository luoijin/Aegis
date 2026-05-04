const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const Patient = require('../models/Patient.model');
const CryptoJS = require('crypto-js');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
};

exports.register = async (req, res) => {
  try {
    const { email, password, role, profile } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    
    // Determine if this is an admin creating an account
    const isAdmin = req.user && req.user.role === 'admin';
    
    // Determine the role
    let userRole = 'patient';
    
    if (isAdmin) {
      userRole = role === 'doctor' ? 'doctor' : 'patient';
    } else {
      // Public registration - only patients allowed
      if (role === 'doctor') {
        return res.status(403).json({ 
          message: 'Doctor accounts can only be created by administrators.' 
        });
      }
      userRole = 'patient';
    }
    
    // Create user
    const user = new User({
      email,
      password,
      role: userRole,
      profile: profile || {}
    });
    
    await user.save();
    
    // If role is patient, create patient record
    if (user.role === 'patient') {
      const patient = new Patient({
        user: user._id,
        medicalHistory: [],
        allergies: [],
        bloodType: '',
        emergencyContact: {},
        assignedDoctor: null
      });
      await patient.save();
    }
    
    // Only return token for self-registration
    let token = null;
    if (!isAdmin) {
      token = generateToken(user._id);
    }
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({ message: 'Your account has been deactivated. Please contact your administrator.' });
    }
    
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = generateToken(user._id);
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('hospital', 'name address phone');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fix missing patient records for existing users
exports.fixMissingPatientRecords = async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const patientUsers = await User.find({ role: 'patient' });
    let created = 0;
    let existing = 0;
    
    for (const user of patientUsers) {
      const existingPatient = await Patient.findOne({ user: user._id });
      
      if (!existingPatient) {
        await Patient.create({
          user: user._id,
          medicalHistory: [],
          allergies: [],
          bloodType: '',
          emergencyContact: {},
          assignedDoctor: null
        });
        created++;
      } else {
        existing++;
      }
    }
    
    res.json({ 
      message: 'Fix completed', 
      created, 
      existing,
      totalPatientUsers: patientUsers.length 
    });
  } catch (error) {
    console.error('Fix error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Admin-only: Create doctor account
exports.createDoctorByAdmin = async (req, res) => {
  try {
    const { email, password, profile, licenseNumber, specialization, hospital } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    
    // Validate required fields
    if (!profile.firstName || !profile.lastName) {
      return res.status(400).json({ message: 'First name and last name are required' });
    }
    
    // Create doctor user
    const user = new User({
      email,
      password: password || 'doctor123',
      role: 'doctor',
      profile: {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone || ''
      },
      licenseNumber: licenseNumber || '',
      specialization: specialization || '',
      hospital: hospital || null,
      isActive: true
    });
    
    await user.save();
    
    res.status(201).json({ 
      message: 'Doctor created successfully',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        specialization: user.specialization,
        licenseNumber: user.licenseNumber
      }
    });
  } catch (error) {
    console.error('Create doctor error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  register: exports.register,
  login: exports.login,
  getProfile: exports.getProfile,
  fixMissingPatientRecords: exports.fixMissingPatientRecords,
  createDoctorByAdmin: exports.createDoctorByAdmin
};