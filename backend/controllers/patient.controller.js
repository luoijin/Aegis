const User = require('../models/User.model');
const Patient = require('../models/Patient.model');
const HealthLog = require('../models/HealthLog.model');
const Appointment = require('../models/Appointment.model');

const calculateAverage = (numbers) => {
  const validNumbers = numbers.filter(n => n && !isNaN(n));
  if (validNumbers.length === 0) return 0;
  return validNumbers.reduce((a, b) => a + b, 0) / validNumbers.length;
};

// CREATE - Doctor or Admin creates a new patient record
exports.createPatient = async (req, res) => {
  try {
    const patientData = {
      user: req.body.userId,
      medicalHistory: req.body.medicalHistory || [],
      allergies: req.body.allergies || [],
      bloodType: req.body.bloodType || '',
      emergencyContact: req.body.emergencyContact || {},
      assignedDoctor: req.body.assignedDoctor || null  // Admin can assign doctor
    };

    const patient = new Patient(patientData);
    await patient.save();
    
    res.status(201).json(patient);
  } catch (error) {
    console.error('Create patient error:', error);
    res.status(400).json({ message: error.message });
  }
};

// READ - Get all patients for current user
exports.getAllPatients = async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'doctor') {
      query.assignedDoctor = req.user._id;
    } else if (req.user.role === 'patient') {
      query.user = req.user._id;
    }

    const patients = await Patient.find(query)
      .populate('user', 'email profile');
      // .populate('assignedDoctor', 'email profile'); // Comment this out
    
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAvailablePatients = async (req, res) => {
  try {
    console.log('getAvailablePatients called - User role:', req.user?.role);
    
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Access denied. Doctors only.' });
    }
    
    // Get patients that have NO assigned doctor (assignedDoctor is null)
    const patients = await Patient.find({ 
      $or: [
        { assignedDoctor: null },
        { assignedDoctor: { $exists: false } }
      ]
    }).populate('user', 'email profile');
    
    console.log(`Found ${patients.length} available patients`);
    
    res.json(patients);
  } catch (error) {
    console.error('Error in getAvailablePatients:', error);
    res.status(500).json({ message: error.message });
  }
};

// READ - Get all patients for doctor selection
exports.getAllPatientsForSelection = async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Get all patients with their user details
    const patients = await Patient.find({})
      .populate('user', 'email profile');
    
    res.json(patients);
  } catch (error) {
    console.error('Error in getAllPatientsForSelection:', error);
    res.status(500).json({ message: error.message });
  }
};


// READ - Get single patient by ID
exports.getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate('user', 'email profile')
      .populate('assignedDoctor', 'email profile');
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    if (req.user.role === 'patient' && patient.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    if (req.user.role === 'doctor' && patient.assignedDoctor?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE - Doctor adds patient to their practice
exports.assignDoctorToPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const doctorId = req.user._id;
    
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Only doctors can add patients' });
    }
    
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    if (patient.assignedDoctor && patient.assignedDoctor.toString() === doctorId.toString()) {
      return res.status(400).json({ message: 'Patient already in your list' });
    }
    
    patient.assignedDoctor = doctorId;
    await patient.save();
    
    const updatedPatient = await Patient.findById(patientId)
      .populate('user', 'email profile')
      .populate('assignedDoctor', 'email profile');
    
    res.json({ 
      message: 'Patient added successfully', 
      patient: updatedPatient 
    });
  } catch (error) {
    console.error('Assign doctor error:', error);
    res.status(500).json({ message: error.message });
  }
};

// DELETE - Doctor removes patient from list
exports.removePatientFromDoctorList = async (req, res) => {
  try {
    const { patientId } = req.params;
    const doctorId = req.user._id;
    
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    if (patient.assignedDoctor?.toString() !== doctorId.toString()) {
      return res.status(403).json({ message: 'This patient is not in your list' });
    }
    
    patient.assignedDoctor = null;
    await patient.save();
    
    res.json({ message: 'Patient removed from your list' });
  } catch (error) {
    console.error('Remove patient error:', error);
    res.status(500).json({ message: error.message });
  }
};


