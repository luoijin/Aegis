import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';
import Button from '../../common/Button/Button';
import Input from '../../common/Input/Input';
import api from '../../../utils/api';
import './Auth.css';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '', 
    lastName: '', 
    email: '', 
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isLogin) {
        // Login - role is determined by backend
        const response = await api.post('/auth/login', {
          email: formData.email,
          password: formData.password
        });
        
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          localStorage.setItem('userRole', response.data.user.role);
          
          // Redirect based on role
          if (response.data.user.role === 'admin') {
            navigate('/admin/dashboard');
          } else if (response.data.user.role === 'doctor') {
            navigate('/doctor/dashboard');
          } else {
            navigate('/patient/dashboard');
          }
        }
      } else {
        // Register - always creates a patient account
        const response = await api.post('/auth/register', {
          email: formData.email,
          password: formData.password,
          role: 'patient',  // Force role to patient
          profile: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: '1234567890'
          }
        });
        
        if (response.data.token) {
          setSuccess('Account created successfully! Redirecting to login...');
          setTimeout(() => {
            setIsLogin(true);
            setFormData({ firstName: '', lastName: '', email: '', password: '' });
            setSuccess('');
          }, 2000);
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
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
            <Heart size={32} strokeWidth={1.5} />
            <h1 className="auth-title">AEGIS</h1>
          </div>
        </div>

        {/* Toggle Buttons */}
        <div className="auth-toggle">
          <button 
            className={`toggle-btn ${isLogin ? 'active' : ''}`} 
            onClick={() => {
              setIsLogin(true);
              setError('');
              setSuccess('');
            }}
          >
            Sign In
          </button>
          <button 
            className={`toggle-btn ${!isLogin ? 'active' : ''}`} 
            onClick={() => {
              setIsLogin(false);
              setError('');
              setSuccess('');
            }}
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
            {error && (
              <div className="alert alert-error">
                <AlertCircle size={16} />
                {error}
              </div>
            )}
            
            {success && (
              <div className="alert alert-success">
                <CheckCircle size={16} />
                {success}
              </div>
            )}

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
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleChange}
              icon={<Mail size={16} />}
              required
            />

            <Input 
              type="password"
              name="password"
              label="Password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              icon={<Lock size={16} />}
              required
            />

            {!isLogin && (
              <p className="register-note">
                By creating an account, you'll be able to:
                <br />• View your health records
                <br />• Track your vitals over time
                <br />• Share data with your healthcare providers
              </p>
            )}

            <Button type="submit" variant="primary" fullWidth loading={loading}>
              {isLogin ? 'Sign In' : 'Create Patient Account'}
            </Button>
          </motion.form>
        </AnimatePresence>

        <div className="auth-footer">
          <p className="footer-text">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setSuccess('');
              }}
              className="switch-btn"
            >
              {isLogin ? 'Create Account' : 'Sign In'}
            </button>
          </p>
          <p className="doctor-note">
            👨‍⚕️ Are you a doctor? Accounts are created by hospital administrators.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;