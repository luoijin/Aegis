// frontend/src/components/features/Admin/components/modals/PatientModal.jsx
import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Droplet, Stethoscope, AlertCircle, Calendar } from 'lucide-react';
import api from '../../../../../utils/api';
import './Modal.css';

const PatientModal = ({ isOpen, onClose, editingPatient, doctors, onSuccess }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    bloodType: '',
    assignedDoctor: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isEditing = !!editingPatient;

  useEffect(() => {
    if (editingPatient && isOpen) {
      console.log('Editing patient data:', editingPatient);
      
      // Safely extract data from the patient object
      const userData = editingPatient.user || {};
      const userProfile = userData.profile || {};
      
      setFormData({
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        email: userData.email || '',
        password: '',
        phone: userProfile.phone || '',
        dateOfBirth: userProfile.dateOfBirth ? new Date(userProfile.dateOfBirth).toISOString().split('T')[0] : '',
        gender: userProfile.gender || '',
        bloodType: editingPatient.bloodType || '',
        assignedDoctor: editingPatient.assignedDoctor?._id || editingPatient.assignedDoctor || ''
      });
    } else if (!isOpen) {
      setFormData({
        firstName: '', lastName: '', email: '', password: '', phone: '', 
        dateOfBirth: '', gender: '', bloodType: '', assignedDoctor: ''
      });
      setError('');
    }
  }, [editingPatient, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Validation
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('First name and last name are required');
      setLoading(false);
      return;
    }
    
    if (!isEditing && (!formData.email.trim() || !formData.password)) {
      setError('Email and password are required for new patients');
      setLoading(false);
      return;
    }
    
    try {
      if (isEditing) {
        // Update existing patient
        const updateData = {
          profile: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone || '',
            dateOfBirth: formData.dateOfBirth || null,
            gender: formData.gender || ''
          },
          bloodType: formData.bloodType || '',
          assignedDoctor: formData.assignedDoctor || null
        };
        
        console.log('Sending update data:', updateData);
        
        const response = await api.put(`/admin/patients/${editingPatient._id}`, updateData);
        console.log('Update response:', response.data);
        
        onSuccess();
        onClose();
      } else {
        // Create new patient
        const registerResponse = await api.post('/auth/register', {
          email: formData.email,
          password: formData.password,
          role: 'patient',
          profile: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone || '',
            dateOfBirth: formData.dateOfBirth || null,
            gender: formData.gender || ''
          }
        });
        
        // After creating user, assign doctor if specified
        if (formData.assignedDoctor) {
          // Get the newly created patient
          const patientsRes = await api.get('/admin/patients');
          const newPatient = patientsRes.data.find(p => p.user?.email === formData.email);
          if (newPatient) {
            await api.post(`/patients/${newPatient._id}/assign`, { doctorId: formData.assignedDoctor });
          }
        }
        
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} patient`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3><User size={18} /> {isEditing ? 'Edit Patient' : 'Add New Patient'}</h3>
          <button className="close-btn" onClick={onClose}><X size={18} /></button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}
          
          <div className="form-row">
            <div className="form-group">
              <label>First Name *</label>
              <input
                type="text"
                name="firstName"
                placeholder="First name"
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
                placeholder="Last name"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          {!isEditing ? (
            <>
              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  placeholder="patient@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength="6"
                />
                <small>Patient will use this password to log in</small>
              </div>
            </>
          ) : (
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
          )}
          
          <div className="form-row">
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                placeholder="Contact number"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Date of Birth</label>
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
            {/* <div className="form-group">
              <label>Blood Type</label>
              <select name="bloodType" value={formData.bloodType} onChange={handleChange}>
                <option value="">Not specified</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div> */}
          </div>
          
          <div className="form-group">
            <label><Stethoscope size={12} /> Assign Doctor</label>
            <select name="assignedDoctor" value={formData.assignedDoctor} onChange={handleChange}>
              <option value="">— No Doctor Assigned —</option>
              {doctors?.filter(d => d.isActive).map(doc => (
                <option key={doc._id} value={doc._id}>
                  Dr. {doc.profile?.firstName} {doc.profile?.lastName} - {doc.specialization || 'General'}
                </option>
              ))}
            </select>
          </div>
          
          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (isEditing ? 'Saving...' : 'Creating...') : (isEditing ? 'Save Changes' : 'Create Patient')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientModal;