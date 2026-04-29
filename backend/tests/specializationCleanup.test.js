const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User.model');
const Patient = require('../models/Patient.model');
const Hospital = require('../models/Hospital.model');
const Specialization = require('../models/Specialization.model');
const HealthLog = require('../models/HealthLog.model');

let adminToken;
let testDoctorId;
let testSpecializationId;
let testSpecializationName;

// Test data
const adminCredentials = {
  email: 'admin@aegis.com',
  password: 'admin123'
};

const testDoctor = {
  email: 'testdoctor@specialization.com',
  password: 'doctor123',
  role: 'doctor',
  profile: {
    firstName: 'Test',
    lastName: 'Doctor',
    phone: '1234567890'
  },
  licenseNumber: 'LIC12345',
  specialization: 'Cardiology' // Will be updated with dynamic value
};

describe('Specialization Cleanup Tests', () => {
  
  // Connect to database before tests
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to test database');
  });

  // Clean up after tests
  afterAll(async () => {
    // Clean up test data
    await User.deleteMany({ email: { $in: [adminCredentials.email, testDoctor.email] } });
    await Specialization.deleteMany({ name: 'Test Specialization' });
    await mongoose.disconnect();
    console.log('Test cleanup completed');
  });

  // Test 1: Admin Login
  describe('Admin Authentication', () => {
    test('Should login as admin and get token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send(adminCredentials);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.token).toBeDefined();
      adminToken = res.body.token;
      console.log('✅ Admin logged in successfully');
    });
  });

  // Test 2: Create a test specialization
  describe('Create Specialization', () => {
    test('Should create a new specialization', async () => {
      const res = await request(app)
        .post('/api/admin/specializations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Specialization',
          description: 'Test specialization for cleanup testing',
          isActive: true
        });
      
      expect(res.statusCode).toBe(201);
      expect(res.body.name).toBe('Test Specialization');
      testSpecializationId = res.body._id;
      testSpecializationName = res.body.name;
      console.log(`✅ Created test specialization: ${testSpecializationName}`);
    });
  });

  // Test 3: Create a test doctor with the specialization
  describe('Create Doctor with Specialization', () => {
    test('Should create a doctor with the test specialization', async () => {
      // First create the doctor via admin
      const res = await request(app)
        .post('/api/auth/create-doctor')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ...testDoctor,
          specialization: testSpecializationName
        });
      
      expect(res.statusCode).toBe(201);
      expect(res.body.user).toBeDefined();
      testDoctorId = res.body.user.id;
      
      // Verify the doctor has the specialization
      const doctorRes = await request(app)
        .get(`/api/admin/doctors`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      const createdDoctor = doctorRes.body.find(d => d._id === testDoctorId);
      expect(createdDoctor.specialization).toBe(testSpecializationName);
      console.log(`✅ Created doctor with specialization: ${testSpecializationName}`);
    });
  });

  // Test 4: Verify doctor has the specialization before deletion
  describe('Verify Doctor Has Specialization', () => {
    test('Doctor should have the test specialization assigned', async () => {
      const res = await request(app)
        .get('/api/admin/doctors')
        .set('Authorization', `Bearer ${adminToken}`);
      
      const doctor = res.body.find(d => d._id === testDoctorId);
      expect(doctor.specialization).toBe(testSpecializationName);
      console.log(`✅ Doctor has specialization: ${doctor.specialization}`);
    });
  });

  // Test 5: Delete the specialization
  describe('Delete Specialization', () => {
    test('Should delete the specialization and remove from doctors', async () => {
      const res = await request(app)
        .delete(`/api/admin/specializations/${testSpecializationId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.statusCode).toBe(200);
      console.log('✅ Specialization deleted');
      
      // Add a small delay to ensure database updates
      await new Promise(resolve => setTimeout(resolve, 500));
    });
  });

  // Test 6: Verify specialization no longer exists
  describe('Verify Specialization Deleted', () => {
    test('Specialization should no longer exist in database', async () => {
      const res = await request(app)
        .get('/api/admin/specializations')
        .set('Authorization', `Bearer ${adminToken}`);
      
      const specialization = res.body.find(s => s._id === testSpecializationId);
      expect(specialization).toBeUndefined();
      console.log('✅ Specialization removed from database');
    });
  });

  // Test 7: Verify doctor no longer has the specialization
  describe('Verify Doctor Specialization Removed', () => {
    test('Doctor should no longer have the deleted specialization', async () => {
      const res = await request(app)
        .get('/api/admin/doctors')
        .set('Authorization', `Bearer ${adminToken}`);
      
      const doctor = res.body.find(d => d._id === testDoctorId);
      expect(doctor.specialization).not.toBe(testSpecializationName);
      expect(doctor.specialization).toBe('');
      console.log(`✅ Doctor specialization is now: "${doctor.specialization || 'None'}"`);
    });
  });

  // Test 8: Create another doctor to test dropdown
  describe('Test Doctor Assignment Dropdown', () => {
    test('Deleted specialization should not appear in doctor edit dropdown', async () => {
      // Get all active specializations
      const specsRes = await request(app)
        .get('/api/admin/specializations')
        .set('Authorization', `Bearer ${adminToken}`);
      
      const activeSpecializations = specsRes.body.map(s => s.name);
      expect(activeSpecializations).not.toContain(testSpecializationName);
      console.log(`✅ Deleted specialization not in active list: ${testSpecializationName}`);
    });
  });
});

// Additional Test: Integration test for the entire flow
describe('Complete Specialization Cleanup Flow', () => {
  let newAdminToken;
  let newSpecializationId;
  let newSpecializationName = 'Integration Test Spec';
  let newDoctorId;

  beforeAll(async () => {
    // Login to get token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send(adminCredentials);
    newAdminToken = loginRes.body.token;
  });

  test('Step 1: Create specialization', async () => {
    const res = await request(app)
      .post('/api/admin/specializations')
      .set('Authorization', `Bearer ${newAdminToken}`)
      .send({
        name: newSpecializationName,
        description: 'Integration test specialization'
      });
    
    expect(res.statusCode).toBe(201);
    newSpecializationId = res.body._id;
    console.log(`✅ 1. Created specialization: ${newSpecializationName}`);
  });

  test('Step 2: Create doctor with specialization', async () => {
    const res = await request(app)
      .post('/api/auth/create-doctor')
      .set('Authorization', `Bearer ${newAdminToken}`)
      .send({
        email: 'integration.doctor@test.com',
        password: 'doctor123',
        role: 'doctor',
        profile: { firstName: 'Integration', lastName: 'Doctor', phone: '1234567890' },
        licenseNumber: 'INT123',
        specialization: newSpecializationName
      });
    
    expect(res.statusCode).toBe(201);
    newDoctorId = res.body.user.id;
    console.log(`✅ 2. Created doctor with specialization`);
  });

  test('Step 3: Verify doctor has specialization', async () => {
    const res = await request(app)
      .get('/api/admin/doctors')
      .set('Authorization', `Bearer ${newAdminToken}`);
    
    const doctor = res.body.find(d => d._id === newDoctorId);
    expect(doctor.specialization).toBe(newSpecializationName);
    console.log(`✅ 3. Doctor has specialization: ${doctor.specialization}`);
  });

  test('Step 4: Delete specialization', async () => {
    const res = await request(app)
      .delete(`/api/admin/specializations/${newSpecializationId}`)
      .set('Authorization', `Bearer ${newAdminToken}`);
    
    expect(res.statusCode).toBe(200);
    console.log(`✅ 4. Deleted specialization`);
  });

  test('Step 5: Verify doctor no longer has specialization', async () => {
    const res = await request(app)
      .get('/api/admin/doctors')
      .set('Authorization', `Bearer ${newAdminToken}`);
    
    const doctor = res.body.find(d => d._id === newDoctorId);
    expect(doctor.specialization).toBe('');
    console.log(`✅ 5. Doctor specialization removed - now: "${doctor.specialization || 'None'}"`);
  });

  test('Step 6: Clean up test doctor', async () => {
    await User.findByIdAndDelete(newDoctorId);
    console.log(`✅ 6. Cleaned up test doctor`);
  });
});

// Test to verify the cleanup endpoint
describe('Orphaned Specialization Cleanup Endpoint', () => {
  let adminAuthToken;
  let orphanDoctorId;

  beforeAll(async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send(adminCredentials);
    adminAuthToken = loginRes.body.token;
  });

  test('Should create a doctor with non-existent specialization', async () => {
    // Create a doctor with a specialization that doesn't exist
    const res = await request(app)
      .post('/api/auth/create-doctor')
      .set('Authorization', `Bearer ${adminAuthToken}`)
      .send({
        email: 'orphan.doctor@test.com',
        password: 'doctor123',
        role: 'doctor',
        profile: { firstName: 'Orphan', lastName: 'Doctor', phone: '1234567890' },
        licenseNumber: 'ORPH123',
        specialization: 'NonExistentSpecializationXYZ'
      });
    
    expect(res.statusCode).toBe(201);
    orphanDoctorId = res.body.user.id;
    console.log(`✅ Created doctor with orphaned specialization`);
  });

  test('Should clean up orphaned specializations', async () => {
    const res = await request(app)
      .post('/api/admin/specializations/cleanup')
      .set('Authorization', `Bearer ${adminAuthToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.cleaned).toBeGreaterThan(0);
    console.log(`✅ Cleaned up ${res.body.cleaned} doctors with orphaned specializations`);
  });

  test('Verify doctor specialization was cleared', async () => {
    const res = await request(app)
      .get('/api/admin/doctors')
      .set('Authorization', `Bearer ${adminAuthToken}`);
    
    const doctor = res.body.find(d => d._id === orphanDoctorId);
    expect(doctor.specialization).toBe('');
    console.log(`✅ Doctor specialization cleared`);
  });

  afterAll(async () => {
    await User.findByIdAndDelete(orphanDoctorId);
  });
});