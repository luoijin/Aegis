const mongoose = require('mongoose');
require('dotenv').config();

async function fixPatientIndex() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const collection = db.collection('patients');
    
    // Get all current indexes
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes.map(i => i.name));
    
    // Drop the problematic userId_1 index if it exists
    const hasUserIdIndex = indexes.some(i => i.name === 'userId_1');
    if (hasUserIdIndex) {
      await collection.dropIndex('userId_1');
      console.log('✅ Dropped userId_1 index');
    } else {
      console.log('userId_1 index not found');
    }
    
    // Ensure correct indexes exist
    await collection.createIndex({ user: 1 }, { unique: true });
    console.log('✅ Created/Verified user_1 index');
    
    await collection.createIndex({ assignedDoctor: 1 });
    console.log('✅ Created assignedDoctor_1 index');
    
    console.log('\n📊 Final indexes:');
    const finalIndexes = await collection.indexes();
    finalIndexes.forEach(idx => {
      console.log(`   - ${idx.name}: ${JSON.stringify(idx.key)}`);
    });
    
    await mongoose.disconnect();
    console.log('\n✅ Index fix completed!');
    
  } catch (error) {
    console.error('Error fixing index:', error);
  }
}

fixPatientIndex();