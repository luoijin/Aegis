const User = require('../../models/User.model');
const Doctor = require('../../models/Doctor.model');
const Patient = require('../../models/Patient.model');
const Hospital = require('../../models/Hospital.model');
const Referral = require('../../models/Referral.model');

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalPatients,
      totalDoctors,
      totalHospitals,
      activeDoctors,
      totalReferrals,
      pendingReferrals
    ] = await Promise.all([
      Patient.countDocuments(),
      Doctor.countDocuments({ isActive: true }),
      Hospital.countDocuments({ isActive: true }),
      Doctor.countDocuments({ isActive: true }),
      Referral.countDocuments(),
      Referral.countDocuments({ status: 'pending' })
    ]);
    
    res.json({
      totalPatients,
      totalDoctors,
      totalHospitals,
      activeDoctors,
      totalReferrals,
      pendingReferrals,
      doctorToPatientRatio: totalDoctors > 0 ? (totalPatients / totalDoctors).toFixed(1) : 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get specialization distribution
exports.getSpecializationDistribution = async (req, res) => {
  try {
    const distribution = await Doctor.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$specialization', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    res.json(distribution);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get recent activity
exports.getRecentActivity = async (req, res) => {
  try {
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name email role createdAt');
    
    const recentReferrals = await Referral.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('fromDoctorId', 'userId')
      .populate('toDoctorId', 'userId');
    
    res.json({
      recentRegistrations: recentUsers,
      recentReferrals
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};