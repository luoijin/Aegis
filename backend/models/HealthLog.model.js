const mongoose = require('mongoose');

const healthLogSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vitals: {
    bloodPressure: {
      systolic: Number,
      diastolic: Number
    },
    heartRate: Number,
    temperature: Number,
    respiratoryRate: Number,
    oxygenSaturation: Number,
    bloodGlucose: Number,
    weight: Number,
    height: Number
  },
  symptoms: [String],
  medications: [{
    name: String,
    dosage: String,
    time: String
  }],
  notes: String,
  status: {
    type: String,
    enum: ['normal', 'warning', 'critical'],
    default: 'normal'
  }
}, { timestamps: true });

// Index for efficient queries
healthLogSchema.index({ patient: 1, createdAt: -1 });
healthLogSchema.index({ status: 1 });

module.exports = mongoose.model('HealthLog', healthLogSchema);