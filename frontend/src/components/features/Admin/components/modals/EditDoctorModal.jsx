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
      console.log('Editing doctor data:', editingDoctor);
      
      // Get hospital ID properly
      let hospitalId = '';
      if (editingDoctor.hospital) {
        if (typeof editingDoctor.hospital === 'object') {
          hospitalId = editingDoctor.hospital._id || '';
        } else if (typeof editingDoctor.hospital === 'string') {
          hospitalId = editingDoctor.hospital;
        }
      }
      
      setFormData({
        firstName: editingDoctor.profile?.firstName || '',
        lastName: editingDoctor.profile?.lastName || '',
        email: editingDoctor.email || '',
        phone: editingDoctor.profile?.phone || '',
        dateOfBirth: editingDoctor.profile?.dateOfBirth ? new Date(editingDoctor.profile.dateOfBirth).toISOString().split('T')[0] : '',
        gender: editingDoctor.profile?.gender || '',
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
    
    try {
      const hospitalValue = formData.hospitalId === '' ? null : formData.hospitalId;
      
      const updateData = {
        profile: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone || '',
          dateOfBirth: formData.dateOfBirth || null,
          gender: formData.gender || ''
        },
        licenseNumber: formData.licenseNumber,
        specialization: formData.specialization,
        hospital: hospitalValue,
        isActive: formData.isActive
      };
      
      console.log('Sending update data:', updateData);
      
      const response = await api.put(`/admin/doctors/${editingDoctor._id}`, updateData);
      console.log('Update response:', response.data);
      
      // Call onSuccess to refresh the data
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
              <label><Mail size={12} /> Email Address</label>
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
          
          {/* Account Status */}
          <div className="form-section">
            <div className="form-section-header">
              <AlertCircle size={14} />
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
  );
};

export default EditDoctorModal;