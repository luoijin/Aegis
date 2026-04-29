import React, { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../../../../../utils/api';
import './Modal.css';

const PatientModal = ({ isOpen, onClose, editingPatient, doctors, onSuccess }) => {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', password: '', assignedDoctor: ''
  });
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Get unique specializations from doctors
  const specializationsList = [...new Set(doctors.map(d => d.specialization).filter(s => s && s !== ''))];

  // Filter doctors when specialization changes
  useEffect(() => {
    if (selectedSpecialization) {
      setFilteredDoctors(doctors.filter(d => d.specialization === selectedSpecialization && d.isActive !== false));
    } else {
      setFilteredDoctors([]);
    }
  }, [selectedSpecialization, doctors]);

  useEffect(() => {
    if (editingPatient) {
      setFormData({
        firstName: editingPatient.user?.profile?.firstName || '',
        lastName: editingPatient.user?.profile?.lastName || '',
        email: editingPatient.user?.email || '',
        phone: editingPatient.user?.profile?.phone || '',
        password: '',
        assignedDoctor: editingPatient.assignedDoctor?._id || ''
      });
      // Pre-select specialization if doctor is assigned
      if (editingPatient.assignedDoctor?._id) {
        const assignedDoc = doctors.find(d => d._id === editingPatient.assignedDoctor?._id);
        if (assignedDoc) {
          setSelectedSpecialization(assignedDoc.specialization || '');
        }
      }
    } else {
      setFormData({ firstName: '', lastName: '', email: '', phone: '', password: '', assignedDoctor: '' });
      setSelectedSpecialization('');
    }
  }, [editingPatient, doctors]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');
    
    if (!editingPatient && (!formData.password || formData.password.length < 6)) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }
    
    try {
      if (editingPatient) {
        await api.put(`/admin/patients/${editingPatient._id}`, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          assignedDoctor: formData.assignedDoctor || null
        });
        setSuccessMsg('Patient updated successfully');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } else {
        const userRes = await api.post('/auth/register', {
          email: formData.email,
          password: formData.password,
          role: 'patient',
          profile: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone || '1234567890'
          }
        });
        
        const userId = userRes.data.user?.id || userRes.data.user?._id;
        
        if (!userId) {
          throw new Error('User registration failed - no user ID returned');
        }
        
        if (formData.assignedDoctor) {
          const patientsRes = await api.get('/patients');
          const patient = patientsRes.data.find(p => p.user?._id === userId);
          
          if (patient) {
            await api.put(`/admin/patients/${patient._id}`, {
              assignedDoctor: formData.assignedDoctor
            });
          }
        }
        
        setSuccessMsg(`Patient ${formData.firstName} ${formData.lastName} created successfully!`);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      }
    } catch (err) {
      console.error('Save patient error:', err);
      setError(err.response?.data?.message || 'Failed to save patient');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError('');
    setSuccessMsg('');
    setSelectedSpecialization('');
    setFormData({ firstName: '', lastName: '', email: '', phone: '', password: '', assignedDoctor: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{editingPatient ? 'Edit Patient' : 'Add New Patient'}</h3>
          <button className="close-btn" onClick={handleClose}><X size={20} /></button>
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
          
          {!editingPatient && (
            <input 
              type="password" 
              placeholder="Password * (min 6 characters)" 
              value={formData.password} 
              onChange={(e) => setFormData({...formData, password: e.target.value})} 
              required 
              minLength="6"
            />
          )}
          
          <input 
            type="tel" 
            placeholder="Phone" 
            value={formData.phone} 
            onChange={(e) => setFormData({...formData, phone: e.target.value})} 
          />
          
          {/* Specialization Dropdown */}
          <select 
            value={selectedSpecialization} 
            onChange={(e) => {
              setSelectedSpecialization(e.target.value);
              setFormData({...formData, assignedDoctor: ''});
            }}
          >
            <option value="">Select Specialization First</option>
            {specializationsList.map(spec => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
          
          {/* Doctor Dropdown - Filtered by Specialization */}
          <select 
            value={formData.assignedDoctor} 
            onChange={(e) => setFormData({...formData, assignedDoctor: e.target.value})}
            disabled={!selectedSpecialization}
          >
            <option value="">
              {selectedSpecialization ? 'Select Doctor' : 'Please select specialization first'}
            </option>
            {filteredDoctors.map(doc => (
              <option key={doc._id} value={doc._id}>
                Dr. {doc.profile?.firstName} {doc.profile?.lastName}
              </option>
            ))}
          </select>
          
          {!editingPatient && (
            <div className="info-note">
              <AlertCircle size={14} />
              <span>The patient can log in with the email and password you set.</span>
            </div>
          )}
          
          <div className="modal-actions">
            <button type="button" onClick={handleClose}>Cancel</button>
            <button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (editingPatient ? 'Update Patient' : 'Create Patient')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientModal;