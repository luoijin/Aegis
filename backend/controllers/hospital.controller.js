const Hospital = require('../models/Hospital.model');

// Get all hospitals
exports.getHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find({ isActive: true });
    res.json(hospitals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get hospital by ID
exports.getHospitalById = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }
    res.json(hospital);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create hospital (Admin only)
exports.createHospital = async (req, res) => {
  try {
    const hospital = new Hospital(req.body);
    await hospital.save();
    res.status(201).json(hospital);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update hospital (Admin only)
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

// Get hospitals near location
exports.getNearbyHospitals = async (req, res) => {
  try {
    const { lng, lat, radius = 10 } = req.query;
    
    const hospitals = await Hospital.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: radius * 1000 // Convert km to meters
        }
      },
      isActive: true
    });
    
    res.json(hospitals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};