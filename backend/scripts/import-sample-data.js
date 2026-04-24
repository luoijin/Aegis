const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User.model');
const Patient = require('../models/Patient.model');
const HealthLog = require('../models/HealthLog.model');

const sampleData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Patient.deleteMany({});
    await HealthLog.deleteMany({});

    // Create doctor
    const doctor = await User.create({
      email: 'dr.smith@aegis.com',
      password: await bcrypt.hash('123456', 10),
      role: 'doctor',
      profile: { firstName: 'John', lastName: 'Smith', phone: '+1234567890' }
    });

    // Create patients
    const patients = [];
    for (let i = 1; i <= 5; i++) {
      const user = await User.create({
        email: `patient${i}@example.com`,
        password: await bcrypt.hash('123456', 10),
        role: 'patient',
        profile: { firstName: `Patient${i}`, lastName: `Test${i}`, phone: `+123456789${i}` }
      });
      
      const patient = await Patient.create({
        user: user._id,
        bloodType: ['A+', 'B+', 'O+', 'AB+'][Math.floor(Math.random() * 4)],
        allergies: Math.random() > 0.7 ? ['Penicillin'] : [],
        assignedDoctor: doctor._id
      });
      patients.push(patient);
    }

    // Create health logs for past 30 days
    const statuses = ['normal', 'normal', 'normal', 'warning', 'critical'];
    for (const patient of patients) {
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        await HealthLog.create({
          patient: patient._id,
          recordedBy: doctor._id,
          vitals: {
            heartRate: 65 + Math.floor(Math.random() * 30),
            bloodPressure: {
              systolic: 110 + Math.floor(Math.random() * 30),
              diastolic: 70 + Math.floor(Math.random() * 20)
            },
            temperature: 36.5 + (Math.random() * 1.5),
            oxygenSaturation: 94 + Math.floor(Math.random() * 6)
          },
          symptoms: i % 10 === 0 ? ['headache'] : [],
          notes: i % 7 === 0 ? 'Regular checkup' : '',
          createdAt: date,
          status: statuses[Math.floor(Math.random() * statuses.length)]
        });
      }
    }

    console.log('Sample data imported!');
    console.log('Doctor login: dr.smith@aegis.com / 123456');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

sampleData();