// UPDATE - Update patient information
exports.updatePatient = async (req, res) => {
  try {
    const updates = ['medicalHistory', 'allergies', 'bloodType', 'emergencyContact'];
    const updateData = {};
    
    updates.forEach(update => {
      if (req.body[update] !== undefined) {
        updateData[update] = req.body[update];
      }
    });

    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    res.json(patient);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE - Permanently delete patient
exports.deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// READ - Get patient health summary
exports.getPatientHealthSummary = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const logs = await HealthLog.find({ patient: req.params.id })
      .sort({ createdAt: -1 })
      .limit(30);

    const summary = {
      recentVitals: logs.slice(0, 7),
      averageHeartRate: calculateAverage(logs.map(l => l.vitals?.heartRate)),
      averageBloodPressure: {
        systolic: calculateAverage(logs.map(l => l.vitals?.bloodPressure?.systolic)),
        diastolic: calculateAverage(logs.map(l => l.vitals?.bloodPressure?.diastolic))
      },
      criticalAlerts: logs.filter(l => l.status === 'critical').length,
      warningAlerts: logs.filter(l => l.status === 'warning').length,
      totalLogs: logs.length
    };

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// READ - Get patient's doctor
exports.getPatientDoctors = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate('assignedDoctor', 'email profile');
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    res.json({
      primaryDoctor: patient.assignedDoctor
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Doctor requests to become patient's primary doctor
exports.requestDoctorChange = async (req, res) => {
  try {
    const { patientId } = req.params;
    const doctorId = req.user._id;
    
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    // Check if already assigned to this doctor
    if (patient.assignedDoctor?.toString() === doctorId.toString()) {
      return res.status(400).json({ message: 'You are already the primary doctor' });
    }
    
    // Check if there's already a pending request
    if (patient.pendingDoctorChange?.status === 'pending') {
      return res.status(400).json({ message: 'There is already a pending request from another doctor' });
    }
    
    const requestingDoctor = await User.findById(doctorId);
    
    // Create pending request
    patient.pendingDoctorChange = {
      requestedDoctor: doctorId,
      requestedAt: new Date(),
      status: 'pending'
    };
    
    // Add notification for patient
    patient.notifications.push({
      type: 'doctor_change_request',
      message: `Dr. ${requestingDoctor.profile?.firstName} ${requestingDoctor.profile?.lastName} has requested to become your primary care physician.`,
      data: {
        doctorId: doctorId,
        doctorName: `Dr. ${requestingDoctor.profile?.firstName} ${requestingDoctor.profile?.lastName}`,
        doctorEmail: requestingDoctor.email,
        currentDoctor: patient.assignedDoctor
      },
      isRead: false,
      createdAt: new Date()
    });
    
    await patient.save();
    
    res.json({ 
      message: 'Request sent to patient for approval',
      pendingRequest: patient.pendingDoctorChange
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Patient approves doctor change request
exports.approveDoctorChange = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    if (!patient.pendingDoctorChange || patient.pendingDoctorChange.status !== 'pending') {
      return res.status(400).json({ message: 'No pending doctor change request' });
    }
    
    const newDoctorId = patient.pendingDoctorChange.requestedDoctor;
    const oldDoctorId = patient.assignedDoctor;
    
    // Update assigned doctor
    patient.assignedDoctor = newDoctorId;
    patient.pendingDoctorChange.status = 'approved';
    
    // Add notification for patient
    patient.notifications.push({
      type: 'doctor_change_approved',
      message: `Your primary care physician has been updated successfully.`,
      data: {
        newDoctorId: newDoctorId,
        oldDoctorId: oldDoctorId
      },
      isRead: false,
      createdAt: new Date()
    });
    
    await patient.save();
    
    res.json({ 
      message: 'Doctor change approved successfully',
      newDoctor: patient.assignedDoctor
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Patient rejects doctor change request
exports.rejectDoctorChange = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    if (!patient.pendingDoctorChange || patient.pendingDoctorChange.status !== 'pending') {
      return res.status(400).json({ message: 'No pending doctor change request' });
    }
    
    patient.pendingDoctorChange.status = 'rejected';
    
    // Add notification for patient
    patient.notifications.push({
      type: 'doctor_change_rejected',
      message: `You have rejected the doctor change request.`,
      isRead: false,
      createdAt: new Date()
    });
    
    await patient.save();
    
    res.json({ message: 'Doctor change request rejected' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get patient notifications
exports.getNotifications = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    res.json({
      notifications: patient.notifications || [],
      unreadCount: (patient.notifications || []).filter(n => !n.isRead).length,
      pendingDoctorChange: patient.pendingDoctorChange
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark notification as read
exports.markNotificationRead = async (req, res) => {
  try {
    const { patientId, notificationId } = req.params;
    
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    const notification = patient.notifications.id(notificationId);
    if (notification) {
      notification.isRead = true;
      await patient.save();
    }
    
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========== PATIENT DASHBOARD FUNCTIONS (ADD THESE) ==========

// Get logged-in patient's own profile
exports.getOwnProfile = async (req, res) => {
  try {
    console.log('=== getOwnProfile called ===');
    console.log('User ID:', req.user._id);
    
    const patient = await Patient.findOne({ user: req.user._id })
      .populate('user', 'email profile isActive')
      .populate('assignedDoctor', 'email profile specialization');
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }
    
    console.log('Patient found:', patient._id);
    res.json(patient);
  } catch (error) {
    console.error('Get own profile error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get patient's own health logs
exports.getMyHealthLogs = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    const healthLogs = await HealthLog.find({ patient: patient._id })
      .populate('recordedBy', 'email profile')
      .sort({ createdAt: -1 });
    
    res.json(healthLogs);
  } catch (error) {
    console.error('Get my health logs error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get patient's own prescriptions
exports.getMyPrescriptions = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    const Prescription = require('../models/Prescription.model');
    const prescriptions = await Prescription.find({ patient: patient._id })
      .populate('doctor', 'email profile specialization')
      .sort({ issuedDate: -1 });
    
    res.json(prescriptions);
  } catch (error) {
    console.error('Get my prescriptions error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get patient's own appointments
exports.getMyAppointments = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    const Appointment = require('../models/Appointment.model');
    const appointments = await Appointment.find({ patient: patient._id })
      .populate('doctor', 'email profile specialization')
      .populate('hospital', 'name address phone')
      .sort({ dateTime: -1 });
    
    res.json(appointments);
  } catch (error) {
    console.error('Get my appointments error:', error);
    res.status(500).json({ message: error.message });
  }
};


// Get patient's own referrals
exports.getMyReferrals = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    const Referral = require('../models/Referral.model');
    const referrals = await Referral.find({ patient: patient._id })
      .populate('fromDoctor', 'email profile specialization')
      .populate('toDoctor', 'email profile specialization')
      .sort({ createdAt: -1 });
    
    res.json(referrals);
  } catch (error) {
    console.error('Get my referrals error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get patient's doctor info
exports.getMyDoctorInfo = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id })
      .populate('assignedDoctor', 'email profile specialization licenseNumber');
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    res.json(patient.assignedDoctor || null);
  } catch (error) {
    console.error('Get my doctor info error:', error);
    res.status(500).json({ message: error.message });
  }
};


// Update patient blood type (Doctor/Admin only)
exports.updatePatientBloodType = async (req, res) => {
  console.log('=== updatePatientBloodType called ===');
  console.log('Params:', req.params);
  console.log('Body:', req.body);
  console.log('User role:', req.user?.role);
  
  try {
    const { id } = req.params;
    const { bloodType } = req.body;
    
    console.log(`Looking for patient with ID: ${id}`);
    
    const patient = await Patient.findById(id);
    if (!patient) {
      console.log('Patient not found!');
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    console.log(`Found patient: ${patient._id}`);
    console.log(`Current blood type: ${patient.bloodType}`);
    console.log(`New blood type: ${bloodType}`);
    
    // Check if doctor has access to this patient
    if (req.user.role === 'doctor') {
      console.log(`Doctor ID: ${req.user._id}`);
      console.log(`Patient assigned doctor: ${patient.assignedDoctor}`);
      if (patient.assignedDoctor?.toString() !== req.user._id.toString()) {
        console.log('Access denied - doctor not assigned to this patient');
        return res.status(403).json({ message: 'Access denied' });
      }
    }
    
    patient.bloodType = bloodType;
    await patient.save();
    
    console.log('Blood type updated successfully!');
    res.json({ message: 'Blood type updated successfully', patient });
  } catch (error) {
    console.error('Update blood type error:', error);
    res.status(500).json({ message: error.message });
  }

};

// Get prescriptions for a specific patient (for doctor)
exports.getPrescriptionsByPatient = async (req, res) => {
  try {
    const { patientId } = req.query;
    if (!patientId) return res.status(400).json({ message: 'patientId required' });
    
    const prescriptions = await Prescription.find({ patient: patientId })
      .populate('doctor', 'email profile')
      .populate('patient', 'user')
      .sort({ issuedDate: -1 });
    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========== ADD THESE FUNCTIONS TO patient.controller.js ==========

// Update patient's own profile (for patient dashboard)
// Update logged-in patient's own profile (DEBUG VERSION)
exports.updateOwnProfile = async (req, res) => {
  try {
    console.log('=== updateOwnProfile START ===');
    console.log('1. User ID:', req.user?._id);
    console.log('2. Request body:', JSON.stringify(req.body, null, 2));
    
    // Check if user exists
    if (!req.user || !req.user._id) {
      console.log('ERROR: No user found in request');
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const { firstName, lastName, phone, dateOfBirth, gender, emergencyContact } = req.body;
    
    // Find the patient
    console.log('3. Looking for patient with user ID:', req.user._id);
    const patient = await Patient.findOne({ user: req.user._id });
    
    if (!patient) {
      console.log('ERROR: Patient not found for user:', req.user._id);
      return res.status(404).json({ message: 'Patient profile not found' });
    }
    
    console.log('4. Patient found:', patient._id);
    
    // Update User model
    const userUpdates = {};
    if (firstName !== undefined) userUpdates['profile.firstName'] = firstName;
    if (lastName !== undefined) userUpdates['profile.lastName'] = lastName;
    if (phone !== undefined) userUpdates['profile.phone'] = phone;
    if (dateOfBirth !== undefined) userUpdates['profile.dateOfBirth'] = dateOfBirth ? new Date(dateOfBirth) : null;
    if (gender !== undefined) userUpdates['profile.gender'] = gender;
    
    console.log('5. User updates:', userUpdates);
    
    if (Object.keys(userUpdates).length > 0) {
      const updatedUser = await User.findByIdAndUpdate(req.user._id, userUpdates, { new: true });
      console.log('6. User updated:', updatedUser?._id);
    }
    
    // Update Patient model - emergency contact
    if (emergencyContact !== undefined) {
      console.log('7. Updating emergency contact:', emergencyContact);
      patient.emergencyContact = {
        name: emergencyContact.name || '',
        relationship: emergencyContact.relationship || '',
        phone: emergencyContact.phone || ''
      };
      await patient.save();
      console.log('8. Emergency contact saved');
    }
    
    // Return updated profile
    const updatedPatient = await Patient.findOne({ user: req.user._id })
      .populate('user', 'email profile isActive')
      .populate('assignedDoctor', 'email profile specialization');
    
    console.log('9. Profile updated successfully');
    console.log('=== updateOwnProfile END ===');
    
    res.json({
      message: 'Profile updated successfully',
      patient: updatedPatient
    });
  } catch (error) {
    console.error('!!! updateOwnProfile ERROR !!!');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get patient's own health summary with age calculation
exports.getMyHealthSummary = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id })
      .populate('user', 'email profile')
      .populate('assignedDoctor', 'email profile specialization');

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Calculate age from dateOfBirth
    const calculateAge = (dob) => {
      if (!dob) return null;
      const birthDate = new Date(dob);
      const diff = Date.now() - birthDate.getTime();
      const ageDate = new Date(diff);
      return Math.abs(ageDate.getUTCFullYear() - 1970);
    };

    // Get recent health logs
    const healthLogs = await HealthLog.find({ patient: patient._id })
      .sort({ createdAt: -1 })
      .limit(10);

    const latestVitals = healthLogs[0]?.vitals || null;

    // Get upcoming appointments
    const Appointment = require('../models/Appointment.model');
    const upcomingAppointments = await Appointment.find({ 
      patient: patient._id,
      dateTime: { $gte: new Date() },
      status: { $nin: ['cancelled', 'completed'] }
    })
    .populate('doctor', 'email profile')
    .sort({ dateTime: 1 })
    .limit(5);

    res.json({
      patient: {
        id: patient._id,
        user: {
          email: patient.user.email,
          profile: {
            firstName: patient.user.profile?.firstName,
            lastName: patient.user.profile?.lastName,
            dateOfBirth: patient.user.profile?.dateOfBirth,
            age: calculateAge(patient.user.profile?.dateOfBirth),
            gender: patient.user.profile?.gender,
            phone: patient.user.profile?.phone
          }
        },
        bloodType: patient.bloodType,
        allergies: patient.allergies,
        conditions: patient.conditions.filter(c => c.isActive !== false),
        emergencyContact: patient.emergencyContact,
        assignedDoctor: patient.assignedDoctor
      },
      latestVitals,
      recentHealthLogs: healthLogs,
      upcomingAppointments,
      stats: {
        totalConditions: patient.conditions.filter(c => c.isActive !== false).length,
        totalAllergies: patient.allergies?.length || 0,
        recentVisits: healthLogs.length
      }
    });
  } catch (error) {
    console.error('Get my health summary error:', error);
    res.status(500).json({ message: error.message });
  }
};