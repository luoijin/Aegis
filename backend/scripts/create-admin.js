const mongoose = require('mongoose');
const CryptoJS = require('crypto-js');
require('dotenv').config();

const User = require('./models/User.model');

async function createAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    console.log('URI:', process.env.MONGODB_URI);
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin account already exists:', existingAdmin.email);
      process.exit(0);
    }

    // Encrypt password using crypto-js
    const secret = process.env.JWT_SECRET || 'secret';
    const encryptedPassword = CryptoJS.AES.encrypt('admin123', secret).toString();
    
    const admin = new User({
      email: 'admin@aegis.com',
      password: encryptedPassword,
      role: 'admin',
      profile: {
        firstName: 'System',
        lastName: 'Administrator',
        phone: '1234567890'
      },
      isActive: true
    });

    await admin.save();
    
    console.log('✅ Admin account created successfully!');
    console.log('📧 Email: admin@aegis.com');
    console.log('🔑 Password: admin123');
    console.log('👤 Role: Admin');
    
    await mongoose.disconnect();
    
  } catch (error) {
    console.error('Error creating admin:', error);
  }
}

createAdmin();