// frontend/src/components/features/Admin/components/modals/DoctorModal.jsx
import React, { useState, useEffect } from 'react';
import { X, User, Mail, Lock, Phone, Award, Building, AlertCircle, Stethoscope, Calendar } from 'lucide-react';
import api from '../../../../../utils/api';
import './Modal.css';

const DoctorModal = ({ isOpen, onClose, specializations, hospitals, onSuccess }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    licenseNumber: '',
    specialization: '',
    hospitalId: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        licenseNumber: '',
        specialization: '',
        hospitalId: ''
      });
      setError('');
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (!formData.firstName.trim()) {
      setError('First name is required');
      setLoading(false);
      return;
    }
    if (!formData.lastName.trim()) {
      setError('Last name is required');
      setLoading(false);
      return;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      setLoading(false);
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }
    if (!formData.specialization) {
      setError('Please select a specialization');
      setLoading(false);
      return;
    }
    
    try {
      const response = await api.post('/auth/create-doctor', {
        email: formData.email,
        password: formData.password,
        profile: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone || '',
          dateOfBirth: formData.dateOfBirth || null,
          gender: formData.gender || ''
        },
        licenseNumber: formData.licenseNumber || '',
        specialization: formData.specialization,
        hospital: formData.hospitalId || null
      });
      
      console.log('Doctor created:', response.data);
      
      // Call onSuccess to refresh the doctor list
      if (onSuccess) {
        await onSuccess();
      }
      onClose();
    } catch (err) {
      console.error('Create doctor error:', err);
      setError(err.response?.data?.message || 'Failed to create doctor');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3><User size={18} /> Create New Doctor Account</h3>
          <button className="close-btn" onClick={onClose}><X size={18} /></button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}
          
          {/* Personal Information Section */}
          <div className="form-section">
            <div className="form-section-header">
              <User size={14} />
              <span>Personal Information</span>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label><User size={12} /> First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  placeholder="Enter first name"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label><User size={12} /> Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  placeholder="Enter last name"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label><Phone size={12} /> Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Contact number"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label><Calendar size={12} /> Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                />
              </div>
            </div>
            
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
          
          {/* Contact Information */}
          <div className="form-section">
            <div className="form-section-header">
              <Mail size={14} />
              <span>Contact Information</span>
            </div>
            
            <div className="form-group">
              <label><Mail size={12} /> Email Address *</label>
              <input
                type="email"
                name="email"
                placeholder="doctor@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label><Lock size={12} /> Password *</label>
              <input
                type="password"
                name="password"
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
              />
              <small>Doctor will use this password to log in</small>
            </div>
          </div>
          
          {/* Professional Information */}
          <div className="form-section">
            <div className="form-section-header">
              <Stethoscope size={14} />
              <span>Professional Information</span>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label><Award size={12} /> License Number</label>
                <input
                  type="text"
                  name="licenseNumber"
                  placeholder="Medical license number"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label><Award size={12} /> Specialization *</label>
                <select
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Specialization</option>
                  {specializations?.map(spec => (
                    <option key={spec._id} value={spec.name}>
                      {spec.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label><Building size={12} /> Hospital Affiliation</label>
              <select
                name="hospitalId"
                value={formData.hospitalId}
                onChange={handleChange}
              >
                <option value="">— No Hospital —</option>
                {hospitals?.map(h => (
                  <option key={h._id} value={h._id}>
                    {h.name}
                  </option>
                ))}
              </select>
              <small>Optional: Assign doctor to a hospital</small>
            </div>
          </div>
          
          <div className="info-note">
            <AlertCircle size={14} />
            <span>Doctor will use this email and password to log in to their account.</span>
          </div>
          
          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Creating...' : 'Create Doctor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DoctorModal;