const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User.model');

async function fixAuth() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear all users first
    await User.deleteMany({});
    console.log('✅ Cleared all existing users');

    // Create new doctor using a different hashing method
    const plainPassword = '123456';
    
    // Generate salt and hash
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(plainPassword, salt);
    
    const doctor = new User({
      email: 'doctor@aegis.com',
      password: hashedPassword,
      role: 'doctor',
      profile: {
        firstName: 'John',
        lastName: 'Smith',
        phone: '1234567890'
      }
    });
    
    await doctor.save();
    console.log('✅ Doctor created:', doctor.email);
    
    // Verify immediately
    const testCompare = bcrypt.compareSync('123456', doctor.password);
    console.log(`Password verification: ${testCompare ? 'SUCCESS ✅' : 'FAILED ❌'}`);
    
    // Create a test patient
    const patientSalt = bcrypt.genSaltSync(10);
    const patientHash = bcrypt.hashSync('123456', patientSalt);
    
    const patient = new User({
      email: 'patient@aegis.com',
      password: patientHash,
      role: 'patient',
      profile: {
        firstName: 'Jane',
        lastName: 'Doe',
        phone: '0987654321'
      }
    });
    
    await patient.save();
    console.log('✅ Patient created:', patient.email);
    
    const patientVerify = bcrypt.compareSync('123456', patient.password);
    console.log(`Patient verification: ${patientVerify ? 'SUCCESS ✅' : 'FAILED ❌'}`);
    
    await mongoose.disconnect();
    console.log('\n' + '='.repeat(50));
    console.log('✅ LOGIN CREDENTIALS:');
    console.log('Doctor: doctor@aegis.com / 123456');
    console.log('Patient: patient@aegis.com / 123456');
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('Error:', error);
  }
}

fixAuth();