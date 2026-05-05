// frontend/src/components/features/Doctor/AccountSettings/AccountSettings.jsx
import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Award, Lock, Save, AlertCircle, CheckCircle, Building, Calendar, Users } from 'lucide-react';
import api from '../../../../services/api';
import './AccountSettings.css';

const AccountSettings = ({ user, onUserUpdate }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    specialization: '',
    licenseNumber: '',
    hospital: '',
    dateOfBirth: '',
    gender: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.profile?.firstName || '',
        lastName: user.profile?.lastName || '',
        phone: user.profile?.phone || '',
        email: user.email || '',
        specialization: user.specialization || '',
        licenseNumber: user.licenseNumber || '',
        hospital: user.hospital?.name || (typeof user.hospital === 'string' ? user.hospital : ''),
        dateOfBirth: user.profile?.dateOfBirth ? new Date(user.profile.dateOfBirth).toISOString().split('T')[0] : '',
        gender: user.profile?.gender || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await api.put('/auth/profile', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone
      });
      
      setSuccess('Profile updated successfully!');
      
      // Update local user data
      if (onUserUpdate) {
        const updatedUser = { ...user, profile: { ...user.profile, ...response.data.profile } };
        onUserUpdate(updatedUser);
      }
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError('');
    setPasswordSuccess('');
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      setPasswordLoading(false);
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      setPasswordLoading(false);
      return;
    }
    
    try {
      await api.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      setPasswordSuccess('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setTimeout(() => setPasswordSuccess(''), 3000);
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
      setTimeout(() => setPasswordError(''), 3000);
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="account-settings">
      <div className="settings-header">
        <h2>Account Settings</h2>
        <p>Manage your profile information and password</p>
      </div>

      <div className="settings-grid">
        {/* Profile Information Section */}
        <div className="settings-card">
          <div className="card-header">
            <User size={18} />
            <h3>Profile Information</h3>
          </div>
          
          <form onSubmit={handleSubmit} className="settings-form">
            {success && (
              <div className="success-message">
                <CheckCircle size={16} />
                <span>{success}</span>
              </div>
            )}
            {error && (
              <div className="error-message">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
            
            <div className="form-row">
              <div className="form-group">
                <label><User size={14} /> First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Enter first name"
                />
              </div>
              <div className="form-group">
                <label><User size={14} /> Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Enter last name"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label><Phone size={14} /> Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Contact number"
                />
              </div>
              <div className="form-group">
                <label><Mail size={14} /> Email (Cannot be changed)</label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="disabled-input"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label><Award size={14} /> Specialization</label>
                <input
                  type="text"
                  value={formData.specialization}
                  disabled
                  className="disabled-input"
                />
                <small>Contact admin to change specialization</small>
              </div>
              <div className="form-group">
                <label><Building size={14} /> Hospital Affiliation</label>
                <input
                  type="text"
                  value={formData.hospital || 'Not assigned'}
                  disabled
                  className="disabled-input"
                />
              </div>
            </div>
            
            {formData.dateOfBirth && (
              <div className="form-row">
                <div className="form-group">
                  <label><Calendar size={14} /> Date of Birth</label>
                  <input
                    type="text"
                    value={new Date(formData.dateOfBirth).toLocaleDateString()}
                    disabled
                    className="disabled-input"
                  />
                </div>
                <div className="form-group">
                  <label><Users size={14} /> Gender</label>
                  <input
                    type="text"
                    value={formData.gender || 'Not specified'}
                    disabled
                    className="disabled-input"
                  />
                </div>
              </div>
            )}
            
            <div className="form-actions">
              <button type="submit" className="save-btn" disabled={loading}>
                <Save size={16} />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Section */}
        <div className="settings-card">
          <div className="card-header">
            <Lock size={18} />
            <h3>Change Password</h3>
          </div>
          
          <form onSubmit={handlePasswordSubmit} className="settings-form">
            {passwordSuccess && (
              <div className="success-message">
                <CheckCircle size={16} />
                <span>{passwordSuccess}</span>
              </div>
            )}
            {passwordError && (
              <div className="error-message">
                <AlertCircle size={16} />
                <span>{passwordError}</span>
              </div>
            )}
            
            <div className="form-group">
              <label><Lock size={14} /> Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                placeholder="Enter current password"
                required
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Minimum 6 characters"
                  required
                  minLength="6"
                />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm new password"
                  required
                />
              </div>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="password-btn" disabled={passwordLoading}>
                <Lock size={16} />
                {passwordLoading ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;