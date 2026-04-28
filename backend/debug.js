const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User.model');
const Patient = require('./models/Patient.model');

async function debug() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Check users
    const users = await User.find({});
    console.log('=== USERS ===');
    users.forEach(u => {
      console.log(`${u.email} - Role: ${u.role} - ID: ${u._id}`);
    });

    // Check patients
    const patients = await Patient.find({});
    console.log('\n=== PATIENTS ===');
    patients.forEach(p => {
      console.log(`Patient ID: ${p._id} - User: ${p.user} - Doctor: ${p.assignedDoctor || 'None'}`);
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

debug();