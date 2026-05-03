const mongoose = require('mongoose');
const CryptoJS = require('crypto-js');
require('dotenv').config({ path: '../.env' });

// Import models
const User = require('../models/User.model');
const Patient = require('../models/Patient.model');
const Hospital = require('../models/Hospital.model');
const Specialization = require('../models/Specialization.model');
const HealthLog = require('../models/HealthLog.model');
const Appointment = require('../models/Appointment.model');
const Referral = require('../models/Referral.model');
const Prescription = require('../models/Prescription.model');
const Notification = require('../models/Notification.model');

// ============================================
// SEED DATA
// ============================================

// Hospitals
const hospitals = [
  {
    name: 'Aegis Medical Center',
    address: { street: '123 Health Avenue', city: 'Manila', state: 'Metro Manila', zipCode: '1000', country: 'Philippines' },
    phone: '+63 2 8123 4567',
    email: 'info@aegismedical.com',
    isActive: true
  },
  {
    name: "St. Luke's Medical Center",
    address: { street: '279 E Rodriguez Sr. Blvd', city: 'Quezon City', state: 'Metro Manila', zipCode: '1102', country: 'Philippines' },
    phone: '+63 2 8723 0101',
    email: 'info@stlukes.com.ph',
    isActive: true
  },
  {
    name: 'Makati Medical Center',
    address: { street: '2 Amorsolo Street', city: 'Makati', state: 'Metro Manila', zipCode: '1200', country: 'Philippines' },
    phone: '+63 2 8888 8999',
    email: 'info@makatimed.net.ph',
    isActive: true
  },
  {
    name: 'The Medical City',
    address: { street: 'Ortigas Avenue', city: 'Pasig', state: 'Metro Manila', zipCode: '1605', country: 'Philippines' },
    phone: '+63 2 8988 1000',
    email: 'info@themedicalcity.com',
    isActive: true
  },
  {
    name: 'Asian Hospital',
    address: { street: '2205 Civic Drive', city: 'Muntinlupa', state: 'Metro Manila', zipCode: '1781', country: 'Philippines' },
    phone: '+63 2 8771 9000',
    email: 'info@asianhospital.com',
    isActive: true
  }
];

// Specializations
const specializations = [
  { name: 'Cardiology', description: 'Heart and cardiovascular system', isActive: true },
  { name: 'Neurology', description: 'Brain and nervous system', isActive: true },
  { name: 'Pediatrics', description: "Children's health", isActive: true },
  { name: 'Orthopedics', description: 'Bones and joints', isActive: true },
  { name: 'Dermatology', description: 'Skin health', isActive: true },
  { name: 'Ophthalmology', description: 'Eye care', isActive: true },
  { name: 'ENT', description: 'Ear, nose, and throat', isActive: true },
  { name: 'Psychiatry', description: 'Mental health', isActive: true },
  { name: 'Obstetrics & Gynecology', description: "Women's health", isActive: true },
  { name: 'Gastroenterology', description: 'Digestive system', isActive: true },
  { name: 'Urology', description: 'Urinary tract', isActive: true },
  { name: 'Endocrinology', description: 'Hormones and metabolism', isActive: true },
  { name: 'Pulmonology', description: 'Respiratory system', isActive: true },
  { name: 'Rheumatology', description: 'Autoimmune diseases', isActive: true },
  { name: 'Oncology', description: 'Cancer treatment', isActive: true }
];

// ============================================
// GENERATE FUNCTIONS
// ============================================

