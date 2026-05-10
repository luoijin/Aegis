// Load environment variables FIRST
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const statsRoutes = require('./routes/stats.routes');
const authRoutes = require('./routes/auth.routes');
const patientRoutes = require('./routes/patient.routes');
const healthLogRoutes = require('./routes/healthLog.routes');
const adminRoutes = require('./routes/admin.routes');
const doctorRoutes = require('./routes/doctor.routes');
const notificationRoutes = require('./routes/notification.routes');
const hospitalRoutes = require('./routes/hospital.routes');
const Prescription = require('./models/Prescription.model');
const Appointment = require('./models/Appointment.model');
const Referral = require('./models/Referral.model');



const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000
});
app.use('/api/', limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoints
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Aegis Health API is running',
    version: '1.0.0',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date()
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Aegis API is running',
    timestamp: new Date()
  });
});

// Routes
app.use('/api/stats', statsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/health-logs', healthLogRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/hospitals', hospitalRoutes);


// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

const PORT = process.env.PORT || 5000;

// MongoDB Connection Options for Local
const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

console.log('🛡️ Starting Aegis Backend...');
console.log(`📡 Connecting to MongoDB at: ${process.env.MONGODB_URI}`);

mongoose.connect(process.env.MONGODB_URI, mongoOptions)
  .then(() => {
    console.log('✅ MongoDB Connected Successfully!');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`📍 Host: ${mongoose.connection.host}`);
    
    app.listen(PORT, () => {
      console.log(`🛡️ Aegis Server running on port ${PORT}`);
      console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL}`);
      console.log(`📝 API Base: http://localhost:${PORT}/api`);
      console.log('\n✅ Ready for connections!');
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('\n💡 Troubleshooting:');
    console.log('1. Make sure MongoDB is installed');
    console.log('2. Run: net start MongoDB (as Administrator)');
    console.log('3. Or start MongoDB Compass first');
    console.log('4. Check if mongod.exe is running');
    process.exit(1);
  });

module.exports = app;