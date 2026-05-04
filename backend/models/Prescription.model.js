// backend/models/Prescription.model.js
const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  dosage: {
    type: String,
    required: true
  },
  frequency: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    default: ''
  },
  instructions: {
    type: String,
    default: ''
  }
});

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
  medications: [medicationSchema],
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
  },
  expiryDate: {
    type: Date
  }
}, { timestamps: true });

// Indexes
prescriptionSchema.index({ patient: 1 });
prescriptionSchema.index({ doctor: 1 });
prescriptionSchema.index({ isActive: 1 });

module.exports = mongoose.model('Prescription', prescriptionSchema);