const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User.model');

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    const admin = new User({
      email: 'admin@aegis.com',
      password: 'Admin@123',
      role: 'admin',
      name: { firstName: 'System', lastName: 'Administrator' },
      phone: '0000000000',
      isActive: true
    });

    await admin.save();
    console.log('✅ Admin user created:');
    console.log('Email: admin@aegis.com');
    console.log('Password: Admin@123');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

createAdmin();