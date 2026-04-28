const User = require('../../models/User.model');
const Doctor = require('../../models/Doctor.model');
const Hospital = require('../../models/Hospital.model');

// Assign doctor to hospital
exports.assignDoctorToHospital = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { hospitalId, workingHours, consultationFee } = req.body;
    
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }
    
    // Check if already assigned
    const alreadyAssigned = doctor.hospitals.some(h => h.hospitalId.toString() === hospitalId);
    if (alreadyAssigned) {
      return res.status(400).json({ message: 'Doctor already assigned to this hospital' });
    }
    
    doctor.hospitals.push({
      hospitalId,
      workingHours: workingHours || '9 AM - 5 PM',
      consultationFee: consultationFee || 0
    });
    
    await doctor.save();
    
    res.json({
      message: 'Doctor assigned to hospital successfully',
      doctor
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Remove doctor from hospital
exports.removeDoctorFromHospital = async (req, res) => {
  try {
    const { doctorId, hospitalId } = req.params;
    
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    doctor.hospitals = doctor.hospitals.filter(h => h.hospitalId.toString() !== hospitalId);
    await doctor.save();
    
    res.json({ message: 'Doctor removed from hospital successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get doctor's hospitals
exports.getDoctorHospitals = async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    const doctor = await Doctor.findById(doctorId).populate('hospitals.hospitalId');
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    res.json(doctor.hospitals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Assign primary doctor to patient (admin only)
exports.assignPrimaryDoctorToPatient = async (req, res) => {
  try {
    const { patientId, doctorId } = req.body;
    
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    patient.primaryDoctorId = doctorId;
    
    // Add to assignedDoctors if not already there
    if (!patient.assignedDoctors.includes(doctorId)) {
      patient.assignedDoctors.push(doctorId);
    }
    
    await patient.save();
    
    // Create notification for doctor
    const Notification = require('../../models/Notification.model');
    await Notification.create({
      userId: doctor.userId,
      type: 'doctor_assigned',
      title: 'New Patient Assigned',
      message: `Patient ${patient.userId.name} has been assigned to you as primary doctor.`,
      data: { patientId, patientName: patient.userId.name }
    });
    
    res.json({ message: 'Primary doctor assigned successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};