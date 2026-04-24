const Patient = require('../models/Patient.model');
const HealthLog = require('../models/HealthLog.model');

const calculateAverage = (numbers) => {
  const validNumbers = numbers.filter(n => n && !isNaN(n));
  if (validNumbers.length === 0) return 0;
  return validNumbers.reduce((a, b) => a + b, 0) / validNumbers.length;
};

exports.createPatient = async (req, res) => {
  try {
    const patientData = {
      user: req.body.userId,
      medicalHistory: req.body.medicalHistory || [],
      allergies: req.body.allergies || [],
      bloodType: req.body.bloodType,
      emergencyContact: req.body.emergencyContact,
      assignedDoctor: req.body.assignedDoctor || (req.user.role === 'doctor' ? req.user._id : null)
    };

    const patient = new Patient(patientData);
    await patient.save();
    
    res.status(201).json(patient);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAllPatients = async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'doctor') {
      query.assignedDoctor = req.user._id;
    } else if (req.user.role === 'patient') {
      query.user = req.user._id;
    }

    const patients = await Patient.find(query)
      .populate('user', 'email profile')
      .populate('assignedDoctor', 'email profile');
    
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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

    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updatePatient = async (req, res) => {
  try {
    const updates = ['medicalHistory', 'allergies', 'bloodType', 'emergencyContact', 'assignedDoctor'];
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