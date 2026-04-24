const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running!' });
});

app.post('/api/auth/register', (req, res) => {
  console.log('Register request:', req.body);
  res.json({
    message: 'Registration successful',
    token: 'test-token-123',
    user: {
      id: '123',
      email: req.body.email,
      role: 'doctor',
      profile: req.body.profile
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  console.log('Login request:', req.body);
  res.json({
    message: 'Login successful',
    token: 'test-token-123',
    user: {
      id: '123',
      email: req.body.email,
      role: 'doctor',
      profile: { firstName: 'Test', lastName: 'User' }
    }
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Test backend running on http://localhost:${PORT}`);
  console.log(`📝 Test endpoint: http://localhost:${PORT}/health`);
});