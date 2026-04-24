const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User.model');

async function fixPasswords() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all users
    const users = await User.find({});
    console.log(`Found ${users.length} users`);

    // Reset each user's password directly
    for (const user of users) {
      // Generate new hash
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('123456', salt);
      
      // Update directly
      user.password = hash;
      await user.save();
      
      // Verify immediately
      const verifyMatch = await bcrypt.compare('123456', user.password);
      console.log(`${user.email}: Password set to 123456 - ${verifyMatch ? '✅ WORKING' : '❌ FAILED'}`);
    }

    await mongoose.disconnect();
    console.log('\n✅ Password fix complete. Try logging in now.');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

fixPasswords();