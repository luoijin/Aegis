import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../common/Button/Button';
import api from '../../../utils/api';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let response;
      if (isRegister) {
        response = await api.post('/auth/register', {
          email,
          password,
          role: 'doctor',
          profile: { firstName: firstName || email.split('@')[0], lastName: lastName || 'User', phone: '1234567890' }
        });
      } else {
        response = await api.post('/auth/login', { email, password });
      }

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <span className="login-icon">⚕️</span>
          <h1 className="login-title">AEGIS</h1>
        </div>

        <h2 className="login-heading">{isRegister ? 'Create Account' : 'Welcome Back'}</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            required
          />

          {isRegister && (
            <>
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="input-field"
              />
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="input-field"
              />
            </>
          )}

          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            required
            minLength="6"
          />

          <Button type="submit" variant="primary" fullWidth loading={loading}>
            {isRegister ? 'Create Account' : 'Sign In'}
          </Button>
        </form>

        <p className="toggle-text">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}
          <button onClick={() => setIsRegister(!isRegister)} className="toggle-btn">
            {isRegister ? 'Sign In' : 'Create Account'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;