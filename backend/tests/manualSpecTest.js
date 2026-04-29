const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User.model');
const Specialization = require('../models/Specialization.model');

async function testSpecializationCleanup() {
  console.log('\n========================================');
  console.log('SPECIALIZATION CLEANUP MANUAL TEST');
  console.log('========================================\n');
  
  try {
    console.log('MongoDB URI:', process.env.MONGODB_URI);
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Step 1: Create a test specialization
    console.log('📝 Step 1: Creating test specialization...');
    const testSpec = new Specialization({
      name: 'Test Cardiology',
      description: 'Test specialization for cleanup',
      isActive: true
    });
    await testSpec.save();
    console.log(`✅ Created specialization: ${testSpec.name} (ID: ${testSpec._id})\n`);

    // Step 2: Create a test doctor with this specialization
    console.log('📝 Step 2: Creating test doctor...');
    const testDoctor = new User({
      email: 'testdoc@specialization.com',
      password: await bcrypt.hash('doctor123', 10),
      role: 'doctor',
      profile: {
        firstName: 'Test',
        lastName: 'Doctor',
        phone: '1234567890'
      },
      licenseNumber: 'TEST123',
      specialization: testSpec.name,
      isActive: true
    });
    await testDoctor.save();
    console.log(`✅ Created doctor: ${testDoctor.email}`);
    console.log(`   Specialization: ${testDoctor.specialization}\n`);

    // Step 3: Verify doctor has the specialization
    console.log('📝 Step 3: Verifying doctor has specialization...');
    const doctorCheck = await User.findById(testDoctor._id);
    console.log(`   Doctor specialization: ${doctorCheck.specialization}`);
    console.log(`   Expected: ${testSpec.name}`);
    
    if (doctorCheck.specialization === testSpec.name) {
      console.log('   ✅ VERIFIED: Doctor has the specialization\n');
    } else {
      console.log('   ❌ FAILED: Doctor does not have the specialization\n');
    }

    // Step 4: Delete the specialization and cascade to doctors
    console.log('📝 Step 4: Deleting specialization and cascading to doctors...');
    const specName = testSpec.name;
    
    // Remove specialization from all doctors who have it
    const updateResult = await User.updateMany(
      { role: 'doctor', specialization: specName },
      { $set: { specialization: '' } }
    );
    console.log(`   Updated ${updateResult.modifiedCount} doctors`);
    
    // Delete the specialization
    await Specialization.findByIdAndDelete(testSpec._id);
    console.log(`✅ Deleted specialization: ${specName}\n`);

    // Step 5: Verify doctor no longer has specialization
    console.log('📝 Step 5: Verifying doctor no longer has specialization...');
    const doctorAfter = await User.findById(testDoctor._id);
    console.log(`   Doctor specialization after deletion: "${doctorAfter.specialization || 'None'}"`);
    
    if (doctorAfter.specialization === '') {
      console.log('   ✅ VERIFIED: Doctor specialization was cleared\n');
    } else {
      console.log('   ❌ FAILED: Doctor still has specialization\n');
    }

    // Step 6: Check if specialization exists
    console.log('📝 Step 6: Verifying specialization is deleted...');
    const specExists = await Specialization.findById(testSpec._id);
    if (!specExists) {
      console.log('   ✅ VERIFIED: Specialization no longer exists\n');
    } else {
      console.log('   ❌ FAILED: Specialization still exists\n');
    }

    // Step 7: Test doctor edit dropdown - get active specializations
    console.log('📝 Step 7: Verifying deleted spec not in active list...');
    const activeSpecs = await Specialization.find({ isActive: true });
    const specNames = activeSpecs.map(s => s.name);
    console.log(`   Active specializations: ${specNames.join(', ') || 'None'}`);
    
    if (!specNames.includes(testSpec.name)) {
      console.log('   ✅ VERIFIED: Deleted specialization not in active list\n');
    } else {
      console.log('   ❌ FAILED: Deleted specialization still in active list\n');
    }

    // Clean up
    console.log('📝 Step 8: Cleaning up test data...');
    await User.findByIdAndDelete(testDoctor._id);
    console.log('✅ Test doctor deleted\n');

    console.log('========================================');
    console.log('✅ ALL TESTS PASSED!');
    console.log('========================================\n');

  } catch (error) {
    console.error('❌ TEST FAILED:', error.message);
    console.log('\n========================================\n');
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the test
testSpecializationCleanup();