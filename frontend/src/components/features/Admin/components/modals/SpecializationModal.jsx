// frontend/src/components/features/Admin/components/modals/SpecializationModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Award, AlertCircle } from 'lucide-react';
import api from '../../../../../utils/api';
import './Modal.css';

const SpecializationModal = ({ isOpen, onClose, editingSpecialization, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isEditing = !!editingSpecialization;

  useEffect(() => {
    if (editingSpecialization && isOpen) {
      setFormData({
        name: editingSpecialization.name || '',
        description: editingSpecialization.description || ''
      });
    } else if (!isOpen) {
      setFormData({ name: '', description: '' });
      setError('');
    }
  }, [editingSpecialization, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (!formData.name.trim()) {
      setError('Specialization name is required');
      setLoading(false);
      return;
    }
    
    try {
      if (isEditing) {
        // Only update name and description - status is automatic based on doctor count
        await api.put(`/admin/specializations/${editingSpecialization._id}`, {
          name: formData.name,
          description: formData.description
          // Note: isActive is NOT included - status is determined by doctor count
        });
      } else {
        await api.post('/admin/specializations', {
          name: formData.name,
          description: formData.description
        });
      }
      
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} specialization`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3><Award size={18} /> {isEditing ? 'Edit Specialization' : 'Add New Specialization'}</h3>
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
            <label>Specialization Name *</label>
            <input
              type="text"
              name="name"
              placeholder="e.g., Cardiology, Neurology, Pediatrics"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              placeholder="Brief description of this specialization"
              value={formData.description}
              onChange={handleChange}
              rows="3"
            />
          </div>
          
          {isEditing && (
            <div className="info-note">
              <AlertCircle size={14} />
              <span>
                Specialization status is automatically determined by the number of doctors assigned. 
                It will be <strong>Active</strong> if at least one doctor has this specialization, 
                otherwise <strong>Inactive</strong>.
              </span>
            </div>
          )}
          
          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (isEditing ? 'Saving...' : 'Creating...') : (isEditing ? 'Save Changes' : 'Create Specialization')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SpecializationModal;