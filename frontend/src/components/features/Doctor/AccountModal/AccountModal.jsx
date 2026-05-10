// frontend/src/components/features/Doctor/AccountModal/AccountModal.jsx
import React, { useState } from 'react';
import { X, User, Lock, Save, Phone, Mail, Award, Building, Calendar, Users } from 'lucide-react';
import api from '../../../../services/api';
import './AccountModal.css';

export const AccountModal = ({ user, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    firstName: user?.profile?.firstName || '',
    lastName: user?.profile?.lastName || '',
    phone: user?.profile?.phone || '',
    email: user?.email || '',
    dateOfBirth: user?.profile?.dateOfBirth ? new Date(user.profile.dateOfBirth).toISOString().split('T')[0] : '',
    gender: user?.profile?.gender || '',
    specialization: user?.specialization || '',
    hospital: user?.hospital?.name || (typeof user?.hospital === 'string' ? user.hospital : ''),
    licenseNumber: user?.licenseNumber || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleUpdateProfile = async (e) => {
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
      
      const updatedUser = { 
        ...user, 
        profile: { 
          ...user.profile,
          ...response.data.profile,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender
        } 
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      if (onUpdate) onUpdate(updatedUser);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.put('/auth/change-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      
      setSuccess('Password changed successfully!');
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const diff = Date.now() - birthDate.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const age = calculateAge(formData.dateOfBirth);

  return (
    <div className="account-modal-overlay" onClick={onClose}>
      <div className="account-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Account Settings</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          {/* Profile Section */}
          <div className="form-section">
            <div className="section-title">
              <User size={16} />
              <h4>Profile Information</h4>
            </div>
            
            <form onSubmit={handleUpdateProfile}>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="disabled-input"
                  />
                  <small>Email cannot be changed</small>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleChange}>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              
              {age && (
                <div className="info-note">
                  <Calendar size={14} />
                  <span>Age: {age} years</span>
                </div>
              )}
              
              <div className="form-row">
                <div className="form-group">
                  <label>Specialization</label>
                  <input
                    type="text"
                    value={formData.specialization || 'Not specified'}
                    disabled
                    className="disabled-input"
                  />
                  <small>Contact admin to change specialization</small>
                </div>
                <div className="form-group">
                  <label>Hospital Affiliation</label>
                  <input
                    type="text"
                    value={formData.hospital || 'Not assigned'}
                    disabled
                    className="disabled-input"
                  />
                </div>
              </div>
              
              {formData.licenseNumber && (
                <div className="form-group">
                  <label>License Number</label>
                  <input
                    type="text"
                    value={formData.licenseNumber}
                    disabled
                    className="disabled-input"
                  />
                </div>
              )}
              
              <button type="submit" className="save-btn" disabled={loading}>
                <Save size={16} />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>

          <div className="form-divider"></div>

          {/* Password Section */}
          <div className="form-section">
            <div className="section-title">
              <Lock size={16} />
              <h4>Change Password</h4>
            </div>
            
            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  required
                  placeholder="Enter current password"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    required
                    placeholder="Min. 6 characters"
                  />
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
              
              <button type="submit" className="password-btn" disabled={loading}>
                <Lock size={16} />
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};