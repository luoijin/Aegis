import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import api from '../../../../../utils/api';
import './Modal.css'; 

const DoctorModal = ({ isOpen, onClose, specializations, hospitals, onSuccess }) => {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', password: '', phone: '', 
    licenseNumber: '', specialization: '', hospitalId: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (!formData.password || formData.password.length < 6) {
      setError('Password must be at least 6 characters');
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
          phone: formData.phone
        },
        licenseNumber: formData.licenseNumber,
        specialization: formData.specialization,
        hospital: formData.hospitalId || null
      });
      
      if (response.data) {
        onSuccess();
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create doctor');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content doctor-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Create New Doctor Account</h3>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message"><AlertCircle size={16} /> {error}</div>}
          <div className="form-row">
            <input 
              type="text" 
              placeholder="First Name *" 
              value={formData.firstName} 
              onChange={(e) => setFormData({...formData, firstName: e.target.value})} 
              required 
            />
            <input 
              type="text" 
              placeholder="Last Name *" 
              value={formData.lastName} 
              onChange={(e) => setFormData({...formData, lastName: e.target.value})} 
              required 
            />
          </div>
          <input 
            type="email" 
            placeholder="Email *" 
            value={formData.email} 
            onChange={(e) => setFormData({...formData, email: e.target.value})} 
            required 
          />
          <input 
            type="password" 
            placeholder="Password * (min 6 characters)" 
            value={formData.password} 
            onChange={(e) => setFormData({...formData, password: e.target.value})} 
            required 
            minLength="6"
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
          <select 
            value={formData.specialization} 
            onChange={(e) => setFormData({...formData, specialization: e.target.value})} 
            required
          >
            <option value="">Select Specialization *</option>
            {specializations?.map(spec => (
              <option key={spec._id} value={spec.name}>{spec.name}</option>
            ))}
          </select>
          <select 
            value={formData.hospitalId} 
            onChange={(e) => setFormData({...formData, hospitalId: e.target.value})}
          >
            <option value="">Select Hospital</option>
            {hospitals?.map(h => (
              <option key={h._id} value={h._id}>{h.name}</option>
            ))}
          </select>
          <div className="info-note"><AlertCircle size={14} /> Doctor will use this email and password to log in.</div>
          <div className="modal-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Doctor'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DoctorModal;