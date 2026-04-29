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
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    
    // Create user
    const user = new User({
      email,
      password,
      role,
      profile
    });
    
    await user.save();
    console.log(`✅ User created: ${email} as ${role}`);
    
    // CRITICAL: If role is patient, create patient record
    if (role === 'patient') {
      const patient = new Patient({
        user: user._id,
        medicalHistory: [],
        allergies: [],
        bloodType: '',
        emergencyContact: {},
        assignedDoctor: null
      });
      await patient.save();
      console.log(`✅ Auto-created patient record for: ${email}`);
    }
    
    const token = generateToken(user._id);
    
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
    
    // CHECK IF ACCOUNT IS ACTIVE
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
    const user = await User.findById(req.user._id).select('-password');
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
    console.log(`Found ${patientUsers.length} patient users`);
    
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
        console.log(`✅ Created patient record for: ${user.email}`);
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
    // Verify admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    
    const { email, password, profile, licenseNumber, specialization, hospital } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    
    // Create doctor user
    const user = new User({
      email,
      password: password || 'doctor123',
      role: 'doctor',
      profile: {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone
      },
      licenseNumber,
      specialization,
      hospital,
      isActive: true
    });
    
    await user.save();
    console.log(`✅ Doctor account created by admin: ${email}`);
    
    res.status(201).json({
      message: 'Doctor account created successfully',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        specialization,
        licenseNumber
      }
    });
  } catch (error) {
    console.error('Doctor creation error:', error);
    res.status(400).json({ message: error.message });
  }
};

exports.updateDoctorStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    const doctor = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    res.json({ 
      message: `Doctor ${isActive ? 'activated' : 'deactivated'} successfully`,
      doctor 
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update patient status (activate/deactivate)
// Update patient status (activate/deactivate)
exports.updatePatientStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    const { id } = req.params;
    
    console.log(`🔧 Updating patient status - Patient ID: ${id}, isActive: ${isActive}`);
    
    // First, find the patient record to get the user ID
    const patient = await Patient.findById(id);
    if (!patient) {
      console.log(`❌ Patient not found with ID: ${id}`);
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    console.log(`📝 Found patient, user ID: ${patient.user}`);
    
    // Update the user's isActive status
    const user = await User.findByIdAndUpdate(
      patient.user,
      { isActive: isActive === true || isActive === 'true' },
      { new: true }
    );
    
    if (!user) {
      console.log(`❌ User not found with ID: ${patient.user}`);
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log(`✅ Patient status updated: ${user.email} is now ${user.isActive ? 'ACTIVE' : 'INACTIVE'}`);
    
    res.json({ 
      message: `Patient ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: user._id,
        email: user.email,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('❌ Update patient status error:', error);
    res.status(400).json({ message: error.message });
  }
};