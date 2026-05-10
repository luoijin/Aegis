const Hospital = require('../models/Hospital.model');
const Patient = require('../models/Patient.model');

exports.getPlatformStats = async (req, res) => {
  try {
    const totalHospitals = await Hospital.countDocuments({ isActive: true });
    const totalPatients = await Patient.countDocuments();
    res.json({ totalHospitals, totalPatients });
  } catch (error) {
    console.error('Error fetching platform stats:', error);
    res.status(500).json({ message: error.message });
  }
};