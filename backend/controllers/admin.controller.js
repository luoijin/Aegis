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

// Get global patient condition analytics
  exports.getGlobalPatientAnalytics = async (req, res) => {
    try {
      const Patient = require('../models/Patient.model');
      const patients = await Patient.find().populate('user', 'profile');

      const conditionStats = {};
      let totalConditions = 0;

      patients.forEach(patient => {
        if (patient.conditions && patient.conditions.length > 0) {
          patient.conditions.forEach(condition => {
            if (condition.isActive !== false) {
              conditionStats[condition.name] = (conditionStats[condition.name] || 0) + 1;
              totalConditions++;
            }
          });
        }
      });

      const analyticsData = Object.entries(conditionStats).map(([name, count]) => ({
        name,
        value: count,
        percentage: ((count / totalConditions) * 100).toFixed(1)
      })).sort((a, b) => b.value - a.value);

      res.json({
        totalPatients: patients.length,
        totalConditions,
        conditions: analyticsData
      });
    } catch (error) {
      console.error('Global analytics error:', error);
      res.status(500).json({ message: error.message });
    }
  };

// Hospital CRUD
exports.getHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find({}).sort({ createdAt: -1 });
    
    // Get doctor count for each hospital
    const hospitalsWithStats = await Promise.all(
      hospitals.map(async (hospital) => {
        const doctorCount = await User.countDocuments({ 
          hospital: hospital._id, 
          role: 'doctor',
          isActive: true
        });
        return {
          ...hospital.toObject(),
          doctorCount
        };
      })
    );
    
    res.json(hospitalsWithStats);
  } catch (error) {
    console.error('Get hospitals error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getHospitalById = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }
    
    const doctorCount = await User.countDocuments({ 
      hospital: hospital._id, 
      role: 'doctor',
      isActive: true
    });
    
    const doctors = await User.find({ 
      hospital: hospital._id, 
      role: 'doctor',
      isActive: true
    }).select('email profile specialization licenseNumber isActive');
    
    res.json({
      ...hospital.toObject(),
      doctorCount,
      doctors
    });
  } catch (error) {
    console.error('Get hospital by ID error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get hospital with doctor details
exports.getHospitalWithDoctors = async (req, res) => {
  try {
    const { id } = req.params;
    const hospital = await Hospital.findById(id);
    
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }
    
    // Get doctors assigned to this hospital
    const doctors = await User.find({ 
      hospital: id, 
      role: 'doctor',
      isActive: true
    }).select('email profile specialization licenseNumber isActive');
    
    // Get doctor count
    const doctorCount = doctors.length;
    
    res.json({
      ...hospital.toObject(),
      doctorCount,
      doctors
    });
  } catch (error) {
    console.error('Get hospital with doctors error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get all hospitals with doctor counts
exports.getAllHospitalsWithStats = async (req, res) => {
  try {
    const hospitals = await Hospital.find({}).sort({ createdAt: -1 });
    
    const hospitalsWithStats = await Promise.all(
      hospitals.map(async (hospital) => {
        const doctorCount = await User.countDocuments({ 
          hospital: hospital._id, 
          role: 'doctor',
          isActive: true
        });
        return {
          ...hospital.toObject(),
          doctorCount
        };
      })
    );
    
    res.json(hospitalsWithStats);
  } catch (error) {
    console.error('Get hospitals with stats error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Add/update this function
exports.updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { profile, licenseNumber, specialization, hospital, isActive } = req.body;
    
    const doctor = await User.findById(id);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    // Update profile
    if (profile) {
      if (profile.firstName) doctor.profile.firstName = profile.firstName;
      if (profile.lastName) doctor.profile.lastName = profile.lastName;
      if (profile.phone) doctor.profile.phone = profile.phone;
    }
    
    // Update other fields
    if (licenseNumber !== undefined) doctor.licenseNumber = licenseNumber;
    if (specialization !== undefined) doctor.specialization = specialization;
    if (hospital !== undefined) doctor.hospital = hospital;
    if (isActive !== undefined) doctor.isActive = isActive;
    
    await doctor.save();
    
    // Populate hospital for response
    await doctor.populate('hospital', 'name address phone');
    
    res.json({ 
      message: 'Doctor updated successfully', 
      doctor 
    });
  } catch (error) {
    console.error('Update doctor error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update doctor's hospital assignment
exports.updateDoctorHospital = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { hospitalId } = req.body;
    
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    doctor.hospital = hospitalId === '' || hospitalId === null ? null : hospitalId;
    await doctor.save();
    
    const updatedDoctor = await User.findById(doctorId)
      .select('-password')
      .populate('hospital', 'name address phone');
    
    res.json({ 
      message: 'Doctor hospital updated successfully', 
      doctor: updatedDoctor 
    });
  } catch (error) {
    console.error('Update doctor hospital error:', error);
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
      .select('-password')
      .populate('hospital', 'name address phone')
      .sort({ createdAt: -1 });
    
    res.json(doctors);
  } catch (error) {
    console.error('Get all doctors error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateDoctorStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    
    const doctor = await User.findById(id);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    doctor.isActive = isActive;
    await doctor.save();
    
    res.json({ message: `Doctor ${isActive ? 'activated' : 'deactivated'} successfully` });
  } catch (error) {
    console.error('Update doctor status error:', error);
    res.status(500).json({ message: error.message });
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
      .populate('user', 'email profile isActive')
      .populate('assignedDoctor', 'email profile specialization')
      .sort({ createdAt: -1 });
    
    res.json(patients);
  } catch (error) {
    console.error('Get all patients error:', error);
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
    const { profile, bloodType, assignedDoctor, isActive } = req.body;
    
    console.log('Updating patient:', id);
    console.log('Update data:', req.body);
    
    // Find the patient
    const patient = await Patient.findById(id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    // Update patient-specific fields
    if (bloodType !== undefined) patient.bloodType = bloodType;
    if (assignedDoctor !== undefined) patient.assignedDoctor = assignedDoctor;
    if (isActive !== undefined) patient.isActive = isActive;
    
    // Update user profile if provided
    if (profile) {
      const user = await User.findById(patient.user);
      if (user) {
        if (profile.firstName !== undefined) user.profile.firstName = profile.firstName;
        if (profile.lastName !== undefined) user.profile.lastName = profile.lastName;
        if (profile.phone !== undefined) user.profile.phone = profile.phone;
        if (profile.dateOfBirth !== undefined) user.profile.dateOfBirth = profile.dateOfBirth || null;
        if (profile.gender !== undefined) user.profile.gender = profile.gender;
        
        await user.save();
        console.log('User updated:', user.email);
      }
    }
    
    await patient.save();
    
    // Return updated patient with populated data
    const updatedPatient = await Patient.findById(id)
      .populate('user', 'email profile isActive')
      .populate('assignedDoctor', 'email profile specialization');
    
    console.log('Patient updated successfully');
    res.json({ 
      message: 'Patient updated successfully', 
      patient: updatedPatient 
    });
  } catch (error) {
    console.error('Update patient error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update patient status (activate/deactivate)
exports.updatePatientStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    
    const patient = await Patient.findById(id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    // Update the user's isActive status
    const user = await User.findById(patient.user);
    if (user) {
      user.isActive = isActive;
      await user.save();
    }
    
    res.json({ message: `Patient ${isActive ? 'activated' : 'deactivated'} successfully` });
  } catch (error) {
    console.error('Update patient status error:', error);
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
    const { profile, licenseNumber, specialization, hospital, isActive } = req.body;
    
    console.log('Updating doctor:', id);
    console.log('Update data:', req.body);
    
    // Find the doctor
    const doctor = await User.findById(id);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    // Update profile fields
    if (profile) {
      if (profile.firstName !== undefined) doctor.profile.firstName = profile.firstName;
      if (profile.lastName !== undefined) doctor.profile.lastName = profile.lastName;
      if (profile.phone !== undefined) doctor.profile.phone = profile.phone;
      if (profile.dateOfBirth !== undefined) doctor.profile.dateOfBirth = profile.dateOfBirth || null;
      if (profile.gender !== undefined) doctor.profile.gender = profile.gender;
    }
    
    // Update other fields
    if (licenseNumber !== undefined) doctor.licenseNumber = licenseNumber;
    if (specialization !== undefined) doctor.specialization = specialization;
    if (hospital !== undefined) doctor.hospital = hospital === '' || hospital === null ? null : hospital;
    if (isActive !== undefined) doctor.isActive = isActive;
    
    await doctor.save();
    console.log('Doctor saved successfully');
    
    // Return updated doctor with populated data
    const updatedDoctor = await User.findById(id)
      .select('-password')
      .populate('hospital', 'name address phone');
    
    console.log('Updated doctor:', updatedDoctor.email);
    
    res.json({ 
      message: 'Doctor updated successfully', 
      doctor: updatedDoctor 
    });
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

exports.createDoctorByAdmin = async (req, res) => {
  try {
    const { email, password, profile, licenseNumber, specialization, hospital } = req.body;
    
    console.log('Creating doctor with data:', { email, profile, licenseNumber, specialization, hospital });
    
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
        phone: profile.phone || '',
        dateOfBirth: profile.dateOfBirth || null,
        gender: profile.gender || ''
      },
      licenseNumber: licenseNumber || '',
      specialization: specialization || '',
      hospital: hospital || null,
      isActive: true
    });
    
    await user.save();
    console.log('Doctor created successfully:', user._id);
    
    // Return populated doctor data
    const createdDoctor = await User.findById(user._id)
      .select('-password')
      .populate('hospital', 'name address phone');
    
    res.status(201).json({ 
      message: 'Doctor created successfully',
      doctor: createdDoctor
    });
  } catch (error) {
    console.error('Create doctor error:', error);
    res.status(500).json({ message: error.message });
  }
};