import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import api from '../../../../../utils/api';
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
      const response = await api.put(`/admin/doctors/${editingDoctor._id}`, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        licenseNumber: formData.licenseNumber,
        specialization: formData.specialization,  // This is the specialization name
        hospital: formData.hospitalId || null,
        isActive: formData.isActive
      });
      
      console.log('Doctor updated:', response.data);
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
      <div className="modal-content doctor-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit Doctor: Dr. {editingDoctor.profile?.firstName} {editingDoctor.profile?.lastName}</h3>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message"><AlertCircle size={16} /> {error}</div>}
          <div className="form-row">
            <input 
              type="text" 
              placeholder="First Name" 
              value={formData.firstName} 
              onChange={(e) => setFormData({...formData, firstName: e.target.value})} 
              required 
            />
            <input 
              type="text" 
              placeholder="Last Name" 
              value={formData.lastName} 
              onChange={(e) => setFormData({...formData, lastName: e.target.value})} 
              required 
            />
          </div>
          <input 
            type="email" 
            placeholder="Email" 
            value={formData.email} 
            disabled 
            className="disabled-input"
          />
          <input 
            type="tel" 
            placeholder="Phone" 
            value={formData.phone} 
            onChange={(e) => setFormData({...formData, phone: e.target.value})} 
          />
          <input 
            type="text" 
            placeholder="License Number" 
            value={formData.licenseNumber} 
            onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})} 
          />
    `        <select 
            value={formData.specialization} 
            onChange={(e) => setFormData({...formData, specialization: e.target.value})}
            >
            <option value="">None (No Specialization)</option>
            {specializations?.filter(s => s.isActive !== false).map(spec => (
                <option key={spec._id} value={spec.name}>{spec.name}</option>
            ))}
            </select>`
          <select 
            value={formData.hospitalId} 
            onChange={(e) => setFormData({...formData, hospitalId: e.target.value})}
          >
            <option value="">Select Hospital</option>
            {hospitals?.map(h => (
              <option key={h._id} value={h._id}>{h.name}</option>
            ))}
          </select>
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              checked={formData.isActive} 
              onChange={(e) => setFormData({...formData, isActive: e.target.checked})} 
            /> 
            Active Account
          </label>
          <div className="info-note"><AlertCircle size={14} /> Email cannot be changed.</div>
          <div className="modal-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Update Doctor'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDoctorModal;