const User = require('../models/User.model');
const Patient = require('../models/Patient.model');
const Hospital = require('../models/Hospital.model');
const Specialization = require('../models/Specialization.model');
const HealthLog = require('../models/HealthLog.model');

// Dashboard Stats
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

// Hospital CRUD
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
    res.json(hospital);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteHospital = async (req, res) => {
  try {
    await Hospital.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Doctor Management
exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' })
      .select('-password');
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
    res.json(doctor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete doctor - PERMANENTLY remove from database
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

// Patient Management - ONLY ONE VERSION OF EACH
// Get all patients
exports.getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find({})
      .populate('user', 'email profile isActive')  // Make sure isActive is included
      .populate('assignedDoctor', 'email profile');
    
    console.log(`📊 Admin fetched ${patients.length} patients`);
    console.log('Patient statuses:', patients.map(p => ({
      name: p.user?.profile?.firstName,
      email: p.user?.email,
      isActive: p.user?.isActive
    })));
    
    res.json(patients);
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ message: error.message });
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

// Update patient (admin only) - Updates both User and Patient collections
exports.updatePatientByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phone, bloodType, allergies, assignedDoctor } = req.body;
    
    // Find the patient record
    const patient = await Patient.findById(id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    // Update User collection
    const user = await User.findById(patient.user);
    if (user) {
      if (firstName) user.profile.firstName = firstName;
      if (lastName) user.profile.lastName = lastName;
      if (phone) user.profile.phone = phone;
      if (email) user.email = email;
      await user.save();
    }
    
    // Update Patient collection
    if (bloodType) patient.bloodType = bloodType;
    if (allergies) patient.allergies = allergies;
    if (assignedDoctor !== undefined) patient.assignedDoctor = assignedDoctor || null;
    await patient.save();
    
    // Return updated patient with populated user data
    const updatedPatient = await Patient.findById(id)
      .populate('user', 'email profile')
      .populate('assignedDoctor', 'email profile');
    
    console.log(`✅ Admin updated patient: ${user?.email}`);
    
    res.json(updatedPatient);
  } catch (error) {
    console.error('Update patient error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update patient status (activate/deactivate)
// Update patient status (activate/deactivate)
exports.updatePatientStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    const { id } = req.params;
    
    console.log(`📝 Updating patient status - Patient ID: ${id}, isActive: ${isActive}`);
    
    // Find the patient record
    const patient = await Patient.findById(id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    console.log(`   Found patient, user ID: ${patient.user}`);
    
    // Update the user's isActive status
    const updatedUser = await User.findByIdAndUpdate(
      patient.user,
      { isActive: isActive === true || isActive === 'true' },
      { new: true }  // This returns the updated document
    );
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log(`✅ User updated: ${updatedUser.email} is now ${updatedUser.isActive ? 'ACTIVE' : 'INACTIVE'}`);
    
    // Return the updated patient with fresh user data
    const updatedPatient = await Patient.findById(id)
      .populate('user', 'email profile isActive')
      .populate('assignedDoctor', 'email profile');
    
    res.json({ 
      success: true,
      message: `Patient ${isActive ? 'activated' : 'deactivated'} successfully`,
      patient: updatedPatient
    });
  } catch (error) {
    console.error('Update patient status error:', error);
    res.status(400).json({ message: error.message });
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
    const { name, description, isActive } = req.body;
    
    const existing = await Specialization.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: 'Specialization already exists' });
    }
    
    const specialization = new Specialization({
      name,
      description: description || '',
      isActive: isActive !== false
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

// Delete specialization and remove it from all doctors
exports.deleteSpecialization = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the specialization to get its name
    const specialization = await Specialization.findById(id);
    if (!specialization) {
      return res.status(404).json({ message: 'Specialization not found' });
    }
    
    const specName = specialization.name;
    
    // Remove this specialization from all doctors who have it
    const updateResult = await User.updateMany(
      { role: 'doctor', specialization: specName },
      { $set: { specialization: '' } }
    );
    
    console.log(`Removed specialization "${specName}" from ${updateResult.modifiedCount} doctors`);
    
    // Delete the specialization
    await Specialization.findByIdAndDelete(id);
    
    res.json({ 
      message: `Specialization "${specName}" deleted successfully`,
      doctorsUpdated: updateResult.modifiedCount
    });
  } catch (error) {
    console.error('Delete specialization error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update doctor (admin only)
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
    
    // Handle specialization - store the name, not the ID
    if (specialization !== undefined) {
      doctor.specialization = specialization || '';
    }
    
    if (hospital !== undefined) doctor.hospital = hospital;
    if (isActive !== undefined) doctor.isActive = isActive;
    
    await doctor.save();
    
    console.log(`✅ Admin updated doctor: ${doctor.email} - Specialization: ${doctor.specialization || 'None'}`);
    
    const updatedDoctor = await User.findById(id).select('-password');
    res.json(updatedDoctor);
  } catch (error) {
    console.error('Update doctor error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get all specializations
exports.getSpecializations = async (req, res) => {
  try {
    const specializations = await Specialization.find({});
    res.json(specializations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create specialization
exports.createSpecialization = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Check if specialization already exists
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

// Update specialization and cascade to all doctors
exports.updateSpecialization = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;
    
    // Find the original specialization
    const originalSpec = await Specialization.findById(id);
    if (!originalSpec) {
      return res.status(404).json({ message: 'Specialization not found' });
    }
    
    const oldName = originalSpec.name;
    const newName = name;
    
    // Update the specialization
    const specialization = await Specialization.findByIdAndUpdate(
      id,
      { name: newName, description, isActive },
      { new: true, runValidators: true }
    );
    
    // If the name changed, update all doctors who had this specialization
    if (oldName !== newName) {
      const updateResult = await User.updateMany(
        { role: 'doctor', specialization: oldName },
        { $set: { specialization: newName } }
      );
      console.log(`✅ Updated ${updateResult.modifiedCount} doctors from "${oldName}" to "${newName}"`);
    }
    
    res.json(specialization);
  } catch (error) {
    console.error('Update specialization error:', error);
    res.status(400).json({ message: error.message });
  }
};

// Delete specialization - only allowed if no doctors are using it
exports.deleteSpecialization = async (req, res) => {
  try {
    const { id } = req.params;
    
    const specialization = await Specialization.findById(id);
    if (!specialization) {
      return res.status(404).json({ message: 'Specialization not found' });
    }
    
    // Check if any doctors use this specialization
    const doctorsUsing = await User.countDocuments({ 
      role: 'doctor', 
      specialization: specialization.name 
    });
    
    if (doctorsUsing > 0) {
      return res.status(400).json({ 
        message: `Cannot delete: ${doctorsUsing} doctor(s) are using this specialization. Please reassign them first.` 
      });
    }
    
    await Specialization.findByIdAndDelete(id);
    res.json({ message: 'Specialization deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Clean up orphaned specializations from doctors
exports.cleanupOrphanedSpecializations = async (req, res) => {
  try {
    // Get all active specialization names
    const activeSpecializations = await Specialization.find({ isActive: true });
    const activeSpecNames = activeSpecializations.map(s => s.name);
    
    // Find doctors with specializations that no longer exist
    const doctors = await User.find({ role: 'doctor', specialization: { $nin: activeSpecNames, $ne: '' } });
    
    let cleaned = 0;
    for (const doctor of doctors) {
      doctor.specialization = '';
      await doctor.save();
      cleaned++;
    }
    
    res.json({ 
      message: `Cleaned up ${cleaned} doctors with invalid specializations`,
      cleaned
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};