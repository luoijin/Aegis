// frontend/src/components/features/Auth/AuthModal.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Mail, Lock, User, X, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../../../utils/api';
import styles from './AuthModal.module.css';

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
        response = await api.post('/auth/login', {
          email: formData.email,
          password: formData.password
        });
        
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          localStorage.setItem('userRole', response.data.user.role);
          onClose();
          
          if (response.data.user.role === 'admin') {
            navigate('/admin/dashboard');
          } else if (response.data.user.role === 'doctor') {
            navigate('/doctor/dashboard');
          } else {
            navigate('/patient/dashboard');
          }
        }
      } else {
        response = await api.post('/auth/register', {
          email: formData.email,
          password: formData.password,
          role: 'patient',
          profile: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: '1234567890'
          }
        });
        
        if (response.data.token) {
          setSuccess('Account created successfully! Please sign in.');
          setFormData({ firstName: '', lastName: '', email: '', password: '' });
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
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={24} />
        </button>
        
        <div className={styles.header}>
          <div className={styles.logoWrapper}>
            <h2 className={styles.title}>AEGIS</h2>
          </div>
        </div>

        <div className={styles.toggle}>
          <button 
            className={`${styles.toggleBtn} ${isLogin ? styles.active : ''}`} 
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
            className={`${styles.toggleBtn} ${!isLogin ? styles.active : ''}`} 
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
            <div className={styles.alertError}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}
          
          {success && (
            <div className={styles.alertSuccess}>
              <CheckCircle size={16} />
              {success}
            </div>
          )}

          {!isLogin && (
            <div className={styles.nameRow}>
              <input 
                type="text" 
                name="firstName" 
                placeholder="First Name" 
                value={formData.firstName}
                onChange={handleChange}
                className={styles.input}
                required
              />
              <input 
                type="text" 
                name="lastName" 
                placeholder="Last Name" 
                value={formData.lastName}
                onChange={handleChange}
                className={styles.input}
                required
              />
            </div>
          )}

          <div className={styles.inputGroup}>
            <label>Email Address</label>
            <div className={styles.inputIcon}>
              <Mail size={18} />
              <input 
                type="email" 
                name="email" 
                placeholder="your@email.com" 
                value={formData.email}
                onChange={handleChange}
                className={styles.input}
                required
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>Password</label>
            <div className={styles.inputIcon}>
              <Lock size={18} />
              <input 
                type="password" 
                name="password" 
                placeholder="••••••••" 
                value={formData.password}
                onChange={handleChange}
                className={styles.input}
                required
                minLength="6"
              />
            </div>
          </div>

          {!isLogin && (
            <p className={styles.registerNote}>
              By creating an account, you'll be able to:
              <br />• View your health records
              <br />• Track your vitals over time
              <br />• Share data with your healthcare providers
            </p>
          )}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Patient Account')}
          </button>
        </form>

        <div className={styles.footer}>
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              type="button"
              className={styles.switchBtn}
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
      </div>
    </div>
  );
};

export default AuthModal;