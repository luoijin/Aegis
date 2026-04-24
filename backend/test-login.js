const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User.model');

async function testLogin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if users exist
    const users = await User.find({});
    console.log(`Found ${users.length} users in database:`);
    users.forEach(u => {
      console.log(`- ${u.email} (${u.role})`);
    });

    if (users.length === 0) {
      console.log('\nNo users found! Creating a test user...');
      
      const testDoctor = await User.create({
        email: 'doctor@test.com',
        password: await bcrypt.hash('123456', 10),
        role: 'doctor',
        profile: { firstName: 'Test', lastName: 'Doctor', phone: '1234567890' }
      });
      
      console.log('Test doctor created:', testDoctor.email);
    }

    // Test login
    const loginEmail = 'doctor@test.com';
    const loginPassword = '123456';
    
    const user = await User.findOne({ email: loginEmail });
    if (user) {
      const isValid = await bcrypt.compare(loginPassword, user.password);
      console.log(`\nLogin test for ${loginEmail}: ${isValid ? 'SUCCESS ✅' : 'FAILED ❌'}`);
    } else {
      console.log(`User ${loginEmail} not found`);
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

testLogin();