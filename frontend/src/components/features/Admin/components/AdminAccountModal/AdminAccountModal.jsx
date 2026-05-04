import React, { useState } from 'react';
import { X, User, Lock, Save, Eye, EyeOff, Phone, Mail } from 'lucide-react';
import api from '../../../../../services/api';
import '../../../../../styles/modal.css';
import './AdminAccountModal.css';

export const AdminAccountModal = ({ user, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    firstName: user?.profile?.firstName || '',
    lastName: user?.profile?.lastName || '',
    phone: user?.profile?.phone || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

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
      
      const updatedUser = { ...user, profile: response.data.profile };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      if (onUpdate) onUpdate(updatedUser);
      
      setTimeout(() => {
        setSuccess('');
        onClose();
      }, 1500);
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container modal-md" onClick={(e) => e.stopPropagation()}>
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
              <h4>Personal Information</h4>
            </div>
            
            <form onSubmit={handleUpdateProfile}>
              <div className="form-row-2">
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
                <label>Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="disabled-input"
                />
              </div>
              
              <div className="form-group">
                <label>Role</label>
                <input
                  type="text"
                  value="Administrator"
                  disabled
                  className="disabled-input"
                />
              </div>
              
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
              
              <div className="form-group">
                <label>New Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    required
                    placeholder="Min. 6 characters"
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