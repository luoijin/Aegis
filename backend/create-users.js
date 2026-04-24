const mongoose = require('mongoose');
const CryptoJS = require('crypto-js');
require('dotenv').config();

const User = require('./models/User.model');

async function createUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create doctor
    const doctor = new User({
      email: 'doctor@aegis.com',
      password: '123456',
      role: 'doctor',
      profile: {
        firstName: 'John',
        lastName: 'Smith',
        phone: '1234567890'
      }
    });
    await doctor.save();
    console.log('✅ Doctor created: doctor@aegis.com / 123456');

    // Create patient
    const patient = new User({
      email: 'patient@aegis.com',
      password: '123456',
      role: 'patient',
      profile: {
        firstName: 'Jane',
        lastName: 'Doe',
        phone: '0987654321'
      }
    });
    await patient.save();
    console.log('✅ Patient created: patient@aegis.com / 123456');

    // Test login
    const testDoctor = await User.findOne({ email: 'doctor@aegis.com' });
    const isValid = await testDoctor.comparePassword('123456');
    console.log(`\nLogin test for doctor: ${isValid ? '✅ SUCCESS' : '❌ FAILED'}`);

    await mongoose.disconnect();
    console.log('\n✅ Setup complete! You can now login.');

  } catch (error) {
    console.error('Error:', error);
  }
}

createUsers();