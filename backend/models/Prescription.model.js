const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  medications: [{
    name: {
      type: String,
      required: true
    },
    dosage: String,
    frequency: String,
    duration: String
  }],
  notes: {
    type: String,
    default: ''
  },
  refillsRemaining: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  issuedDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Prescription', prescriptionSchema);