const User = require('../models/User.model');
const Patient = require('../models/Patient.model');
const Hospital = require('../models/Hospital.model');
const Specialization = require('../models/Specialization.model');
const HealthLog = require('../models/HealthLog.model');

// ============================================
// DASHBOARD STATS
// ============================================
exports.getDashboardStats = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const [totalPatients, totalDoctors, totalHospitals, totalHealthLogs, recentPatients, recentDoctors] = await Promise.all([
      Patient.countDocuments(),
      User.countDocuments({ role: 'doctor' }),
      Hospital.countDocuments(),
      HealthLog.countDocuments(),
      Patient.find().populate('user', 'email profile').sort({ createdAt: -1 }).limit(5),
      User.find({ role: 'doctor' }).select('email profile createdAt').sort({ createdAt: -1 }).limit(5)
    ]);

    res.json({
      stats: {
        totalPatients,
        totalDoctors,
        totalHospitals,
        totalHealthLogs,
        totalAppointments: 0
      },
      recentPatients,
      recentDoctors
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// HOSPITAL CRUD
// ============================================
exports.getHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find({});
    res.json(hospitals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createHospital = async (req, res) => {
  try {
    const hospital = new Hospital(req.body);
    await hospital.save();
    res.status(201).json(hospital);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }
    res.json(hospital);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findByIdAndDelete(req.params.id);
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// DOCTOR CRUD
// ============================================
exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' })
      .select('-password')
      .populate('hospital', 'name');
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateDoctorByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, phone, licenseNumber, specialization, hospital, isActive } = req.body;
    
    const doctor = await User.findById(id);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    if (firstName) doctor.profile.firstName = firstName;
    if (lastName) doctor.profile.lastName = lastName;
    if (phone) doctor.profile.phone = phone;
    if (licenseNumber) doctor.licenseNumber = licenseNumber;
    if (specialization) doctor.specialization = specialization;
    if (hospital !== undefined) doctor.hospital = hospital;
    if (isActive !== undefined) doctor.isActive = isActive;
    
    await doctor.save();
    
    const updatedDoctor = await User.findById(id).select('-password');
    res.json(updatedDoctor);
  } catch (error) {
    console.error('Update doctor error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateDoctorStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    const doctor = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: isActive === true || isActive === 'true' },
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

exports.deleteDoctorByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    
    const doctor = await User.findOne({ _id: id, role: 'doctor' });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    await Patient.updateMany(
      { assignedDoctor: id },
      { assignedDoctor: null }
    );
    
    await User.findByIdAndDelete(id);
    
    res.json({ 
      message: 'Doctor permanently deleted from database',
      deletedDoctor: {
        name: `${doctor.profile?.firstName} ${doctor.profile?.lastName}`,
        email: doctor.email
      }
    });
  } catch (error) {
    console.error('Delete doctor error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// PATIENT CRUD
// ============================================
exports.getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find({})
      .populate('user', 'email profile')
      .populate('assignedDoctor', 'email profile');
    
    console.log(`📊 Admin fetched ${patients.length} patients`);
    res.json(patients);
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.updatePatientByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phone, bloodType, allergies, assignedDoctor } = req.body;
    
    const patient = await Patient.findById(id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    const user = await User.findById(patient.user);
    if (user) {
      if (firstName) user.profile.firstName = firstName;
      if (lastName) user.profile.lastName = lastName;
      if (phone) user.profile.phone = phone;
      if (email) user.email = email;
      await user.save();
    }
    
    if (bloodType) patient.bloodType = bloodType;
    if (allergies) patient.allergies = allergies;
    if (assignedDoctor !== undefined) patient.assignedDoctor = assignedDoctor || null;
    await patient.save();
    
    const updatedPatient = await Patient.findById(id)
      .populate('user', 'email profile')
      .populate('assignedDoctor', 'email profile');
    
    res.json(updatedPatient);
  } catch (error) {
    console.error('Update patient error:', error);
    res.status(500).json({ message: error.message });
  }
};

// DIRECT PATIENT STATUS UPDATE - Same logic as doctor (using USER ID)
exports.updatePatientStatusDirect = async (req, res) => {
  try {
    const { isActive } = req.body;
    const { userId } = req.params;
    
    console.log(`📝 Updating patient status for user ID: ${userId} to ${isActive}`);
    
    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: isActive === true || isActive === 'true' },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log(`✅ Patient status updated: ${user.email} is now ${user.isActive ? 'ACTIVE' : 'INACTIVE'}`);
    
    res.json({ 
      success: true,
      message: `Patient ${isActive ? 'activated' : 'deactivated'} successfully`,
      user 
    });
  } catch (error) {
    console.error('Update patient status error:', error);
    res.status(400).json({ message: error.message });
  }
};

// Legacy patient status update (kept for backward compatibility)
exports.updatePatientStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    const { id } = req.params;
    
    const patient = await Patient.findById(id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    const user = await User.findByIdAndUpdate(
      patient.user,
      { isActive: isActive === true || isActive === 'true' },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ 
      success: true,
      message: `Patient ${isActive ? 'activated' : 'deactivated'} successfully`,
      user 
    });
  } catch (error) {
    console.error('Update patient status error:', error);
    res.status(400).json({ message: error.message });
  }
};

exports.deletePatientByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    
    const patient = await Patient.findById(id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    const userId = patient.user;
    
    await Patient.findByIdAndDelete(id);
    await HealthLog.deleteMany({ patient: id });
    await User.findByIdAndDelete(userId);
    
    console.log(`🗑️ Admin deleted patient with ID: ${id}`);
    
    res.json({ 
      message: 'Patient and all associated records deleted successfully' 
    });
  } catch (error) {
    console.error('Delete patient error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// SPECIALIZATIONS CRUD
// ============================================
exports.getSpecializations = async (req, res) => {
  try {
    const specializations = await Specialization.find({});
    res.json(specializations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createSpecialization = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const existing = await Specialization.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: 'Specialization already exists' });
    }
    
    const specialization = new Specialization({
      name,
      description: description || '',
      isActive: true
    });
    await specialization.save();
    
    res.status(201).json(specialization);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateSpecialization = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;
    
    const specialization = await Specialization.findByIdAndUpdate(
      id,
      { name, description, isActive },
      { new: true, runValidators: true }
    );
    
    if (!specialization) {
      return res.status(404).json({ message: 'Specialization not found' });
    }
    
    res.json(specialization);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteSpecialization = async (req, res) => {
  try {
    const { id } = req.params;
    
    const doctorsUsing = await User.countDocuments({ specialization: id, role: 'doctor' });
    if (doctorsUsing > 0) {
      return res.status(400).json({ 
        message: `Cannot delete: ${doctorsUsing} doctor(s) are using this specialization` 
      });
    }
    
    await Specialization.findByIdAndDelete(id);
    res.json({ message: 'Specialization deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};