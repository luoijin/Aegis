const Patient = require('../models/Patient.model');
const Doctor = require('../models/Doctor.model');
const HealthLog = require('../models/HealthLog.model');
const Referral = require('../models/Referral.model');
const Appointment = require('../models/Appointment.model');
const Prescription = require('../models/Prescription.model');
const Notification = require('../models/Notification.model');
const User = require('../models/User.model');

// Get doctor's patients
exports.getPatients = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });

    const patients = await Patient.find({ assignedDoctors: doctor._id })
      .populate('user', 'email name phone')
      .populate('primaryDoctor', 'specialization');

    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get specific patient details
exports.getPatientById = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });

    const patient = await Patient.findById(req.params.id)
      .populate('user', 'email name phone')
      .populate('primaryDoctor', 'specialization')
      .populate('assignedDoctors', 'specialization');

    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    
    // Check if doctor has access to this patient
    if (!patient.assignedDoctors.some(d => d._id.toString() === doctor._id.toString())) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get health logs, prescriptions, appointments for this patient
    const [healthLogs, prescriptions, appointments] = await Promise.all([
      HealthLog.find({ patient: patient._id }).sort({ timestamp: -1 }).limit(50),
      Prescription.find({ patient: patient._id }).sort({ issuedDate: -1 }).limit(20),
      Appointment.find({ patient: patient._id, doctor: doctor._id }).sort({ dateTime: -1 })
    ]);

    res.json({ patient, healthLogs, prescriptions, appointments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update patient medical record (diagnoses, treatment plans)
exports.updateMedicalRecord = async (req, res) => {
  try {
    const { medicalHistory, chronicConditions, allergies } = req.body;
    const patient = await Patient.findById(req.params.id);
    
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    
    if (medicalHistory) patient.medicalHistory = medicalHistory;
    if (chronicConditions) patient.chronicConditions = chronicConditions;
    if (allergies) patient.allergies = allergies;
    
    await patient.save();
    res.json({ message: 'Medical record updated', patient });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Add health log (vitals)
exports.addHealthLog = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { vitals, notes } = req.body;
    
    const doctor = await Doctor.findOne({ user: req.user._id });
    const patient = await Patient.findById(patientId);
    
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    
    // Check if abnormal
    const isAbnormal = (
      (vitals.bpSystolic && vitals.bpSystolic > 140) ||
      (vitals.heartRate && (vitals.heartRate > 100 || vitals.heartRate < 60)) ||
      (vitals.temperature && (vitals.temperature > 37.5 || vitals.temperature < 36)) ||
      (vitals.spO2 && vitals.spO2 < 95)
    );
    
    const healthLog = new HealthLog({
      patient: patientId,
      recordedBy: req.user._id,
      vitals,
      notes,
      isAbnormal
    });
    
    await healthLog.save();
    
    // Send notification if abnormal
    if (isAbnormal) {
      const notification = new Notification({
        user: patient.user,
        type: 'alert',
        title: 'Abnormal Health Reading',
        message: `Your ${new Date().toLocaleDateString()} health reading shows abnormal values. Please consult your doctor.`,
        data: { healthLogId: healthLog._id }
      });
      await notification.save();
    }
    
    res.status(201).json(healthLog);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get patient health logs
exports.getHealthLogs = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { startDate, endDate, limit = 100 } = req.query;
    
    let query = { patient: patientId };
    if (startDate && endDate) {
      query.timestamp = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    
    const healthLogs = await HealthLog.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));
    
    res.json(healthLogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create referral
exports.createReferral = async (req, res) => {
  try {
    const { patientId, toDoctorId, reason, priority, notes } = req.body;
    
    const fromDoctor = await Doctor.findOne({ user: req.user._id });
    const toDoctor = await Doctor.findById(toDoctorId);
    const patient = await Patient.findById(patientId);
    
    if (!toDoctor) return res.status(404).json({ message: 'Target doctor not found' });
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    
    const referral = new Referral({
      patient: patientId,
      fromDoctor: fromDoctor._id,
      toDoctor: toDoctorId,
      reason,
      priority,
      notes,
      status: 'pending'
    });
    
    await referral.save();
    
    // Create notification for target doctor
    const notification = new Notification({
      user: toDoctor.user,
      type: 'referral',
      title: 'New Referral Request',
      message: `Dr. ${req.user.name.firstName} ${req.user.name.lastName} referred patient ${patient.user?.name?.firstName} ${patient.user?.name?.lastName} to you.`,
      data: { referralId: referral._id, patientId }
    });
    await notification.save();
    
    res.status(201).json(referral);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get received referrals
exports.getReceivedReferrals = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    const referrals = await Referral.find({ toDoctor: doctor._id })
      .populate('patient', 'user bloodGroup')
      .populate('fromDoctor', 'specialization')
      .populate('toDoctor', 'specialization')
      .sort({ createdAt: -1 });
    
    // Populate patient user details
    for (let ref of referrals) {
      if (ref.patient) {
        await ref.patient.populate('user', 'name');
      }
    }
    
    res.json(referrals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Respond to referral (accept/decline)
exports.respondToReferral = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, responseNotes } = req.body;
    
    const referral = await Referral.findById(id)
      .populate('patient')
      .populate('fromDoctor')
      .populate('toDoctor');
    
    if (!referral) return res.status(404).json({ message: 'Referral not found' });
    
    referral.status = status;
    referral.responseNotes = responseNotes;
    referral.respondedAt = new Date();
    await referral.save();
    
    // If accepted, add patient to doctor's assigned list
    if (status === 'accepted') {
      await Patient.findByIdAndUpdate(referral.patient._id, {
        $addToSet: { assignedDoctors: referral.toDoctor._id }
      });
    }
    
    // Notify referring doctor
    const fromDoctorUser = await User.findById(referral.fromDoctor.user);
    const notification = new Notification({
      user: fromDoctorUser._id,
      type: 'referral',
      title: `Referral ${status === 'accepted' ? 'Accepted' : 'Declined'}`,
      message: `Dr. ${referral.toDoctor.user?.name?.firstName} ${referral.toDoctor.user?.name?.lastName} has ${status} your referral for patient ${referral.patient.user?.name?.firstName} ${referral.patient.user?.name?.lastName}.`,
      data: { referralId: referral._id }
    });
    await notification.save();
    
    res.json({ message: `Referral ${status}`, referral });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Create prescription
exports.createPrescription = async (req, res) => {
  try {
    const { patientId, medications, refillsRemaining } = req.body;
    
    const doctor = await Doctor.findOne({ user: req.user._id });
    const prescription = new Prescription({
      patient: patientId,
      doctor: doctor._id,
      medications,
      refillsRemaining: refillsRemaining || 0
    });
    
    await prescription.save();
    
    res.status(201).json(prescription);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get doctor's prescriptions for a patient
exports.getPrescriptions = async (req, res) => {
  try {
    const { patientId } = req.params;
    const doctor = await Doctor.findOne({ user: req.user._id });
    
    const prescriptions = await Prescription.find({
      patient: patientId,
      doctor: doctor._id
    }).sort({ issuedDate: -1 });
    
    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get doctor's notifications
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    
    const unreadCount = notifications.filter(n => !n.isRead).length;
    
    res.json({ notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark notification as read
exports.markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true },
      { new: true }
    );
    
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create appointment
exports.createAppointment = async (req, res) => {
  try {
    const { patientId, dateTime, type, reason } = req.body;
    
    const doctor = await Doctor.findOne({ user: req.user._id });
    const patient = await Patient.findById(patientId);
    
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    
    const appointment = new Appointment({
      patient: patientId,
      doctor: doctor._id,
      dateTime,
      type,
      reason,
      status: 'scheduled'
    });
    
    await appointment.save();
    
    // Notify patient
    const notification = new Notification({
      user: patient.user,
      type: 'appointment',
      title: 'New Appointment Scheduled',
      message: `Your appointment with Dr. ${req.user.name.firstName} ${req.user.name.lastName} has been scheduled for ${new Date(dateTime).toLocaleString()}.`,
      data: { appointmentId: appointment._id }
    });
    await notification.save();
    
    res.status(201).json(appointment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update appointment status
exports.updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status, notes },
      { new: true }
    );
    
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    
    res.json(appointment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};