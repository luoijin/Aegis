const HealthLog = require('../models/HealthLog.model');

const determineHealthStatus = (vitals) => {
  if (!vitals) return 'normal';
  
  const { heartRate, bloodPressure, temperature, oxygenSaturation } = vitals;
  
  // Critical conditions
  if (heartRate && (heartRate < 40 || heartRate > 140)) return 'critical';
  if (bloodPressure && (bloodPressure.systolic > 180 || bloodPressure.diastolic > 120)) return 'critical';
  if (temperature && (temperature > 39.5 || temperature < 35)) return 'critical';
  if (oxygenSaturation && oxygenSaturation < 85) return 'critical';
  
  // Warning conditions
  if (heartRate && (heartRate < 50 || heartRate > 110)) return 'warning';
  if (bloodPressure && (bloodPressure.systolic > 140 || bloodPressure.diastolic > 90)) return 'warning';
  if (temperature && (temperature > 38.5 || temperature < 36)) return 'warning';
  if (oxygenSaturation && oxygenSaturation < 92) return 'warning';
  
  return 'normal';
};

exports.createHealthLog = async (req, res) => {
  try {
    const healthLog = new HealthLog({
      ...req.body,
      recordedBy: req.user._id
    });

    healthLog.status = determineHealthStatus(healthLog.vitals);
    
    await healthLog.save();
    await healthLog.populate('patient');
    await healthLog.populate('recordedBy', 'email profile');
    
    res.status(201).json(healthLog);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getHealthLogs = async (req, res) => {
  try {
    const { patientId, startDate, endDate, status } = req.query;
    let query = {};

    if (patientId) query.patient = patientId;
    if (status) query.status = status;
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const logs = await HealthLog.find(query)
      .populate('patient')
      .populate('recordedBy', 'email profile')
      .sort({ createdAt: -1 });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getHealthLogById = async (req, res) => {
  try {
    const log = await HealthLog.findById(req.params.id)
      .populate('patient')
      .populate('recordedBy', 'email profile');
    
    if (!log) {
      return res.status(404).json({ message: 'Health log not found' });
    }
    
    res.json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateHealthLog = async (req, res) => {
  try {
    const log = await HealthLog.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!log) {
      return res.status(404).json({ message: 'Health log not found' });
    }
    
    if (req.body.vitals) {
      log.status = determineHealthStatus(req.body.vitals);
      await log.save();
    }
    
    res.json(log);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteHealthLog = async (req, res) => {
  try {
    const log = await HealthLog.findByIdAndDelete(req.params.id);
    if (!log) {
      return res.status(404).json({ message: 'Health log not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getVitalsTrends = async (req, res) => {
  try {
    const { patientId, days = 30 } = req.query;
    
    const logs = await HealthLog.find({
      patient: patientId,
      createdAt: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) }
    }).sort({ createdAt: 1 });

    const trends = {
      heartRate: logs.map(log => ({
        date: log.createdAt,
        value: log.vitals?.heartRate
      })).filter(item => item.value),
      bloodPressureSystolic: logs.map(log => ({
        date: log.createdAt,
        value: log.vitals?.bloodPressure?.systolic
      })).filter(item => item.value),
      bloodPressureDiastolic: logs.map(log => ({
        date: log.createdAt,
        value: log.vitals?.bloodPressure?.diastolic
      })).filter(item => item.value),
      temperature: logs.map(log => ({
        date: log.createdAt,
        value: log.vitals?.temperature
      })).filter(item => item.value)
    };

    res.json(trends);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};