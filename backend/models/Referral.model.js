// backend/models/Referral.model.js
const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  fromDoctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  toDoctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'denied', 'cancelled'],
    default: 'pending'
  },
  notes: {
    type: String,
    default: ''
  },
  responseNotes: {
    type: String,
    default: ''
  },
  respondedAt: {
    type: Date
  }
}, { timestamps: true });

// Indexes for efficient queries
referralSchema.index({ patient: 1 });
referralSchema.index({ fromDoctor: 1 });
referralSchema.index({ toDoctor: 1 });
referralSchema.index({ status: 1 });

module.exports = mongoose.model('Referral', referralSchema);