const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  medicalHistory: [{
    condition: String,
    diagnosedDate: Date,
    status: {
      type: String,
      enum: ['active', 'resolved', 'chronic'],
      default: 'active'
    }
  }],
  // ✅ ADD THIS - Conditions array for analytics
  conditions: [{
    name: {
      type: String,
      enum: [
        'Diabetes', 'Hypertension', 'Asthma', 'Heart Disease', 
        'Arthritis', 'COPD', 'Depression', 'Anxiety', 
        'Obesity', 'Thyroid Disorder', 'Kidney Disease',
        'Cancer', 'Stroke', "Alzheimer's", "Parkinson's",
        'Multiple Sclerosis', 'Epilepsy', 'HIV/AIDS',
        'Hepatitis', 'Tuberculosis', 'Pneumonia',
        'Bronchitis', 'Migraine', 'Osteoporosis'
      ],
      required: true
    },
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe'],
      default: 'moderate'
    },
    diagnosedDate: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  allergies: [{
    type: String,
    trim: true
  }],
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''],
    default: ''
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  },
  assignedDoctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, { 
  timestamps: true 
});

// Index for efficient queries
patientSchema.index({ user: 1 });
patientSchema.index({ assignedDoctor: 1 });
patientSchema.index({ 'conditions.name': 1 });

module.exports = mongoose.model('Patient', patientSchema);