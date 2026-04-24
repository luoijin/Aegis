const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User.model');

async function debugLogin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const email = 'dr.smith@aegis.com';
    const inputPassword = '123456';

    const user = await User.findOne({ email });
    if (!user) {
      console.log(`User ${email} not found`);
      return;
    }

    console.log(`User found: ${user.email}`);
    console.log(`Stored password hash: ${user.password}`);
    
    const isValid = await bcrypt.compare(inputPassword, user.password);
    console.log(`Password match: ${isValid ? 'YES ✅' : 'NO ❌'}`);
    
    if (!isValid) {
      // Force update password
      const newHash = await bcrypt.hash(inputPassword, 10);
      user.password = newHash;
      await user.save();
      console.log(`Password force updated for ${email}`);
      
      // Test again
      const retest = await bcrypt.compare(inputPassword, user.password);
      console.log(`After update - Password match: ${retest ? 'YES ✅' : 'NO ❌'}`);
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

debugLogin();