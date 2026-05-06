// frontend/src/components/features/Admin/components/modals/EditDoctorModal.jsx
import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Award, Building, AlertCircle, Stethoscope, Calendar } from 'lucide-react';
import api from '../../../../../utils/api';
import './Modal.css';

const EditDoctorModal = ({ isOpen, onClose, editingDoctor, specializations, hospitals, onSuccess }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    licenseNumber: '',
    specialization: '',
    hospitalId: '',
    isActive: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingDoctor && isOpen) {
      const profile = editingDoctor.profile || {};
      
      let hospitalId = '';
      if (editingDoctor.hospital) {
        if (typeof editingDoctor.hospital === 'object') {
          hospitalId = editingDoctor.hospital._id || '';
        } else if (typeof editingDoctor.hospital === 'string') {
          hospitalId = editingDoctor.hospital;
        }
      }
      
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: editingDoctor.email || '',
        phone: profile.phone || '',
        dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : '',
        gender: profile.gender || '',
        licenseNumber: editingDoctor.licenseNumber || '',
        specialization: editingDoctor.specialization || '',
        hospitalId: hospitalId,
        isActive: editingDoctor.isActive !== false
      });
    }
  }, [editingDoctor, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Validation - all fields required
    if (!formData.firstName.trim()) setError('First name is required');
    else if (!formData.lastName.trim()) setError('Last name is required');
    else if (!formData.phone.trim()) setError('Phone number is required');
    else if (!formData.dateOfBirth) setError('Date of birth is required');
    else if (!formData.gender) setError('Gender is required');
    else if (!formData.licenseNumber.trim()) setError('License number is required');
    else if (!formData.specialization) setError('Please select a specialization');
    else if (!formData.hospitalId) setError('Please select a hospital');
    
    if (error) {
      setLoading(false);
      return;
    }
    
    try {
      const updateData = {
        profile: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender
        },
        licenseNumber: formData.licenseNumber,
        specialization: formData.specialization,
        hospital: formData.hospitalId,
        isActive: formData.isActive
      };
      
      await api.put(`/admin/doctors/${editingDoctor._id}`, updateData);
      
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Update error:', err);
      setError(err.response?.data?.message || 'Failed to update doctor');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            <User size={18} /> 
            Edit Doctor: Dr. {formData.firstName} {formData.lastName}
          </h3>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        
        <div className="modal-body">
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
                <span>Personal Information</span>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
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
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Date of Birth *</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Gender *</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} required>
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
                <span>Contact Information</span>
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
            
            {/* Professional Information */}
            <div className="form-section">
              <div className="form-section-header">
                <span>Professional Information</span>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>License Number *</label>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Specialization *</label>
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
                <label>Hospital Affiliation *</label>
                <select
                  name="hospitalId"
                  value={formData.hospitalId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Hospital</option>
                  {hospitals?.map(h => (
                    <option key={h._id} value={h._id}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Account Status */}
            <div className="form-section">
              <div className="form-section-header">
                <span>Account Status</span>
              </div>
              
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                  />
                  <span>Account Active</span>
                </label>
                <small>Inactive doctors cannot log in to the system</small>
              </div>
            </div>
            
            <div className="modal-actions">
              <button type="button" className="cancel-btn" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditDoctorModal;