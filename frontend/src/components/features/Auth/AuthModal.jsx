import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Mail, Lock, User, X, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../../../utils/api';
import './AuthModal.css';

const AuthModal = ({ mode, onClose, onSwitchMode }) => {
  const [isLogin, setIsLogin] = useState(mode === 'login');
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
      let response;
      if (isLogin) {
        // Login - role is determined by backend
        response = await api.post('/auth/login', {
          email: formData.email,
          password: formData.password
        });
        
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          localStorage.setItem('userRole', response.data.user.role);
          onClose();
          
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
        // Register - always creates a patient account (no role selection)
        response = await api.post('/auth/register', {
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
          setSuccess('Account created successfully! Please sign in.');
          // Clear form
          setFormData({ firstName: '', lastName: '', email: '', password: '' });
          // Switch to login mode after 2 seconds
          setTimeout(() => {
            setIsLogin(true);
            onSwitchMode('login');
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

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <motion.div 
        className="auth-modal"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3 }}
      >
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>
        
        <div className="modal-header">
          <div className="logo-wrapper">
            <Heart size={32} strokeWidth={1.5} />
            <h2 className="modal-title">AEGIS</h2>
          </div>
          <p className="modal-subtitle">Health Monitoring System</p>
        </div>

        <div className="auth-toggle-modal">
          <button 
            className={`toggle-btn-modal ${isLogin ? 'active' : ''}`} 
            onClick={() => {
              setIsLogin(true);
              onSwitchMode('login');
              setError('');
              setSuccess('');
            }}
          >
            Sign In
          </button>
          <button 
            className={`toggle-btn-modal ${!isLogin ? 'active' : ''}`} 
            onClick={() => {
              setIsLogin(false);
              onSwitchMode('register');
              setError('');
              setSuccess('');
            }}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="alert-error-modal">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
          
          {success && (
            <div className="alert-success-modal">
              <CheckCircle size={16} />
              {success}
            </div>
          )}

          {!isLogin && (
            <div className="name-row-modal">
              <input 
                type="text" 
                name="firstName" 
                placeholder="First Name" 
                value={formData.firstName}
                onChange={handleChange}
                className="input-field-modal"
                required
              />
              <input 
                type="text" 
                name="lastName" 
                placeholder="Last Name" 
                value={formData.lastName}
                onChange={handleChange}
                className="input-field-modal"
                required
              />
            </div>
          )}

          <div className="input-group-modal">
            <label>Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} />
              <input 
                type="email" 
                name="email" 
                placeholder="your@email.com" 
                value={formData.email}
                onChange={handleChange}
                className="input-field-modal"
                required
              />
            </div>
          </div>

          <div className="input-group-modal">
            <label>Password</label>
            <div className="input-with-icon">
              <Lock size={18} />
              <input 
                type="password" 
                name="password" 
                placeholder="••••••••" 
                value={formData.password}
                onChange={handleChange}
                className="input-field-modal"
                required
                minLength="6"
              />
            </div>
          </div>

          {!isLogin && (
            <p className="register-note-modal">
              By creating an account, you'll be able to:
              <br />• View your health records
              <br />• Track your vitals over time
              <br />• Share data with your healthcare providers
            </p>
          )}

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Patient Account')}
          </button>
        </form>

        <div className="modal-footer">
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              type="button"
              className="switch-mode-btn"
              onClick={() => {
                setIsLogin(!isLogin);
                onSwitchMode(!isLogin ? 'login' : 'register');
                setError('');
                setSuccess('');
              }}
            >
              {isLogin ? 'Register Now' : 'Sign In'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthModal;