const mongoose = require('mongoose');
const Patient = require('../models/Patient.model');
const HealthLog = require('../models/HealthLog.model');
const User = require('../models/User.model');
const Referral = require('../models/Referral.model');
const Appointment = require('../models/Appointment.model');
const Prescription = require('../models/Prescription.model');
const notificationController = require('./notification.controller');

// ========== DASHBOARD STATS ==========
exports.getDashboardStats = async (req, res) => {
  try {
    const totalPatients = await Patient.countDocuments({ assignedDoctor: req.user._id });
    const recentHealthLogs = await HealthLog.find()
      .populate('patient')
      .sort({ createdAt: -1 })
      .limit(10);
    const criticalAlerts = await HealthLog.countDocuments({
      status: 'critical',
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });
    
    res.json({
      totalPatients,
      criticalAlerts,
      recentActivity: recentHealthLogs
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ========== PATIENT MANAGEMENT ==========
exports.getPatients = async (req, res) => {
  try {
    const patients = await Patient.find({ assignedDoctor: req.user._id })
      .populate('user', 'email profile isActive')
      .sort({ createdAt: -1 });
    
    res.json(patients);
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.searchPatients = async (req, res) => {
  try {
    const { q } = req.query;
    const patients = await Patient.find({ assignedDoctor: req.user._id })
      .populate('user', 'email profile');
    
    const filtered = patients.filter(patient => {
      const name = `${patient.user?.profile?.firstName} ${patient.user?.profile?.lastName}`.toLowerCase();
      const email = patient.user?.email?.toLowerCase();
      return name.includes(q.toLowerCase()) || email?.includes(q.toLowerCase());
    });
    
    res.json(filtered);
  } catch (error) {
    console.error('Search patients error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate('user', 'email profile isActive')
      .populate('assignedDoctor', 'email profile');
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    // ✅ Allow admin to view any patient
    if (req.user.role === 'admin') {
      return res.json(patient);
    }
    
    // For doctors, check if they are assigned to this patient
    if (patient.assignedDoctor?._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(patient);
  } catch (error) {
    console.error('Get patient by ID error:', error);
    res.status(500).json({ message: error.message });
  }
};


exports.updateMedicalRecord = async (req, res) => {
  try {
    const { medicalHistory, allergies, bloodType, emergencyContact } = req.body;
    const patient = await Patient.findById(req.params.id);
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    // Check if doctor has access
    if (patient.assignedDoctor?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    if (medicalHistory) patient.medicalHistory = medicalHistory;
    if (allergies) patient.allergies = allergies;
    if (bloodType) patient.bloodType = bloodType;
    if (emergencyContact) patient.emergencyContact = emergencyContact;
    
    await patient.save();
    
    res.json({ message: 'Medical record updated', patient });
  } catch (error) {
    console.error('Update medical record error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.assignPatientToDoctor = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    patient.assignedDoctor = req.user._id;
    await patient.save();
    
    res.json({ message: 'Patient assigned successfully', patient });
  } catch (error) {
    console.error('Assign patient error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.removePatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    if (patient.assignedDoctor?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'This patient is not in your list' });
    }
    
    patient.assignedDoctor = null;
    await patient.save();
    
    res.json({ message: 'Patient removed from your list successfully' });
  } catch (error) {
    console.error('Remove patient error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ========== PATIENT ANALYTICS ==========
exports.getPatientAnalytics = async (req, res) => {
  try {
    // Get all patients assigned to this doctor
    const patients = await Patient.find({ assignedDoctor: req.user._id })
      .populate('user', 'profile email');
    
    // Aggregate conditions for pie chart
    const conditionStats = {};
    let totalConditions = 0;
    
    patients.forEach(patient => {
      if (patient.conditions && patient.conditions.length > 0) {
        patient.conditions.forEach(condition => {
          if (condition.isActive) {
            conditionStats[condition.name] = (conditionStats[condition.name] || 0) + 1;
            totalConditions++;
          }
        });
      }
    });
    
    // Calculate percentages and format for pie chart
    const analyticsData = Object.entries(conditionStats).map(([name, count]) => ({
      name,
      value: count,
      percentage: ((count / totalConditions) * 100).toFixed(1)
    }));
    
    // Sort by count descending
    analyticsData.sort((a, b) => b.value - a.value);
    
    res.json({
      totalPatients: patients.length,
      totalConditions,
      conditions: analyticsData,
      patientList: patients.map(p => ({
        id: p._id,
        name: `${p.user?.profile?.firstName} ${p.user?.profile?.lastName}`,
        email: p.user?.email,
        bloodType: p.bloodType,
        conditions: p.conditions.filter(c => c.isActive).map(c => c.name),
        conditionCount: p.conditions.filter(c => c.isActive).length,
        lastVisit: p.updatedAt
      }))
    });
  } catch (error) {
    console.error('Get patient analytics error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ========== CONDITION MANAGEMENT ==========

// Get all available condition options
exports.getConditionOptions = async (req, res) => {
  try {
    const conditions = [
      'Diabetes', 'Hypertension', 'Asthma', 'Heart Disease', 
      'Arthritis', 'COPD', 'Depression', 'Anxiety', 
      'Obesity', 'Thyroid Disorder', 'Kidney Disease',
      'Cancer', 'Stroke', "Alzheimer's", "Parkinson's",
      'Multiple Sclerosis', 'Epilepsy', 'HIV/AIDS',
      'Hepatitis', 'Tuberculosis', 'Pneumonia',
      'Bronchitis', 'Migraine', 'Osteoporosis'
    ];
    res.json(conditions);
  } catch (error) {
    console.error('Get condition options error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Add condition to patient
exports.addPatientCondition = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { name, severity, diagnosedDate, notes } = req.body;
    
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    // Check if doctor has access
    if (patient.assignedDoctor?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Check if condition already exists
    const existingCondition = patient.conditions.find(
      c => c.name === name && c.isActive !== false
    );
    
    if (existingCondition) {
      return res.status(400).json({ message: 'Condition already exists for this patient' });
    }
    
    patient.conditions.push({
      name,
      severity: severity || 'moderate',
      diagnosedDate: diagnosedDate || new Date(),
      isActive: true
    });
    
    await patient.save();
    
    // Create notification for patient (optional)
    const notificationController = require('./notification.controller');
    await notificationController.createNotification(
      patient.user,
      'condition_added',
      '📋 New Medical Condition',
      `Dr. ${req.user.profile?.firstName} ${req.user.profile?.lastName} added ${name} to your medical record.`,
      { condition: name, severity }
    );
    
    res.json({ 
      message: 'Condition added successfully', 
      conditions: patient.conditions 
    });
  } catch (error) {
    console.error('Add condition error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update patient condition
exports.updatePatientCondition = async (req, res) => {
  try {
    const { patientId, conditionId } = req.params;
    const { severity, isActive, notes } = req.body;
    
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    if (patient.assignedDoctor?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const condition = patient.conditions.id(conditionId);
    if (!condition) {
      return res.status(404).json({ message: 'Condition not found' });
    }
    
    if (severity) condition.severity = severity;
    if (isActive !== undefined) condition.isActive = isActive;
    
    await patient.save();
    
    res.json({ 
      message: 'Condition updated successfully', 
      conditions: patient.conditions 
    });
  } catch (error) {
    console.error('Update condition error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.deletePatientCondition = async (req, res) => {
  try {
    const { patientId, conditionId } = req.params;
    
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    if (patient.assignedDoctor?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const condition = patient.conditions.id(conditionId);
    if (!condition) {
      return res.status(404).json({ message: 'Condition not found' });
    }
    
    // Soft delete - mark as inactive
    condition.isActive = false;
    await patient.save();
    
    res.json({ 
      message: 'Condition resolved successfully', 
      conditions: patient.conditions 
    });
  } catch (error) {
    console.error('Delete condition error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ========== HEALTH LOGS (VITALS) ==========
const determineHealthStatus = (vitals) => {
  if (!vitals) return 'normal';
  const { heartRate, bloodPressure, temperature, oxygenSaturation } = vitals;
  
  if (heartRate && (heartRate < 40 || heartRate > 140)) return 'critical';
  if (bloodPressure && (bloodPressure.systolic > 180 || bloodPressure.diastolic > 120)) return 'critical';
  if (temperature && (temperature > 39.5 || temperature < 35)) return 'critical';
  if (oxygenSaturation && oxygenSaturation < 85) return 'critical';
  if (heartRate && (heartRate < 50 || heartRate > 110)) return 'warning';
  if (bloodPressure && (bloodPressure.systolic > 140 || bloodPressure.diastolic > 90)) return 'warning';
  if (temperature && (temperature > 38.5 || temperature < 36)) return 'warning';
  if (oxygenSaturation && oxygenSaturation < 92) return 'warning';
  return 'normal';
};

exports.addHealthLog = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { vitals, symptoms, notes } = req.body;
    
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    // Check if doctor has access
    if (patient.assignedDoctor?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const healthLog = new HealthLog({
      patient: patientId,
      recordedBy: req.user._id,
      vitals: {
        bloodPressure: vitals?.bloodPressure,
        heartRate: vitals?.heartRate,
        temperature: vitals?.temperature,
        respiratoryRate: vitals?.respiratoryRate,
        oxygenSaturation: vitals?.oxygenSaturation,
        bloodGlucose: vitals?.bloodGlucose,
        weight: vitals?.weight,
        height: vitals?.height
      },
      symptoms: symptoms || [],
      notes: notes || '',
      status: determineHealthStatus(vitals)
    });
    
    await healthLog.save();
    
    // Create notification for patient if vitals are critical
    if (healthLog.status === 'critical') {
      await notificationController.createNotification(
        patient.user,
        'vitals_alert',
        '⚠️ Critical Vitals Alert',
        `Your ${new Date().toLocaleDateString()} vitals show critical values. Please contact your doctor immediately.`,
        { healthLogId: healthLog._id, status: 'critical' }
      );
    }
    
    res.status(201).json(healthLog);
  } catch (error) {
    console.error('Add health log error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getHealthLogs = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { startDate, endDate, limit = 100 } = req.query;
    
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    // Check if doctor has access
    if (req.user.role !== 'admin') {
      if (patient.assignedDoctor?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }
    
    let query = { patient: patientId };
    if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    
    const healthLogs = await HealthLog.find(query)
      .populate('recordedBy', 'email profile') // ← IMPORTANT: Populate recordedBy
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    res.json(healthLogs);
  } catch (error) {
    console.error('Get health logs error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getVitalsTrends = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { days = 30 } = req.query;
    
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    // Check if doctor has access
    if (patient.assignedDoctor?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const logs = await HealthLog.find({
      patient: patientId,
      createdAt: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) }
    }).sort({ createdAt: 1 });

    const trends = {
      heartRate: logs.map(log => ({
        date: log.createdAt,
        value: log.vitals?.heartRate
      })).filter(item => item.value),
      bloodPressureSystolic: logs.map(log => ({
        date: log.createdAt,
        value: log.vitals?.bloodPressure?.systolic
      })).filter(item => item.value),
      bloodPressureDiastolic: logs.map(log => ({
        date: log.createdAt,
        value: log.vitals?.bloodPressure?.diastolic
      })).filter(item => item.value),
      temperature: logs.map(log => ({
        date: log.createdAt,
        value: log.vitals?.temperature
      })).filter(item => item.value),
      weight: logs.map(log => ({
        date: log.createdAt,
        value: log.vitals?.weight
      })).filter(item => item.value)
    };

    res.json(trends);
  } catch (error) {
    console.error('Get vitals trends error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateHealthLog = async (req, res) => {
  try {
    const { logId } = req.params;
    const { vitals, symptoms, notes } = req.body;
    
    const healthLog = await HealthLog.findById(logId).populate('patient');
    if (!healthLog) {
      return res.status(404).json({ message: 'Health log not found' });
    }
    
    const patient = await Patient.findById(healthLog.patient._id);
    if (patient.assignedDoctor?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    if (vitals) {
      healthLog.vitals = { ...healthLog.vitals, ...vitals };
      healthLog.status = determineHealthStatus(healthLog.vitals);
    }
    if (symptoms) healthLog.symptoms = symptoms;
    if (notes) healthLog.notes = notes;
    
    await healthLog.save();
    res.json(healthLog);
  } catch (error) {
    console.error('Update health log error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.deleteHealthLog = async (req, res) => {
  try {
    const { logId } = req.params;
    
    const healthLog = await HealthLog.findById(logId).populate('patient');
    if (!healthLog) {
      return res.status(404).json({ message: 'Health log not found' });
    }
    
    const patient = await Patient.findById(healthLog.patient._id);
    if (patient.assignedDoctor?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    await HealthLog.findByIdAndDelete(logId);
    res.json({ message: 'Health log deleted successfully' });
  } catch (error) {
    console.error('Delete health log error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ========== REFERRAL SYSTEM ==========
exports.getAllDoctors = async (req, res) => {
  try {
    console.log('Fetching all doctors except:', req.user._id);
    
    const doctors = await User.find({ 
      role: 'doctor', 
      isActive: true,
      _id: { $ne: req.user._id }
    }).select('email profile specialization licenseNumber');
    
    console.log(`Found ${doctors.length} doctors`);
    res.json(doctors);
  } catch (error) {
    console.error('Get all doctors error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.createReferral = async (req, res) => {
  try {
    const { patientId, toDoctorId, reason, priority, notes } = req.body;
    
    console.log('Creating referral:', { patientId, toDoctorId, reason, priority });
    
    // Verify patient exists and is assigned to this doctor
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    if (patient.assignedDoctor?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only refer patients assigned to you' });
    }
    
    // Verify target doctor exists
    const targetDoctor = await User.findById(toDoctorId);
    if (!targetDoctor || targetDoctor.role !== 'doctor') {
      return res.status(404).json({ message: 'Target doctor not found' });
    }
    
    const referral = new Referral({
      patient: patientId,
      fromDoctor: req.user._id,
      toDoctor: toDoctorId,
      reason,
      priority: priority || 'normal',
      notes: notes || '',
      status: 'pending'
    });
    
    await referral.save();
    
    // Populate for response
    await referral.populate('patient', 'user');
    await referral.populate('fromDoctor', 'email profile');
    await referral.populate('toDoctor', 'email profile');
    
    console.log('Referral created successfully:', referral._id);
    res.status(201).json(referral);
  } catch (error) {
    console.error('Create referral error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getSentReferrals = async (req, res) => {
  try {
    const referrals = await Referral.find({ fromDoctor: req.user._id })
      .populate({
        path: 'patient',
        populate: {
          path: 'user',
          select: 'email profile'
        }
      })
      .populate('toDoctor', 'email profile specialization')
      .sort({ createdAt: -1 });
    
    res.json(referrals);
  } catch (error) {
    console.error('Get sent referrals error:', error);
    res.status(500).json({ message: error.message });
  }
};


exports.getReceivedReferrals = async (req, res) => {
  try {
    const referrals = await Referral.find({ 
      toDoctor: req.user._id,
      status: 'pending'
    })
      .populate({
        path: 'patient',
        populate: {
          path: 'user',
          select: 'email profile'
        }
      })
      .populate('fromDoctor', 'email profile specialization')
      .sort({ createdAt: -1 });
    
    res.json(referrals);
  } catch (error) {
    console.error('Get received referrals error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getReferrals = async (req, res) => {
  try {
    const referrals = await Referral.find({
      $or: [
        { fromDoctor: req.user._id },
        { toDoctor: req.user._id }
      ]
    })
      .populate({
        path: 'patient',
        populate: {
          path: 'user',
          select: 'email profile'
        }
      })
      .populate('fromDoctor', 'email profile specialization')
      .populate('toDoctor', 'email profile specialization')
      .sort({ createdAt: -1 });
    
    res.json(referrals);
  } catch (error) {
    console.error('Get referrals error:', error);
    res.status(500).json({ message: error.message });
  }
};


exports.respondToReferral = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, responseNotes } = req.body;
    
    if (!['accepted', 'denied'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const referral = await Referral.findById(id);
    if (!referral) {
      return res.status(404).json({ message: 'Referral not found' });
    }
    
    // Check if this doctor is the recipient
    if (referral.toDoctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'This referral is not for you' });
    }
    
    if (referral.status !== 'pending') {
      return res.status(400).json({ message: `Referral already ${referral.status}` });
    }
    
    referral.status = status;
    referral.responseNotes = responseNotes || '';
    referral.respondedAt = new Date();
    await referral.save();
    
    // If accepted, reassign the patient
    if (status === 'accepted') {
      const patient = await Patient.findById(referral.patient);
      if (patient) {
        patient.assignedDoctor = referral.toDoctor;
        await patient.save();
        console.log(`Patient ${patient._id} reassigned to doctor ${referral.toDoctor}`);
      }
    }
    
    // Populate for response
    await referral.populate('patient', 'user');
    await referral.populate('fromDoctor', 'email profile');
    await referral.populate('toDoctor', 'email profile');
    
    res.json({ message: `Referral ${status}`, referral });
  } catch (error) {
    console.error('Respond to referral error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getReferralById = async (req, res) => {
  try {
    const { id } = req.params;
    const referral = await Referral.findById(id)
      .populate('patient', 'user bloodType')
      .populate('fromDoctor', 'email profile')
      .populate('toDoctor', 'email profile');
    
    if (!referral) {
      return res.status(404).json({ message: 'Referral not found' });
    }
    
    // Check if doctor is involved
    if (referral.fromDoctor._id.toString() !== req.user._id.toString() &&
        referral.toDoctor._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    if (referral.patient) {
      await referral.patient.populate('user', 'email profile');
    }
    
    res.json(referral);
  } catch (error) {
    console.error('Get referral by ID error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ========== APPOINTMENT SYSTEM ==========
exports.getAppointments = async (req, res) => {
  try {
    const { patientId, status } = req.query;
    let query = { doctor: req.user._id };
    
    if (patientId) {
      query.patient = patientId;
    }
    if (status && status !== 'all') {
      query.status = status;
    }
    
    const appointments = await Appointment.find(query)
      .populate('patient', 'user bloodType')
      .populate('doctor', 'email profile')
      .populate('hospital', 'name address phone')
      .sort({ dateTime: 1 });
    
    // Populate patient user details
    for (let apt of appointments) {
      if (apt.patient) {
        await apt.patient.populate('user', 'email profile');
      }
    }
    
    res.json(appointments);
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ message: error.message });
  }
};



exports.createAppointment = async (req, res) => {
  try {
    const { 
      patientId, 
      dateTime, 
      duration, 
      type, 
      reason, 
      notes,
      hospitalId,
      location 
    } = req.body;
    
    // Verify patient exists and is assigned to this doctor
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    // Check if patient is assigned to this doctor
    if (patient.assignedDoctor?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only schedule appointments with your assigned patients' });
    }
    
    // Check for scheduling conflicts
    const existingAppointment = await Appointment.findOne({
      doctor: req.user._id,
      dateTime: new Date(dateTime),
      status: { $nin: ['cancelled', 'completed'] }
    });
    
    if (existingAppointment) {
      return res.status(409).json({ message: 'You already have an appointment at this time' });
    }
    
    // Create appointment
    const appointment = new Appointment({
      patient: patientId,
      doctor: req.user._id,
      dateTime: new Date(dateTime),
      duration: duration || 30,
      type: type || 'in-person',
      reason: reason || '',
      notes: notes || '',
      hospital: hospitalId || null,
      location: {
        room: location?.room || '',
        floor: location?.floor || '',
        instructions: location?.instructions || ''
      },
      status: 'scheduled'
    });
    
    await appointment.save();
    
    // Fetch the complete appointment with populated fields
    const createdAppointment = await Appointment.findById(appointment._id)
      .populate('patient', 'user')
      .populate('doctor', 'email profile')
      .populate('hospital', 'name address phone');
    
    if (createdAppointment.patient) {
      await createdAppointment.patient.populate('user', 'email profile');
    }
    
    res.status(201).json(createdAppointment);
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, cancellationReason } = req.body;
    
    const appointment = await Appointment.findOneAndUpdate(
      { _id: id, doctor: req.user._id },
      { status, notes, cancellationReason },
      { new: true }
    ).populate('patient', 'user')
      .populate('doctor', 'email profile')
      .populate('hospital', 'name address phone');
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    if (appointment.patient) {
      await appointment.patient.populate('user', 'email profile');
    }
    
    res.json(appointment);
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findOneAndDelete({ _id: id, doctor: req.user._id });
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get appointment statistics
exports.getAppointmentStats = async (req, res) => {
  try {
    const stats = {
      total: await Appointment.countDocuments({ doctor: req.user._id }),
      scheduled: await Appointment.countDocuments({ doctor: req.user._id, status: 'scheduled' }),
      confirmed: await Appointment.countDocuments({ doctor: req.user._id, status: 'confirmed' }),
      completed: await Appointment.countDocuments({ doctor: req.user._id, status: 'completed' }),
      cancelled: await Appointment.countDocuments({ doctor: req.user._id, status: 'cancelled' }),
      'no-show': await Appointment.countDocuments({ doctor: req.user._id, status: 'no-show' }),
      today: await Appointment.countDocuments({ 
        doctor: req.user._id, 
        dateTime: { $gte: new Date().setHours(0,0,0), $lt: new Date().setHours(24,0,0) },
        status: { $nin: ['cancelled', 'completed', 'no-show'] }
      }),
      upcoming: await Appointment.countDocuments({ 
        doctor: req.user._id, 
        dateTime: { $gt: new Date() },
        status: { $nin: ['cancelled', 'completed', 'no-show'] }
      })
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Get appointment stats error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ========== PRESCRIPTION SYSTEM ==========
// When fetching prescriptions, populate doctor details
exports.getPrescriptions = async (req, res) => {
  try {
    const { patientId } = req.query;
    let query = {};
    
    // ✅ If admin, allow access to all prescriptions or filter by patientId
    if (req.user.role === 'admin') {
      if (patientId) {
        query.patient = patientId;
      }
    } else {
      // Doctor access - only their own prescriptions
      query.doctor = req.user._id;
      if (patientId) {
        query.patient = patientId;
      }
    }
    
    const prescriptions = await Prescription.find(query)
      .populate('patient', 'user bloodType allergies')
      .populate('doctor', 'email profile')
      .sort({ issuedDate: -1 });
    
    for (let pres of prescriptions) {
      if (pres.patient && pres.patient.user) {
        await pres.patient.populate('user', 'email profile');
      }
    }
    
    res.json(prescriptions);
  } catch (error) {
    console.error('Get prescriptions error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.createPrescription = async (req, res) => {
  try {
    const { patientId, medications, notes, refillsRemaining } = req.body;
    
    const patient = await Patient.findById(patientId);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    
    const prescription = new Prescription({
      patient: patientId,
      doctor: req.user._id,
      medications: medications || [],
      notes: notes || '',
      refillsRemaining: refillsRemaining || 0,
      isActive: true,
      issuedDate: new Date()
    });
    
    await prescription.save();
    await prescription.populate('patient', 'user');
    
    await notificationController.createNotification(
      patient.user,
      'prescription_created',
      '💊 New Prescription',
      `Dr. ${req.user.profile?.firstName} ${req.user.profile?.lastName} has issued a new prescription for you.`,
      { prescriptionId: prescription._id }
    );
    
    res.status(201).json(prescription);
  } catch (error) {
    console.error('Create prescription error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.updatePrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const { medications, notes, refillsRemaining, isActive } = req.body;
    
    const prescription = await Prescription.findOneAndUpdate(
      { _id: id, doctor: req.user._id },
      { medications, notes, refillsRemaining, isActive },
      { new: true }
    ).populate('patient', 'user');
    
    if (!prescription) return res.status(404).json({ message: 'Prescription not found' });
    res.json(prescription);
  } catch (error) {
    console.error('Update prescription error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.deletePrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const prescription = await Prescription.findOneAndDelete({ _id: id, doctor: req.user._id });
    
    if (!prescription) return res.status(404).json({ message: 'Prescription not found' });
    res.json({ message: 'Prescription deleted successfully' });
  } catch (error) {
    console.error('Delete prescription error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ========== PRESCRIPTION MANAGEMENT ==========

// Get all prescriptions for the logged-in doctor
exports.getPrescriptions = async (req, res) => {
  try {
    const { patientId } = req.query;
    let query = { doctor: req.user._id };
    
    if (patientId) {
      query.patient = patientId;
    }
    
    const prescriptions = await Prescription.find(query)
      .populate('patient', 'user')
      .populate('doctor', 'email profile')
      .sort({ issuedDate: -1 });
    
    // Populate patient user details
    for (let pres of prescriptions) {
      if (pres.patient) {
        await pres.patient.populate('user', 'email profile');
      }
    }
    
    res.json(prescriptions);
  } catch (error) {
    console.error('Get prescriptions error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get single prescription by ID
exports.getPrescriptionById = async (req, res) => {
  try {
    const { id } = req.params;
    const prescription = await Prescription.findById(id)
      .populate('patient', 'user')
      .populate('doctor', 'email profile');
    
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }
    
    // Check if doctor has access
    if (prescription.doctor._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    if (prescription.patient) {
      await prescription.patient.populate('user', 'email profile');
    }
    
    res.json(prescription);
  } catch (error) {
    console.error('Get prescription by ID error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Create new prescription
exports.createPrescription = async (req, res) => {
  try {
    const { patientId, medications, notes, refillsRemaining, expiryDate } = req.body;
    
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    // Check if doctor has access to this patient
    if (patient.assignedDoctor?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. This patient is not assigned to you.' });
    }
    
    const prescription = new Prescription({
      patient: patientId,
      doctor: req.user._id,
      medications: medications || [],
      notes: notes || '',
      refillsRemaining: refillsRemaining || 0,
      isActive: true,
      issuedDate: new Date(),
      expiryDate: expiryDate || null
    });
    
    await prescription.save();
    
    // Populate for response
    await prescription.populate('patient', 'user');
    await prescription.populate('doctor', 'email profile');
    
    if (prescription.patient) {
      await prescription.patient.populate('user', 'email profile');
    }
    
    // Create notification for patient
    try {
      const notificationController = require('./notification.controller');
      await notificationController.createNotification(
        patient.user,
        'prescription_created',
        '💊 New Prescription',
        `Dr. ${req.user.profile?.firstName} ${req.user.profile?.lastName} has issued a new prescription for you.`,
        { prescriptionId: prescription._id }
      );
    } catch (err) {
      console.warn('Could not send notification:', err.message);
    }
    
    res.status(201).json(prescription);
  } catch (error) {
    console.error('Create prescription error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update prescription
exports.updatePrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const { medications, notes, refillsRemaining, isActive, expiryDate } = req.body;
    
    const prescription = await Prescription.findOne({ _id: id, doctor: req.user._id });
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }
    
    if (medications) prescription.medications = medications;
    if (notes !== undefined) prescription.notes = notes;
    if (refillsRemaining !== undefined) prescription.refillsRemaining = refillsRemaining;
    if (isActive !== undefined) prescription.isActive = isActive;
    if (expiryDate) prescription.expiryDate = expiryDate;
    
    await prescription.save();
    await prescription.populate('patient', 'user');
    await prescription.populate('doctor', 'email profile');
    
    res.json(prescription);
  } catch (error) {
    console.error('Update prescription error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete prescription
exports.deletePrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const prescription = await Prescription.findOneAndDelete({ _id: id, doctor: req.user._id });
    
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }
    
    res.json({ message: 'Prescription deleted successfully' });
  } catch (error) {
    console.error('Delete prescription error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ========== APPOINTMENT MANAGEMENT ==========

// Get appointments for the logged-in doctor
exports.getAppointments = async (req, res) => {
  try {
    const { patientId, status } = req.query;
    let query = {};
    
    // ✅ If admin, allow access to all appointments or filter by patientId
    if (req.user.role === 'admin') {
      if (patientId) {
        query.patient = patientId;
      }
    } else {
      // Doctor access - only their own appointments
      query.doctor = req.user._id;
      if (patientId) {
        query.patient = patientId;
      }
    }
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    const appointments = await Appointment.find(query)
      .populate('patient', 'user bloodType allergies')
      .populate('doctor', 'email profile')
      .populate('hospital', 'name address phone')
      .sort({ dateTime: 1 });
    
    for (let apt of appointments) {
      if (apt.patient && apt.patient.user) {
        await apt.patient.populate('user', 'email profile');
      }
    }
    
    res.json(appointments);
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get single appointment by ID
exports.getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id)
      .populate('patient', 'user bloodType')
      .populate('doctor', 'email profile')
      .populate('hospital', 'name address phone');
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    // Check if doctor has access
    if (appointment.doctor._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    if (appointment.patient) {
      await appointment.patient.populate('user', 'email profile');
    }
    
    res.json(appointment);
  } catch (error) {
    console.error('Get appointment by ID error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Create new appointment
exports.createAppointment = async (req, res) => {
  try {
    const { patientId, dateTime, duration, type, reason, notes, hospitalId, location } = req.body;
    
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    // Check if doctor has access to this patient
    if (patient.assignedDoctor?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. This patient is not assigned to you.' });
    }
    
    // Check for scheduling conflicts
    const existingAppointment = await Appointment.findOne({
      doctor: req.user._id,
      dateTime: new Date(dateTime),
      status: { $nin: ['cancelled', 'completed'] }
    });
    
    if (existingAppointment) {
      return res.status(409).json({ message: 'You already have an appointment at this time' });
    }
    
    const appointment = new Appointment({
      patient: patientId,
      doctor: req.user._id,
      dateTime: new Date(dateTime),
      duration: duration || 30,
      type: type || 'in-person',
      reason: reason || '',
      notes: notes || '',
      hospital: hospitalId || null,
      location: location || {},
      status: 'scheduled'
    });
    
    await appointment.save();
    
    // Populate for response
    await appointment.populate('patient', 'user');
    await appointment.populate('doctor', 'email profile');
    await appointment.populate('hospital', 'name address phone');
    
    if (appointment.patient) {
      await appointment.patient.populate('user', 'email profile');
    }
    
    res.status(201).json(appointment);
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update appointment
exports.updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { dateTime, duration, type, reason, notes, status, location, cancellationReason } = req.body;
    
    const appointment = await Appointment.findOne({ _id: id, doctor: req.user._id });
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    if (dateTime) appointment.dateTime = new Date(dateTime);
    if (duration) appointment.duration = duration;
    if (type) appointment.type = type;
    if (reason) appointment.reason = reason;
    if (notes !== undefined) appointment.notes = notes;
    if (status) appointment.status = status;
    if (location) appointment.location = location;
    if (cancellationReason) appointment.cancellationReason = cancellationReason;
    
    await appointment.save();
    await appointment.populate('patient', 'user');
    await appointment.populate('doctor', 'email profile');
    
    res.json(appointment);
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ message: error.message });
  }
};


// Delete appointment
exports.deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findOneAndDelete({ _id: id, doctor: req.user._id });
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ========== REFERRAL MANAGEMENT ==========

// Get all referrals (both sent and received)
exports.getReferrals = async (req, res) => {
  try {
    const { patientId } = req.query;
    let query = {};
    
    // ✅ If admin, allow access to all referrals or filter by patientId
    if (req.user.role === 'admin') {
      if (patientId) {
        query.patient = patientId;
      }
    } else {
      // Doctor access - only their own sent/received referrals
      query = {
        $or: [
          { fromDoctor: req.user._id },
          { toDoctor: req.user._id }
        ]
      };
      if (patientId) {
        query.patient = patientId;
      }
    }
    
    const referrals = await Referral.find(query)
      .populate('patient', 'user bloodType allergies')
      .populate('fromDoctor', 'email profile')
      .populate('toDoctor', 'email profile')
      .sort({ createdAt: -1 });
    
    for (let ref of referrals) {
      if (ref.patient && ref.patient.user) {
        await ref.patient.populate('user', 'email profile');
      }
    }
    
    res.json(referrals);
  } catch (error) {
    console.error('Get referrals error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get sent referrals
exports.getSentReferrals = async (req, res) => {
  try {
    const referrals = await Referral.find({ fromDoctor: req.user._id })
      .populate('patient', 'user')
      .populate('toDoctor', 'email profile')
      .sort({ createdAt: -1 });
    
    for (let ref of referrals) {
      if (ref.patient) {
        await ref.patient.populate('user', 'email profile');
      }
    }
    
    res.json(referrals);
  } catch (error) {
    console.error('Get sent referrals error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get received referrals
exports.getReceivedReferrals = async (req, res) => {
  try {
    const referrals = await Referral.find({ toDoctor: req.user._id, status: 'pending' })
      .populate('patient', 'user')
      .populate('fromDoctor', 'email profile')
      .sort({ createdAt: -1 });
    
    for (let ref of referrals) {
      if (ref.patient) {
        await ref.patient.populate('user', 'email profile');
      }
    }
    
    res.json(referrals);
  } catch (error) {
    console.error('Get received referrals error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Create new referral
exports.createReferral = async (req, res) => {
  try {
    const { patientId, toDoctorId, reason, priority, notes } = req.body;
    
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    // Check if doctor has access to this patient
    if (patient.assignedDoctor?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. This patient is not assigned to you.' });
    }
    
    const toDoctor = await User.findById(toDoctorId);
    if (!toDoctor || toDoctor.role !== 'doctor') {
      return res.status(404).json({ message: 'Target doctor not found' });
    }
    
    const referral = new Referral({
      patient: patientId,
      fromDoctor: req.user._id,
      toDoctor: toDoctorId,
      reason: reason || '',
      priority: priority || 'normal',
      notes: notes || '',
      status: 'pending'
    });
    
    await referral.save();
    await referral.populate('patient', 'user');
    await referral.populate('fromDoctor', 'email profile');
    await referral.populate('toDoctor', 'email profile');
    
    if (referral.patient) {
      await referral.patient.populate('user', 'email profile');
    }
    
    // Create notification for target doctor
    try {
      const notificationController = require('./notification.controller');
      await notificationController.createNotification(
        toDoctorId,
        'referral_received',
        '🩺 New Referral Received',
        `Dr. ${req.user.profile?.firstName} ${req.user.profile?.lastName} referred a patient to you.`,
        { referralId: referral._id, patientId, priority }
      );
    } catch (err) {
      console.warn('Could not send notification:', err.message);
    }
    
    res.status(201).json(referral);
  } catch (error) {
    console.error('Create referral error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Respond to referral
exports.respondToReferral = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, responseNotes } = req.body;
    
    if (!['accepted', 'denied'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be "accepted" or "denied"' });
    }
    
    const referral = await Referral.findById(id);
    if (!referral) {
      return res.status(404).json({ message: 'Referral not found' });
    }
    
    // Check if this doctor is the recipient
    if (referral.toDoctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. This referral is not for you.' });
    }
    
    if (referral.status !== 'pending') {
      return res.status(400).json({ message: `Referral has already been ${referral.status}` });
    }
    
    referral.status = status;
    referral.responseNotes = responseNotes || '';
    referral.respondedAt = new Date();
    await referral.save();
    
    // If accepted, reassign the patient
    if (status === 'accepted') {
      const patient = await Patient.findById(referral.patient);
      if (patient) {
        patient.assignedDoctor = referral.toDoctor;
        await patient.save();
      }
    }
    
    await referral.populate('patient', 'user');
    await referral.populate('fromDoctor', 'email profile');
    await referral.populate('toDoctor', 'email profile');
    
    if (referral.patient) {
      await referral.patient.populate('user', 'email profile');
    }
    
    // Create notification for referring doctor
    try {
      const notificationController = require('./notification.controller');
      await notificationController.createNotification(
        referral.fromDoctor,
        'referral_responded',
        status === 'accepted' ? '✅ Referral Accepted' : '❌ Referral Declined',
        `Dr. ${req.user.profile?.firstName} ${req.user.profile?.lastName} has ${status} your referral.`,
        { referralId: referral._id, status }
      );
    } catch (err) {
      console.warn('Could not send notification:', err.message);
    }
    
    res.json(referral);
  } catch (error) {
    console.error('Respond to referral error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get referral by ID
exports.getReferralById = async (req, res) => {
  try {
    const { id } = req.params;
    const referral = await Referral.findById(id)
      .populate('patient', 'user')
      .populate('fromDoctor', 'email profile')
      .populate('toDoctor', 'email profile');
    
    if (!referral) {
      return res.status(404).json({ message: 'Referral not found' });
    }
    
    // Check if doctor is involved
    if (referral.fromDoctor._id.toString() !== req.user._id.toString() &&
        referral.toDoctor._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    if (referral.patient) {
      await referral.patient.populate('user', 'email profile');
    }
    
    res.json(referral);
  } catch (error) {
    console.error('Get referral by ID error:', error);
    res.status(500).json({ message: error.message });
  }
};