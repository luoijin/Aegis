// frontend/src/components/features/Admin/components/modals/EditDoctorModal.jsx
import React, { useState, useEffect } from 'react';
import { X, AlertCircle, User, Phone, Mail, Stethoscope, Building, Award, CheckCircle } from 'lucide-react';
import api from '../../../../../utils/api';
import '../../../../../styles/modal.css';
import './Modal.css';

const EditDoctorModal = ({ isOpen, onClose, editingDoctor, specializations, hospitals, onSuccess }) => {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', 
    licenseNumber: '', specialization: '', hospitalId: '', isActive: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingDoctor) {
      setFormData({
        firstName: editingDoctor.profile?.firstName || '',
        lastName: editingDoctor.profile?.lastName || '',
        email: editingDoctor.email || '',
        phone: editingDoctor.profile?.phone || '',
        licenseNumber: editingDoctor.licenseNumber || '',
        specialization: editingDoctor.specialization || '',
        hospitalId: editingDoctor.hospital?._id || '',
        isActive: editingDoctor.isActive !== false
      });
    }
  }, [editingDoctor]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await api.put(`/admin/doctors/${editingDoctor._id}`, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        licenseNumber: formData.licenseNumber,
        specialization: formData.specialization,
        hospital: formData.hospitalId || null,
        isActive: formData.isActive
      });
      
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error updating doctor:', err);
      setError(err.response?.data?.message || 'Failed to update doctor');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !editingDoctor) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container modal-md" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit Doctor</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <div className="section-title">
                <User size={16} />
                <h4>Personal Information</h4>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="disabled-input"
                />
                <p className="field-note">Email cannot be changed</p>
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div className="form-divider"></div>

            <div className="form-section">
              <div className="section-title">
                <Stethoscope size={16} />
                <h4>Professional Information</h4>
              </div>

              <div className="form-group">
                <label>License Number</label>
                <input
                  type="text"
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                  placeholder="e.g., DOC-001"
                />
              </div>

              <div className="form-group">
                <label>Specialization</label>
                <select
                  value={formData.specialization}
                  onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                >
                  <option value="">Select Specialization</option>
                  {specializations?.filter(s => s.isActive !== false).map(spec => (
                    <option key={spec._id} value={spec.name}>{spec.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Hospital Affiliation</label>
                <select
                  value={formData.hospitalId}
                  onChange={(e) => setFormData({...formData, hospitalId: e.target.value})}
                >
                  <option value="">Select Hospital</option>
                  {hospitals?.map(h => (
                    <option key={h._id} value={h._id}>{h.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-divider"></div>

            <div className="form-section">
              <div className="section-title">
                <CheckCircle size={16} />
                <h4>Account Status</h4>
              </div>

              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={formData.isActive} 
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})} 
                />
                <span>Active Account</span>
              </label>
            </div>

            <div className="modal-actions">
              <button type="button" className="cancel-btn" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Saving...' : 'Update Doctor'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditDoctorModal;