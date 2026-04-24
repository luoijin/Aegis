// Load environment variables FIRST
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const mongoose = require('mongoose');

const testConnection = async () => {
  console.log('🛡️ Testing Aegis Local MongoDB Connection...');
  console.log('=' .repeat(50));
  console.log(`Current directory: ${__dirname}`);
  console.log(`.env file path: ${path.join(__dirname, '.env')}`);
  
  console.log('\n📋 Environment check:');
  console.log(`- NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
  console.log(`- PORT: ${process.env.PORT || 'not set'}`);
  console.log(`- MONGODB_URI: ${process.env.MONGODB_URI ? '✓ exists' : '✗ missing'}`);
  
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('\n❌ MONGODB_URI is not defined in .env file');
    console.log('\n📝 Please ensure .env file exists with:');
    console.log('MONGODB_URI=mongodb://localhost:27017/aegis');
    return;
  }
  
  console.log(`\n🔗 Connection string: ${uri}`);
  
  try {
    await mongoose.connect(uri);
    console.log('\n✅ MongoDB Connected Successfully!');
    console.log(`📊 Database Name: ${mongoose.connection.name}`);
    console.log(`📍 Host: ${mongoose.connection.host}`);
    console.log(`🔢 Port: ${mongoose.connection.port}`);
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`\n📁 Collections found: ${collections.length}`);
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });
    
    await mongoose.disconnect();
    console.log('\n🎉 Connection test complete! Aegis is ready to go!');
    console.log('\n🚀 Next steps:');
    console.log('1. Run: npm run dev');
    console.log('2. Start frontend: cd ../frontend && npm start');
    
  } catch (error) {
    console.error('\n❌ Connection failed:', error.message);
    console.log('\n🔧 Troubleshooting for Local MongoDB:');
    console.log('1. Is MongoDB installed? Check: "C:\\Program Files\\MongoDB"');
    console.log('2. Start MongoDB service: net start MongoDB (as Administrator)');
    console.log('3. Or run: "C:\\Program Files\\MongoDB\\Server\\7.0\\bin\\mongod.exe"');
    console.log('4. Open MongoDB Compass and connect to mongodb://localhost:27017');
    console.log('5. Make sure no other process is using port 27017');
  }
};

testConnection();