const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User.model');

// MongoDB connection string
const MONGODB_URI = 'mongodb://localhost:27017/aegis';

async function fixAdminPassword() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Check if admin exists
    let admin = await User.findOne({ email: 'admin@aegis.com' });
    
    if (admin) {
      // Update existing admin password
      const hashedPassword = await bcrypt.hash('admin123', 10);
      admin.passwordHash = hashedPassword;
      await admin.save();
      console.log('Admin password updated successfully!');
      console.log('Email: admin@aegis.com');
      console.log('Password: admin123');
    } else {
      // Create new admin
      const hashedPassword = await bcrypt.hash('admin123', 10);
      admin = new User({
        email: 'admin@aegis.com',
        passwordHash: hashedPassword,
        role: 'admin',
        name: 'System Administrator',
        phone: '0000000000',
        isActive: true
      });
      await admin.save();
      console.log('Admin user created successfully!');
      console.log('Email: admin@aegis.com');
      console.log('Password: admin123');
    }

    console.log('\nAdmin credentials:');
    console.log('-------------------');
    console.log('Email: admin@aegis.com');
    console.log('Password: admin123');
    console.log('-------------------');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the function
fixAdminPassword();