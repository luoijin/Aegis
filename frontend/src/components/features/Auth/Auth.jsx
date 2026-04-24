import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../common/Button/Button';
import Input from '../../common/Input/Input';
import api from '../../../utils/api';
import './Auth.css';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', password: '', role: 'doctor'
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let response;
      if (isLogin) {
        response = await api.post('/auth/login', {
          email: formData.email,
          password: formData.password
        });
      } else {
        response = await api.post('/auth/register', {
          email: formData.email,
          password: formData.password,
          role: formData.role,
          profile: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: '1234567890'
          }
        });
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
    <div className="auth-container">
      <div className="auth-bg">
        <div className="auth-bg-gradient"></div>
        <div className="auth-bg-pattern"></div>
      </div>
      
      <motion.div 
        className="auth-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="auth-header">
          <div className="logo-wrapper">
            <span className="logo-icon">⚕️</span>
            <h1 className="auth-title">AEGIS</h1>
          </div>
          <p className="auth-subtitle">Advanced Health Intelligence Platform</p>
        </div>

        <div className="auth-toggle">
          <button 
            className={`toggle-btn ${isLogin ? 'active' : ''}`} 
            onClick={() => setIsLogin(true)}
          >
            Sign In
          </button>
          <button 
            className={`toggle-btn ${!isLogin ? 'active' : ''}`} 
            onClick={() => setIsLogin(false)}
          >
            Create Account
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.form 
            key={isLogin ? 'login' : 'register'}
            initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
            transition={{ duration: 0.3 }}
            className="auth-form" 
            onSubmit={handleSubmit}
          >
            {error && <div className="alert alert-error">{error}</div>}

            {!isLogin && (
              <div className="name-row">
                <Input 
                  name="firstName" 
                  placeholder="First Name" 
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
                <Input 
                  name="lastName" 
                  placeholder="Last Name" 
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <Input 
              type="email"
              name="email"
              label="Email Address"
              placeholder="doctor@aegis.com"
              value={formData.email}
              onChange={handleChange}
              icon="📧"
              required
            />

            <Input 
              type="password"
              name="password"
              label="Password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              icon="🔒"
              required
            />

            {!isLogin && (
              <div className="input-group">
                <label className="input-label">Account Type</label>
                <div className="role-selector">
                  <label className={`role-option ${formData.role === 'doctor' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="role"
                      value="doctor"
                      checked={formData.role === 'doctor'}
                      onChange={handleChange}
                    />
                    <span>👨‍⚕️ Doctor</span>
                  </label>
                  <label className={`role-option ${formData.role === 'patient' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="role"
                      value="patient"
                      checked={formData.role === 'patient'}
                      onChange={handleChange}
                    />
                    <span>👤 Patient</span>
                  </label>
                </div>
              </div>
            )}

            <Button type="submit" variant="primary" fullWidth loading={loading}>
              {isLogin ? 'Access Dashboard' : 'Create Account'}
            </Button>
          </motion.form>
        </AnimatePresence>

        <div className="auth-footer">
          <p className="footer-text">
            {isLogin ? 'Secure access for medical professionals' : 'Join the future of healthcare'}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;