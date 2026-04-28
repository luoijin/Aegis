const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scheduledDate: { type: Date, required: true },
  duration: { type: Number, default: 30 },
  type: { type: String, enum: ['in-person', 'video', 'phone'], default: 'in-person' },
  status: { type: String, enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'], default: 'scheduled' },
  reason: String,
  meetingLink: String,
  cancellationReason: String
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);