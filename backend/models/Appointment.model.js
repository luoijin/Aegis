const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
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
  dateTime: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    default: 30,
    enum: [15, 30, 45, 60]
  },
  type: {
    type: String,
    enum: ['in-person', 'video', 'phone'],
    default: 'in-person'
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  reason: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  },
  cancellationReason: {
    type: String,
    default: ''
  }
}, { timestamps: true });

// Indexes for efficient queries
appointmentSchema.index({ doctor: 1, dateTime: 1 });
appointmentSchema.index({ patient: 1 });
appointmentSchema.index({ status: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);