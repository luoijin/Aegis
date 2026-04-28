const Hospital = require('../../models/Hospital.model');

// Create hospital
exports.createHospital = async (req, res) => {
  try {
    const { name, address, city, pincode, phone, departments } = req.body;
    
    const existingHospital = await Hospital.findOne({ name, city });
    if (existingHospital) {
      return res.status(400).json({ message: 'Hospital already exists in this city' });
    }
    
    const hospital = new Hospital({
      name,
      address,
      city,
      pincode,
      phone,
      departments: departments || []
    });
    
    await hospital.save();
    
    res.status(201).json({
      message: 'Hospital created successfully',
      hospital
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all hospitals
exports.getAllHospitals = async (req, res) => {
  try {
    const { city, search } = req.query;
    let query = { isActive: true };
    
    if (city) query.city = city;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } }
      ];
    }
    
    const hospitals = await Hospital.find(query).sort({ name: 1 });
    res.json(hospitals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single hospital
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

// Update hospital
exports.updateHospital = async (req, res) => {
  try {
    const { name, address, city, pincode, phone, departments, isActive } = req.body;
    
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }
    
    if (name) hospital.name = name;
    if (address) hospital.address = address;
    if (city) hospital.city = city;
    if (pincode) hospital.pincode = pincode;
    if (phone) hospital.phone = phone;
    if (departments) hospital.departments = departments;
    if (isActive !== undefined) hospital.isActive = isActive;
    
    await hospital.save();
    
    res.json({
      message: 'Hospital updated successfully',
      hospital
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete hospital (soft delete)
exports.deleteHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }
    
    hospital.isActive = false;
    await hospital.save();
    
    res.json({ message: 'Hospital deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};