const generateDoctors = (specs, hospitals) => [
  {
    email: 'dr.smith@aegis.com',
    password: 'doctor123',  // Plain text - model will encrypt
    role: 'doctor',
    profile: { firstName: 'John', lastName: 'Smith', phone: '09171234567', gender: 'male' },
    licenseNumber: 'DOC-001',
    specialization: specs.find(s => s.name === 'Cardiology')?.name || 'Cardiology',
    hospital: hospitals[0]?._id,
    isActive: true
  },
  {
    email: 'dr.johnson@aegis.com',
    password: 'doctor123',
    role: 'doctor',
    profile: { firstName: 'Sarah', lastName: 'Johnson', phone: '09171234568', gender: 'female' },
    licenseNumber: 'DOC-002',
    specialization: specs.find(s => s.name === 'Neurology')?.name || 'Neurology',
    hospital: hospitals[0]?._id,
    isActive: true
  },
  {
    email: 'dr.williams@aegis.com',
    password: 'doctor123',
    role: 'doctor',
    profile: { firstName: 'Michael', lastName: 'Williams', phone: '09171234569', gender: 'male' },
    licenseNumber: 'DOC-003',
    specialization: specs.find(s => s.name === 'Pediatrics')?.name || 'Pediatrics',
    hospital: hospitals[1]?._id,
    isActive: true
  },
  {
    email: 'dr.brown@aegis.com',
    password: 'doctor123',
    role: 'doctor',
    profile: { firstName: 'Emily', lastName: 'Brown', phone: '09171234570', gender: 'female' },
    licenseNumber: 'DOC-004',
    specialization: specs.find(s => s.name === 'Orthopedics')?.name || 'Orthopedics',
    hospital: hospitals[1]?._id,
    isActive: true
  },
  {
    email: 'dr.davis@aegis.com',
    password: 'doctor123',
    role: 'doctor',
    profile: { firstName: 'David', lastName: 'Davis', phone: '09171234571', gender: 'male' },
    licenseNumber: 'DOC-005',
    specialization: specs.find(s => s.name === 'Dermatology')?.name || 'Dermatology',
    hospital: hospitals[2]?._id,
    isActive: true
  },
  {
    email: 'dr.martinez@aegis.com',
    password: 'doctor123',
    role: 'doctor',
    profile: { firstName: 'Maria', lastName: 'Martinez', phone: '09171234572', gender: 'female' },
    licenseNumber: 'DOC-006',
    specialization: specs.find(s => s.name === 'Ophthalmology')?.name || 'Ophthalmology',
    hospital: hospitals[2]?._id,
    isActive: true
  },
  {
    email: 'dr.garcia@aegis.com',
    password: 'doctor123',
    role: 'doctor',
    profile: { firstName: 'Carlos', lastName: 'Garcia', phone: '09171234573', gender: 'male' },
    licenseNumber: 'DOC-007',
    specialization: specs.find(s => s.name === 'ENT')?.name || 'ENT',
    hospital: hospitals[3]?._id,
    isActive: true
  },
  {
    email: 'dr.rodriguez@aegis.com',
    password: 'doctor123',
    role: 'doctor',
    profile: { firstName: 'Anna', lastName: 'Rodriguez', phone: '09171234574', gender: 'female' },
    licenseNumber: 'DOC-008',
    specialization: specs.find(s => s.name === 'Psychiatry')?.name || 'Psychiatry',
    hospital: hospitals[3]?._id,
    isActive: true
  }
];

