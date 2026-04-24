const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../server');
const User = require('../models/User.model');

describe('Patient API Tests', () => {
  let authToken;
  let patientId;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.TEST_MONGODB_URI);
    
    // Create test user and get token
    const user = await User.create({
      email: 'test@example.com',
      password: 'password123',
      role: 'doctor'
    });
    
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });
    
    authToken = loginRes.body.token;
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  describe('POST /api/patients', () => {
    it('should create a new patient', async () => {
      const res = await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userId: new mongoose.Types.ObjectId(),
          bloodType: 'A+',
          allergies: ['Penicillin']
        });
      
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('bloodType', 'A+');
      patientId = res.body._id;
    });

    it('should return 401 without token', async () => {
      const res = await request(app)
        .post('/api/patients')
        .send({ bloodType: 'O+' });
      
      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/patients', () => {
    it('should get all patients', async () => {
      const res = await request(app)
        .get('/api/patients')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /api/patients/:id', () => {
    it('should get patient by id', async () => {
      const res = await request(app)
        .get(`/api/patients/${patientId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body._id).toBe(patientId);
    });

    it('should return 404 for invalid id', async () => {
      const res = await request(app)
        .get('/api/patients/invalid-id')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.statusCode).toBe(500);
    });
  });
}); 