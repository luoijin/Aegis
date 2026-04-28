const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  fromDoctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  toDoctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true },
  priority: { type: String, enum: ['normal', 'urgent', 'emergency'], default: 'normal' },
  notes: String,
  status: { type: String, enum: ['pending', 'accepted', 'denied'], default: 'pending' },
  responseNotes: String,
  respondedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Referral', referralSchema);