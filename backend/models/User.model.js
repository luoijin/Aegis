const mongoose = require('mongoose');
const CryptoJS = require('crypto-js');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['doctor', 'patient', 'admin'],
    required: true
  },
  profile: {
    firstName: String,
    lastName: String,
    phone: String,
    dateOfBirth: Date,
    gender: String
  },
  // Doctor-specific fields
  licenseNumber: String,
  specialization: String,
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital'
  },
  consultationFee: Number,
  isActive: {
    type: Boolean,
    default: true
  },
  // ✅ ADD THIS - FCM Token for push notifications
  fcmToken: {
    type: String,
    default: null
  }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', function(next) {
  if (!this.isModified('password')) return next();
  this.password = CryptoJS.AES.encrypt(this.password, process.env.JWT_SECRET || 'secret').toString();
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  const decrypted = CryptoJS.AES.decrypt(this.password, process.env.JWT_SECRET || 'secret').toString(CryptoJS.enc.Utf8);
  return decrypted === candidatePassword;
};

module.exports = mongoose.model('User', userSchema);