const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  licenseNumber: { type: String, required: true, unique: true },
  specialization: { type: String, required: true },
  hospitals: [{
    hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
    workingHours: String,
    consultationFee: Number
  }],
  qualifications: [String],
  experienceYears: Number,
  availability: {
    monday: { start: String, end: String, slots: [] },
    tuesday: { start: String, end: String, slots: [] },
    wednesday: { start: String, end: String, slots: [] },
    thursday: { start: String, end: String, slots: [] },
    friday: { start: String, end: String, slots: [] },
    saturday: { start: String, end: String, slots: [] },
    sunday: { start: String, end: String, slots: [] }
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);