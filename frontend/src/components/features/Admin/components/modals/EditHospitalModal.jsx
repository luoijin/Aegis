// frontend/src/components/features/Admin/components/modals/EditHospitalModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Building, Phone, Mail, MapPin, AlertCircle } from 'lucide-react';
import api from '../../../../../utils/api';
import './Modal.css';

const EditHospitalModal = ({ isOpen, onClose, editingHospital, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: {
      street: '',
      city: '',
      province: '',
      zipCode: '',
      country: 'Philippines'
    },
    phone: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Debug: Log when modal opens and what data it receives
  useEffect(() => {
    if (isOpen) {
      console.log('EditHospitalModal opened with editingHospital:', editingHospital);
    }
  }, [isOpen, editingHospital]);

  useEffect(() => {
    if (editingHospital && isOpen && editingHospital._id) {
      console.log('Setting form data for hospital:', editingHospital.name);
      
      let address = {
        street: '',
        city: '',
        province: '',
        zipCode: '',
        country: 'Philippines'
      };
      
      if (typeof editingHospital.address === 'string') {
        address.street = editingHospital.address;
      } else if (editingHospital.address && typeof editingHospital.address === 'object') {
        address = {
          street: editingHospital.address.street || '',
          city: editingHospital.address.city || '',
          province: editingHospital.address.province || editingHospital.address.state || '',
          zipCode: editingHospital.address.zipCode || '',
          country: editingHospital.address.country || 'Philippines'
        };
      }
      
      setFormData({
        name: editingHospital.name || '',
        address: address,
        phone: editingHospital.phone || '',
        email: editingHospital.email || ''
      });
    } else if (!isOpen) {
      // Reset form when modal closes
      setFormData({
        name: '',
        address: {
          street: '',
          city: '',
          province: '',
          zipCode: '',
          country: 'Philippines'
        },
        phone: '',
        email: ''
      });
      setError('');
    }
  }, [editingHospital, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (!formData.name.trim()) {
      setError('Hospital name is required');
      setLoading(false);
      return;
    }
    
    if (!editingHospital || !editingHospital._id) {
      setError('Hospital data is missing. Please try again.');
      setLoading(false);
      return;
    }
    
    try {
      console.log('Updating hospital:', editingHospital._id, formData);
      await api.put(`/admin/hospitals/${editingHospital._id}`, {
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
        email: formData.email
      });
      
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Update error:', err);
      setError(err.response?.data?.message || 'Failed to update hospital');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Show loading or error if no hospital data
  if (!editingHospital || !editingHospital._id) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3><Building size={18} /> Edit Hospital</h3>
            <button className="close-btn" onClick={onClose}><X size={18} /></button>
          </div>
          <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>
            <AlertCircle size={48} />
            <p>Hospital data not found. Please try again.</p>
            <button onClick={onClose} style={{ marginTop: '16px', padding: '8px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3><Building size={18} /> Edit Hospital: {formData.name || editingHospital?.name}</h3>
          <button className="close-btn" onClick={onClose}><X size={18} /></button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}
          
          <div className="form-group">
            <label><Building size={14} /> Hospital Name *</label>
            <input
              type="text"
              name="name"
              placeholder="Enter hospital name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-section">
            <div className="form-section-header">
              <MapPin size={14} />
              <span>Address Information</span>
            </div>
            
            <div className="form-group">
              <label>Street Address</label>
              <input
                type="text"
                name="address.street"
                placeholder="Street address"
                value={formData.address.street}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>City / Municipality</label>
                <input
                  type="text"
                  name="address.city"
                  placeholder="City or Municipality"
                  value={formData.address.city}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Province</label>
                <input
                  type="text"
                  name="address.province"
                  placeholder="Province"
                  value={formData.address.province}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Zip Code</label>
                <input
                  type="text"
                  name="address.zipCode"
                  placeholder="Zip code"
                  value={formData.address.zipCode}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Country</label>
                <input
                  type="text"
                  name="address.country"
                  value="Philippines"
                  disabled
                  className="disabled-input"
                />
              </div>
            </div>
          </div>
          
          <div className="form-section">
            <div className="form-section-header">
              <Phone size={14} />
              <span>Contact Information</span>
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
                <label><Mail size={12} /> Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="hospital@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
          
          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditHospitalModal;