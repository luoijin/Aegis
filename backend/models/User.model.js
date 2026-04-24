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
    enum: ['doctor', 'patient'],
    required: true
  },
  profile: {
    firstName: String,
    lastName: String,
    phone: String,
    dateOfBirth: Date,
    gender: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', function(next) {
  if (!this.isModified('password')) return next();
  
  // Use crypto-js to encrypt password
  this.password = CryptoJS.AES.encrypt(this.password, process.env.JWT_SECRET || 'secret').toString();
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  const decrypted = CryptoJS.AES.decrypt(this.password, process.env.JWT_SECRET || 'secret').toString(CryptoJS.enc.Utf8);
  return decrypted === candidatePassword;
};

module.exports = mongoose.model('User', userSchema);