const generatePatients = (doctors) => [
  {
    email: 'john.doe@example.com',
    password: 'patient123',
    role: 'patient',
    profile: { firstName: 'John', lastName: 'Doe', phone: '09171234001', gender: 'male' },
    bloodType: 'O+',
    conditions: [
      { name: 'Hypertension', severity: 'moderate', diagnosedDate: new Date('2024-01-15'), isActive: true },
      { name: 'Diabetes', severity: 'mild', diagnosedDate: new Date('2024-02-20'), isActive: true }
    ],
    assignedDoctor: doctors[0]?._id
  },
  {
    email: 'jane.smith@example.com',
    password: 'patient123',
    role: 'patient',
    profile: { firstName: 'Jane', lastName: 'Smith', phone: '09171234002', gender: 'female' },
    bloodType: 'A+',
    conditions: [
      { name: 'Asthma', severity: 'moderate', diagnosedDate: new Date('2024-03-10'), isActive: true }
    ],
    assignedDoctor: doctors[1]?._id
  },
  {
    email: 'bob.wilson@example.com',
    password: 'patient123',
    role: 'patient',
    profile: { firstName: 'Bob', lastName: 'Wilson', phone: '09171234003', gender: 'male' },
    bloodType: 'B+',
    conditions: [
      { name: 'Arthritis', severity: 'severe', diagnosedDate: new Date('2023-11-05'), isActive: true },
      { name: 'Osteoporosis', severity: 'moderate', diagnosedDate: new Date('2024-01-20'), isActive: true }
    ],
    assignedDoctor: doctors[2]?._id
  },
  {
    email: 'alice.brown@example.com',
    password: 'patient123',
    role: 'patient',
    profile: { firstName: 'Alice', lastName: 'Brown', phone: '09171234004', gender: 'female' },
    bloodType: 'AB+',
    conditions: [
      { name: 'Migraine', severity: 'mild', diagnosedDate: new Date('2024-04-01'), isActive: true }
    ],
    assignedDoctor: doctors[3]?._id
  },
  {
    email: 'charlie.davis@example.com',
    password: 'patient123',
    role: 'patient',
    profile: { firstName: 'Charlie', lastName: 'Davis', phone: '09171234005', gender: 'male' },
    bloodType: 'O-',
    conditions: [
      { name: 'Depression', severity: 'moderate', diagnosedDate: new Date('2023-12-10'), isActive: true },
      { name: 'Anxiety', severity: 'mild', diagnosedDate: new Date('2024-01-15'), isActive: true }
    ],
    assignedDoctor: doctors[4]?._id
  },
  {
    email: 'diana.miller@example.com',
    password: 'patient123',
    role: 'patient',
    profile: { firstName: 'Diana', lastName: 'Miller', phone: '09171234006', gender: 'female' },
    bloodType: 'A-',
    conditions: [
      { name: 'Thyroid Disorder', severity: 'moderate', diagnosedDate: new Date('2024-02-28'), isActive: true }
    ],
    assignedDoctor: doctors[5]?._id
  },
  {
    email: 'edward.taylor@example.com',
    password: 'patient123',
    role: 'patient',
    profile: { firstName: 'Edward', lastName: 'Taylor', phone: '09171234007', gender: 'male' },
    bloodType: 'B-',
    conditions: [
      { name: 'COPD', severity: 'severe', diagnosedDate: new Date('2023-10-15'), isActive: true }
    ],
    assignedDoctor: doctors[6]?._id
  },
  {
    email: 'fiona.anderson@example.com',
    password: 'patient123',
    role: 'patient',
    profile: { firstName: 'Fiona', lastName: 'Anderson', phone: '09171234008', gender: 'female' },
    bloodType: 'AB-',
    conditions: [
      { name: 'Epilepsy', severity: 'moderate', diagnosedDate: new Date('2024-03-20'), isActive: true }
    ],
    assignedDoctor: doctors[7]?._id
  }
];

const generateHealthLogs = (patients, doctors) => {
  const logs = [];
  const startDate = new Date('2024-04-01');
  
  patients.forEach((patient, pIdx) => {
    for (let i = 0; i < 10; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i * 3);
      
      logs.push({
        patient: patient._id,
        recordedBy: doctors[pIdx % doctors.length]._id,
        vitals: {
          heartRate: 60 + Math.floor(Math.random() * 40),
          bloodPressure: {
            systolic: 110 + Math.floor(Math.random() * 30),
            diastolic: 70 + Math.floor(Math.random() * 20)
          },
          temperature: 36 + Math.random() * 2,
          oxygenSaturation: 95 + Math.floor(Math.random() * 5)
        },
        symptoms: i % 3 === 0 ? ['headache', 'fatigue'] : [],
        notes: i % 5 === 0 ? 'Follow-up appointment recommended' : '',
        status: Math.random() > 0.8 ? 'warning' : 'normal',
        createdAt: date
      });
    }
  });
  return logs;
};

