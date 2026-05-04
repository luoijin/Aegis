const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'USA' }
  },
  phone: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Virtual to get doctors count
hospitalSchema.virtual('doctorCount', {
  ref: 'User',
  localField: '_id',
  foreignField: 'hospital',
  count: true,
  match: { role: 'doctor' }
});

// Virtual to get doctors list
hospitalSchema.virtual('doctors', {
  ref: 'User',
  localField: '_id',
  foreignField: 'hospital',
  match: { role: 'doctor' }
});

hospitalSchema.set('toJSON', { virtuals: true });
hospitalSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Hospital', hospitalSchema);