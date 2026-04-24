const { MongoClient, ServerApiVersion } = require('mongodb');

// Use your actual credentials
const uri = "mongodb+srv://aegis:aegis_admin_011905@cluster0.mkrcndm.mongodb.net/?appName=Cluster0";

// Create a MongoClient
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    console.log('🛡️ Testing Aegis MongoDB Connection...');
    console.log('Connection string:', uri.replace(/aegis_admin_011905/, '*******'));
    
    // Connect to the server
    await client.connect();
    
    // Send a ping to confirm connection
    await client.db("admin").command({ ping: 1 });
    
    console.log("✅ Pinged your deployment. You successfully connected to MongoDB!");
    console.log("📊 Aegis database is ready!");
    
    // List available databases
    const databases = await client.db().admin().listDatabases();
    console.log("\n📁 Available databases:");
    databases.databases.forEach(db => {
      console.log(`   - ${db.name}`);
    });
    
  } catch (error) {
    console.error("❌ Connection failed:", error.message);
    console.log("\n🔧 Troubleshooting:");
    console.log("1. Check if cluster is active");
    console.log("2. Verify IP whitelist has 203.28.67.130");
    console.log("3. Check username: aegis");
    console.log("4. Check password: aegis_admin_011905");
  } finally {
    await client.close();
  }
}

run().catch(console.dir);