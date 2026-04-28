const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  issuedDate: { type: Date, default: Date.now },
  medications: [{
    name: { type: String, required: true },
    dosage: String,
    frequency: String,
    duration: String,
    instructions: String
  }],
  refillsRemaining: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  notes: String
}, { timestamps: true });

module.exports = mongoose.model('Prescription', prescriptionSchema);