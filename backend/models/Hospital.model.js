const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: String,
  city: String,
  pincode: String,
  phone: String,
  email: String,
  departments: [{
    name: String,
    head: String,
    contact: String
  }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Hospital', hospitalSchema);