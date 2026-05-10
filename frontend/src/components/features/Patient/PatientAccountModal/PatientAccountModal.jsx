// frontend/src/components/features/Patient/PatientAccountModal/PatientAccountModal.jsx
import React, { useState } from 'react';
import { X, User, Lock, Save, Eye, EyeOff, Mail, Droplet, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { confirmDialog } from '../../../../utils/confirmDialog';
import api from '../../../../services/api';
import '../../../../styles/modal.css';
import './PatientAccountModal.css';

export const PatientAccountModal = ({ user, patientData, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    firstName: user?.profile?.firstName || '',
    lastName: user?.profile?.lastName || '',
    phone: user?.profile?.phone || '',
    email: user?.email || '',
    dateOfBirth: user?.profile?.dateOfBirth ? new Date(user.profile.dateOfBirth).toISOString().split('T')[0] : '',
    gender: user?.profile?.gender || '',
    bloodType: patientData?.bloodType || '',
    assignedDoctor: patientData?.assignedDoctor?.profile?.firstName 
      ? `Dr. ${patientData.assignedDoctor.profile.firstName} ${patientData.assignedDoctor.profile.lastName}`
      : 'Not assigned',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const showNotification = (message, isSuccess = true) => {
    if (isSuccess) {
      setSuccess(message);
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    const confirmed = await confirmDialog(
      'Save Changes',
      'Are you sure you want to update your profile information?',
      'info',
      'Yes, Save',
      'Cancel'
    );
    
    if (!confirmed) return;
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const profileResponse = await api.put('/auth/profile', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender
      });
      
      showNotification('Profile updated successfully!', true);
      
      const updatedUser = { 
        ...user, 
        profile: { 
          ...user.profile,
          ...profileResponse.data.profile,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender
        } 
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      if (onUpdate) onUpdate(updatedUser);
      
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to update profile', false);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      showNotification('New passwords do not match', false);
      return;
    }
    
    if (formData.newPassword.length < 6) {
      showNotification('Password must be at least 6 characters', false);
      return;
    }
    
    const confirmed = await confirmDialog(
      'Change Password',
      'Are you sure you want to change your password? You will need to log in again after this change.',
      'warning',
      'Yes, Change',
      'Cancel'
    );
    
    if (!confirmed) return;
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.put('/auth/change-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      
      showNotification('Password changed successfully! Please log in again.', true);
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setTimeout(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }, 2000);
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to change password', false);
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
    <div className="patient-account-modal-overlay" onClick={onClose}>
      <div className="patient-account-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            <User size={18} />
            Account Settings
          </h3>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-tabs">
          <button 
            className={`modal-tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={14} /> Profile Information
          </button>
          <button 
            className={`modal-tab ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            <Lock size={14} /> Change Password
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div className="error-message">
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="success-message">
              <CheckCircle size={14} />
              <span>{success}</span>
            </div>
          )}

          {/* Profile Information Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleUpdateProfile} className="account-form">
              <div className="form-section">
                <div className="section-title">
                  <User size={16} />
                  <h4>Personal Information</h4>
                </div>
                
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
                    <label>Date of Birth</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                    />
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
                    <label>Gender</label>
                    <select name="gender" value={formData.gender} onChange={handleChange}>
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="section-title">
                  <Mail size={16} />
                  <h4>Contact Information</h4>
                </div>
                
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="disabled-input"
                  />
                  <small>Email cannot be changed</small>
                </div>
              </div>

              <div className="form-section">
                <div className="section-title">
                  <Droplet size={16} />
                  <h4>Medical Information</h4>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Blood Type</label>
                    <input
                      type="text"
                      value={formData.bloodType || 'Not specified'}
                      disabled
                      className="disabled-input"
                    />
                    <small>Blood type can only be updated by your doctor</small>
                  </div>
                  <div className="form-group">
                    <label>Primary Physician</label>
                    <input
                      type="text"
                      value={formData.assignedDoctor}
                      disabled
                      className="disabled-input"
                    />
                  </div>
                </div>
              </div>
              
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn" disabled={loading}>
                  <Save size={16} />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}

          {/* Change Password Tab */}
          {activeTab === 'password' && (
            <form onSubmit={handleChangePassword} className="account-form">
              <div className="form-section">
                <div className="section-title">
                  <Lock size={16} />
                  <h4>Change Password</h4>
                </div>
                
                <div className="form-group">
                  <label>Current Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      required
                      placeholder="Enter current password"
                    />
                    <button 
                      type="button" 
                      className="password-toggle"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>New Password</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        required
                        placeholder="Minimum 6 characters"
                      />
                      <button 
                        type="button" 
                        className="password-toggle"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
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
                
                <div className="info-note">
                  <AlertCircle size={14} />
                  <span>After changing your password, you will be redirected to the login page.</span>
                </div>
              </div>
              
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="password-submit-btn" disabled={loading}>
                  <Lock size={16} />
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};