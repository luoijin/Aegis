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