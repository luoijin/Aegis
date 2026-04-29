import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import api from '../../../../../utils/api';
import './Modal.css'; 

const HospitalModal = ({ isOpen, onClose, editingHospital, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '', address: '', city: '', pincode: '', phone: '', email: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingHospital) {
      setFormData({
        name: editingHospital.name || '',
        address: editingHospital.address || '',
        city: editingHospital.city || '',
        pincode: editingHospital.pincode || '',
        phone: editingHospital.phone || '',
        email: editingHospital.email || ''
      });
    } else {
      setFormData({ name: '', address: '', city: '', pincode: '', phone: '', email: '' });
    }
  }, [editingHospital]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (editingHospital) {
        await api.put(`/admin/hospitals/${editingHospital._id}`, formData);
      } else {
        await api.post('/admin/hospitals', formData);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save hospital');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{editingHospital ? 'Edit Hospital' : 'Add New Hospital'}</h3>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message"><AlertCircle size={16} /> {error}</div>}
          <input 
            type="text" 
            placeholder="Hospital Name *" 
            value={formData.name} 
            onChange={(e) => setFormData({...formData, name: e.target.value})} 
            required 
          />
          <input 
            type="text" 
            placeholder="Address" 
            value={formData.address} 
            onChange={(e) => setFormData({...formData, address: e.target.value})} 
          />
          <input 
            type="text" 
            placeholder="City" 
            value={formData.city} 
            onChange={(e) => setFormData({...formData, city: e.target.value})} 
          />
          <input 
            type="text" 
            placeholder="Pincode" 
            value={formData.pincode} 
            onChange={(e) => setFormData({...formData, pincode: e.target.value})} 
          />
          <input 
            type="tel" 
            placeholder="Phone" 
            value={formData.phone} 
            onChange={(e) => setFormData({...formData, phone: e.target.value})} 
          />
          <input 
            type="email" 
            placeholder="Email" 
            value={formData.email} 
            onChange={(e) => setFormData({...formData, email: e.target.value})} 
          />
          <div className="modal-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={loading}>{loading ? 'Saving...' : (editingHospital ? 'Update' : 'Add')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HospitalModal;