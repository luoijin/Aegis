import React, { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../../../../../utils/api';
import './Modal.css';

const SpecializationModal = ({ isOpen, onClose, editingSpecialization, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '', description: '', isActive: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (editingSpecialization) {
      setFormData({
        name: editingSpecialization.name || '',
        description: editingSpecialization.description || '',
        isActive: editingSpecialization.isActive !== false
      });
    } else {
      setFormData({ name: '', description: '', isActive: true });
    }
    setShowWarning(false);
  }, [editingSpecialization]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');
    
    try {
      if (editingSpecialization) {
        // Check if name changed - show warning
        if (formData.name !== editingSpecialization.name && !showWarning) {
          setShowWarning(true);
          setLoading(false);
          return;
        }
        
        // Update specialization
        const response = await api.put(`/admin/specializations/${editingSpecialization._id}`, {
          name: formData.name,
          description: formData.description,
          isActive: formData.isActive
        });
        
        console.log('Specialization updated:', response.data);
        setSuccessMsg(`Specialization updated to "${formData.name}"`);
        
        // Wait a bit before closing to show success message
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } else {
        // Create new specialization
        const response = await api.post('/admin/specializations', {
          name: formData.name,
          description: formData.description,
          isActive: true
        });
        
        console.log('Specialization created:', response.data);
        setSuccessMsg(`Specialization "${formData.name}" created successfully`);
        
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      }
    } catch (err) {
      console.error('Error saving specialization:', err);
      setError(err.response?.data?.message || 'Failed to save specialization');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content small" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{editingSpecialization ? 'Edit Specialization' : 'Add New Specialization'}</h3>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              <AlertCircle size={16} /> {error}
            </div>
          )}
          
          {successMsg && (
            <div className="success-message">
              <CheckCircle size={16} /> {successMsg}
            </div>
          )}
          
          {showWarning && editingSpecialization && (
            <div className="warning-message">
              <AlertCircle size={16} />
              <div>
                <strong>Warning: Changing specialization name will affect all doctors using it.</strong>
                <p>This will update the specialization for all doctors currently assigned to "{editingSpecialization.name}".</p>
              </div>
            </div>
          )}
          
          <input 
            type="text" 
            placeholder="Specialization Name *" 
            value={formData.name} 
            onChange={(e) => setFormData({...formData, name: e.target.value})} 
            required 
          />
          
          <textarea 
            placeholder="Description (optional)" 
            value={formData.description} 
            onChange={(e) => setFormData({...formData, description: e.target.value})} 
            rows="3"
          />
          
          {editingSpecialization && (
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={formData.isActive} 
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})} 
              /> 
              Active
            </label>
          )}
          
          <div className="modal-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (editingSpecialization ? (showWarning ? 'Confirm Update' : 'Update') : 'Add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SpecializationModal;