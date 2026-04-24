const request = require('supertest');
const app = require('../server');

describe('Health Log API Tests', () => {
  let authToken;
  let patientId;
  let healthLogId;

  beforeAll(async () => {
    // Login to get token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'doctor@test.com', password: '123456' });
    authToken = loginRes.body.token;
  });

  describe('POST /api/health-logs', () => {
    it('should create a new health log', async () => {
      const res = await request(app)
        .post('/api/health-logs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          patient: patientId,
          vitals: {
            bloodPressure: { systolic: 120, diastolic: 80 },
            heartRate: 72,
            temperature: 36.6,
            oxygenSaturation: 98
          },
          symptoms: ['headache'],
          notes: 'Regular checkup'
        });
      
      expect(res.statusCode).toBe(201);
      expect(res.body.vitals.heartRate).toBe(72);
      healthLogId = res.body._id;
    });

    it('should return 401 without token', async () => {
      const res = await request(app)
        .post('/api/health-logs')
        .send({ vitals: { heartRate: 72 } });
      
      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/health-logs', () => {
    it('should get all health logs', async () => {
      const res = await request(app)
        .get('/api/health-logs')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /api/health-logs/trends', () => {
    it('should get vitals trends', async () => {
      const res = await request(app)
        .get(`/api/health-logs/trends?patientId=${patientId}&days=30`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('heartRate');
    });
  });
});