const generateAppointments = (patients, doctors) => {
  const appointments = [];
  const startDate = new Date();
  
  patients.forEach((patient, idx) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + idx);
    
    appointments.push({
      patient: patient._id,
      doctor: patient.assignedDoctor,
      dateTime: date,
      duration: 30,
      type: 'in-person',
      status: idx % 4 === 0 ? 'confirmed' : idx % 3 === 0 ? 'completed' : 'scheduled',
      reason: idx % 2 === 0 ? 'Routine checkup' : 'Follow-up consultation',
      hospital: doctors[idx % doctors.length]?.hospital,
      location: { room: `Room ${100 + idx}` }
    });
  });
  return appointments;
};

const generatePrescriptions = (patients, doctors) => {
  const medications = [
    { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', duration: '30 days' },
    { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', duration: '90 days' },
    { name: 'Albuterol', dosage: '90mcg', frequency: 'As needed', duration: '30 days' },
    { name: 'Ibuprofen', dosage: '400mg', frequency: 'Every 6 hours', duration: '7 days' },
    { name: 'Amoxicillin', dosage: '500mg', frequency: 'Three times daily', duration: '10 days' }
  ];
  
  return patients.map((patient, idx) => ({
    patient: patient._id,
    doctor: patient.assignedDoctor,
    medications: [medications[idx % medications.length]],
    notes: idx % 2 === 0 ? 'Take with food' : 'Take on empty stomach',
    refillsRemaining: 2,
    isActive: idx % 3 !== 0,
    issuedDate: new Date('2024-04-01')
  }));
};

const generateReferrals = (patients, doctors) => {
  return patients.slice(0, 5).map((patient, idx) => ({
    patient: patient._id,
    fromDoctor: doctors[idx % doctors.length]._id,
    toDoctor: doctors[(idx + 2) % doctors.length]._id,
    reason: `Specialist consultation needed for ${patient.conditions[0]?.name || 'general concern'}`,
    priority: idx % 3 === 0 ? 'urgent' : idx % 2 === 0 ? 'emergency' : 'normal',
    status: idx % 3 === 0 ? 'accepted' : idx % 2 === 0 ? 'pending' : 'denied',
    notes: 'Please review patient history',
    createdAt: new Date('2024-04-01')
  }));
};

const generateNotifications = (users) => {
  const notifications = [];
  users.forEach(user => {
    notifications.push({
      recipient: user._id,
      type: 'welcome',
      title: 'Welcome to Aegis',
      message: `Welcome ${user.profile?.firstName || 'User'}! Your account has been successfully created.`,
      isRead: false,
      createdAt: new Date()
    });
  });
  return notifications;
};

// ============================================
// MAIN SEED FUNCTION
// ============================================

async function seedDatabase() {
  try {
    console.log('🛡️ Starting database seeding...\n');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Patient.deleteMany({});
    await Hospital.deleteMany({});
    await Specialization.deleteMany({});
    await HealthLog.deleteMany({});
    await Appointment.deleteMany({});
    await Referral.deleteMany({});
    await Prescription.deleteMany({});
    await Notification.deleteMany({});
    console.log('✅ Cleared all collections\n');

    // 1. Create Hospitals
    console.log('Creating hospitals...');
    const hospitalDocs = await Hospital.insertMany(hospitals);
    console.log(`✅ Created ${hospitalDocs.length} hospitals\n`);

    // 2. Create Specializations
    console.log('Creating specializations...');
    const specDocs = await Specialization.insertMany(specializations);
    console.log(`✅ Created ${specDocs.length} specializations\n`);

    // 3. Create Admin Account - PLAIN TEXT PASSWORD (model will encrypt)
    console.log('Creating admin account...');
    const admin = new User({
      email: 'admin@aegis.com',
      password: 'admin123',  // ← Plain text! Model's pre-save hook will encrypt
      role: 'admin',
      profile: {
        firstName: 'System',
        lastName: 'Administrator',
        phone: '1234567890'
      },
      isActive: true
    });
    await admin.save();
    console.log('✅ Created admin account\n');

    // 4. Create Doctors
    console.log('Creating doctors...');
    const doctorData = generateDoctors(specDocs, hospitalDocs);
    const doctorUsers = [];
    for (const doc of doctorData) {
      // Plain text password - model will encrypt
      const user = new User({ ...doc });
      await user.save();
      doctorUsers.push(user);
    }
    console.log(`✅ Created ${doctorUsers.length} doctors\n`);

    // 5. Create Patients
    console.log('Creating patients...');
    const patientData = generatePatients(doctorUsers);
    const patientUsers = [];
    const patientDocs = [];
    
    for (const pat of patientData) {
      // Plain text password - model will encrypt
      const user = new User({ 
        email: pat.email, 
        password: pat.password,
        role: pat.role, 
        profile: pat.profile,
        isActive: true
      });
      await user.save();
      patientUsers.push(user);
      
      const patient = new Patient({
        user: user._id,
        bloodType: pat.bloodType,
        conditions: pat.conditions,
        assignedDoctor: pat.assignedDoctor
      });
      await patient.save();
      patientDocs.push(patient);
    }
    console.log(`✅ Created ${patientDocs.length} patients\n`);

    // 6. Create Health Logs
    console.log('Creating health logs...');
    const healthLogs = generateHealthLogs(patientDocs, doctorUsers);
    const healthLogDocs = await HealthLog.insertMany(healthLogs);
    console.log(`✅ Created ${healthLogDocs.length} health logs\n`);

    // 7. Create Appointments
    console.log('Creating appointments...');
    const appointments = generateAppointments(patientDocs, doctorUsers);
    const appointmentDocs = await Appointment.insertMany(appointments);
    console.log(`✅ Created ${appointmentDocs.length} appointments\n`);

    // 8. Create Prescriptions
    console.log('Creating prescriptions...');
    const prescriptions = generatePrescriptions(patientDocs, doctorUsers);
    const prescriptionDocs = await Prescription.insertMany(prescriptions);
    console.log(`✅ Created ${prescriptionDocs.length} prescriptions\n`);

    // 9. Create Referrals
    console.log('Creating referrals...');
    const referrals = generateReferrals(patientDocs, doctorUsers);
    const referralDocs = await Referral.insertMany(referrals);
    console.log(`✅ Created ${referralDocs.length} referrals\n`);

    // 10. Create Notifications
    console.log('Creating notifications...');
    const allUsers = [admin, ...doctorUsers, ...patientUsers];
    const notifications = generateNotifications(allUsers);
    const notificationDocs = await Notification.insertMany(notifications);
    console.log(`✅ Created ${notificationDocs.length} notifications\n`);

    // Verify admin password works
    const verifyAdmin = await User.findOne({ email: 'admin@aegis.com' });
    const testMatch = await verifyAdmin.comparePassword('admin123');
    console.log('\n🔐 Admin password verification:', testMatch ? '✅ PASSED' : '❌ FAILED');

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('🎉 DATABASE SEEDING COMPLETED!');
    console.log('='.repeat(50));
    console.log('\n📊 Summary:');
    console.log(`   Admin: 1`);
    console.log(`   Hospitals: ${hospitalDocs.length}`);
    console.log(`   Specializations: ${specDocs.length}`);
    console.log(`   Doctors: ${doctorUsers.length}`);
    console.log(`   Patients: ${patientDocs.length}`);
    console.log(`   Health Logs: ${healthLogDocs.length}`);
    console.log(`   Appointments: ${appointmentDocs.length}`);
    console.log(`   Prescriptions: ${prescriptionDocs.length}`);
    console.log(`   Referrals: ${referralDocs.length}`);
    console.log(`   Notifications: ${notificationDocs.length}`);
    
    console.log('\n🔑 Login Credentials:');
    console.log('   Admin: admin@aegis.com / admin123');
    console.log('   Doctor: dr.smith@aegis.com / doctor123');
    console.log('   Patient: john.doe@example.com / patient123');
    
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    process.exit(0);
  }
}

seedDatabase();