const mongoose = require('mongoose');
const CryptoJS = require('crypto-js');
require('dotenv').config({ path: '../.env' });

const User = require('../models/User.model');

async function createAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Delete existing admin if any
    await User.deleteMany({ role: 'admin' });
    console.log('Cleared existing admin accounts');

    // Create admin with plain text password (let the model hash it)
    // The User model's pre-save hook will encrypt it automatically
    const admin = new User({
      email: 'admin@aegis.com',
      password: 'admin123',  // Plain text - model will encrypt on save
      role: 'admin',
      profile: {
        firstName: 'System',
        lastName: 'Administrator',
        phone: '1234567890'
      },
      isActive: true
    });

    await admin.save();
    
    console.log('\n✅ Admin account created successfully!');
    console.log('📧 Email: admin@aegis.com');
    console.log('🔑 Password: admin123');
    console.log('👤 Role: Admin\n');
    
    // Verify by fetching and comparing
    const savedAdmin = await User.findOne({ email: 'admin@aegis.com' });
    const isMatch = await savedAdmin.comparePassword('admin123');
    console.log('Password verification test:', isMatch ? '✅ PASSED' : '❌ FAILED');
    
    await mongoose.disconnect();
    
  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    process.exit(0);
  }
}

createAdmin();