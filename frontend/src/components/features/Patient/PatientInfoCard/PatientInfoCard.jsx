// frontend/src/components/features/Patient/PatientInfoCard/PatientInfoCard.jsx

import React, { useState, useEffect } from 'react';
import { User, Stethoscope, Droplet, Phone, Mail, Building, BriefcaseMedical, Calendar, Heart, AlertCircle, Edit2, Save, X, UserCircle, CheckCircle, WifiOff } from 'lucide-react';
import { confirmDialog } from '../../../../utils/confirmDialog';
import api from '../../../../services/api';
import './PatientInfoCard.css';

export const PatientInfoCard = ({ patient, doctor, user, onRefresh }) => {
  const [patientData, setPatientData] = useState(patient);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    }
  });

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  useEffect(() => {
    if (patient) {
      setPatientData(patient);
      setFormData({
        firstName: patient?.user?.profile?.firstName || user?.profile?.firstName || '',
        lastName: patient?.user?.profile?.lastName || user?.profile?.lastName || '',
        phone: patient?.user?.profile?.phone || user?.profile?.phone || '',
        dateOfBirth: patient?.user?.profile?.dateOfBirth ? new Date(patient.user.profile.dateOfBirth).toISOString().split('T')[0] : '',
        gender: patient?.user?.profile?.gender || user?.profile?.gender || '',
        emergencyContact: {
          name: patient?.emergencyContact?.name || '',
          relationship: patient?.emergencyContact?.relationship || '',
          phone: patient?.emergencyContact?.phone || ''
        }
      });
    }
  }, [patient, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('emergency_')) {
      const field = name.replace('emergency_', '');
      setFormData(prev => ({
        ...prev,
        emergencyContact: {
          ...prev.emergencyContact,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isOffline) {
      showNotification('You are offline. Cannot update profile.', 'error');
      return;
    }
    const confirmed = await confirmDialog(
      'Save Changes',
      'Are you sure you want to update your profile information?',
      'info',
      'Yes, Save',
      'Cancel'
    );
    if (!confirmed) return;
    
    setIsSaving(true);
    try {
      await api.put('/patient/profile', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        emergencyContact: formData.emergencyContact
      });
      setIsEditing(false);
      showNotification('Profile updated successfully!', 'success');
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error updating profile:', error);
      showNotification(error.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const diff = Date.now() - birthDate.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const formatDate = (date) => {
    if (!date) return 'Not provided';
    return new Date(date).toLocaleDateString();
  };

  const age = calculateAge(patientData?.user?.profile?.dateOfBirth || user?.profile?.dateOfBirth);
  const currentUser = patientData?.user || user;
  const currentDoctor = patientData?.assignedDoctor || doctor;
  const currentPatient = patientData || patient;

  if (loading) {
    return (
      <div className="patient-info-card">
        <div className="card-header">
          <h3>Your Information</h3>
        </div>
        <div className="loading-state">Loading your information...</div>
      </div>
    );
  }

  return (
    <div className="patient-info-card">
      {notification.show && (
        <div className={`patient-toast ${notification.type}`}>
          {notification.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{notification.message}</span>
        </div>
      )}

      {isOffline && (
        <div className="offline-banner-card">
          <WifiOff size={14} />
          <span>Offline – Profile editing disabled</span>
        </div>
      )}

      <div className="card-header">
        <h3><UserCircle size={16} /> Your Information</h3>
        {!isEditing && (
          <button className="edit-btn" onClick={() => setIsEditing(true)} disabled={isOffline}>
            <Edit2 size={14} /> Edit Profile
          </button>
        )}
      </div>

      {isEditing ? (
        <form className="edit-form" onSubmit={handleSubmit}>
          <div className="edit-form-grid">
            <div className="form-section">
              <h4><UserCircle size={16} /> Personal Information</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} required disabled={isOffline} />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} required disabled={isOffline} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} disabled={isOffline} />
                </div>
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} disabled={isOffline} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleInputChange} disabled={isOffline}>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h4><AlertCircle size={16} /> Emergency Contact</h4>
              <div className="form-group">
                <label>Contact Name</label>
                <input type="text" name="emergency_name" value={formData.emergencyContact.name} onChange={handleInputChange} disabled={isOffline} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Relationship</label>
                  <input type="text" name="emergency_relationship" value={formData.emergencyContact.relationship} onChange={handleInputChange} disabled={isOffline} />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="tel" name="emergency_phone" value={formData.emergencyContact.phone} onChange={handleInputChange} disabled={isOffline} />
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)} disabled={isSaving}>
              <X size={16} /> Cancel
            </button>
            <button type="submit" className="save-btn" disabled={isSaving || isOffline}>
              <Save size={16} /> {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      ) : (
        <div className="info-grid-container">
          <div className="demographics-section">
            <div className="demographics-wrapper">
              <div className="demographics-column">
                <div className="demographics-subheader"><span>Personal Information</span></div>
                <div className="demographic-item"><span className="demographic-label">Full Name</span><span className="demographic-value">{currentUser?.profile?.firstName} {currentUser?.profile?.lastName}</span></div>
                <div className="demographic-item"><span className="demographic-label">Date of Birth</span><span className="demographic-value">{formatDate(currentUser?.profile?.dateOfBirth)}</span></div>
                <div className="demographic-item"><span className="demographic-label">Age</span><span className="demographic-value">{age ? `${age} years` : 'Not set'}</span></div>
                <div className="demographic-item"><span className="demographic-label">Gender</span><span className="demographic-value">{currentUser?.profile?.gender || 'Not specified'}</span></div>
              </div>
              <div className="demographics-column">
                <div className="demographics-subheader"><span>Medical Information</span></div>
                <div className="demographic-item"><span className="demographic-label">Blood Type</span><span className="demographic-value">{currentPatient?.bloodType && currentPatient.bloodType !== '' ? currentPatient.bloodType : 'Not specified'}</span></div>
                <div className="demographic-item"><span className="demographic-label">Phone Number</span><span className="demographic-value">{currentUser?.profile?.phone || 'Not provided'}</span></div>
                <div className="demographic-item"><span className="demographic-label">Email Address</span><span className="demographic-value">{currentUser?.email}</span></div>
              </div>
            </div>
            <div className="emergency-contact-section">
              <div className="emergency-header"><span>Emergency Contact</span></div>
              <div className="emergency-grid">
                <div className="emergency-item"><span className="emergency-label">Name</span><span className="emergency-value">{currentPatient?.emergencyContact?.name || 'Not provided'}</span></div>
                <div className="emergency-item"><span className="emergency-label">Relationship</span><span className="emergency-value">{currentPatient?.emergencyContact?.relationship || 'Not specified'}</span></div>
                <div className="emergency-item"><span className="emergency-label">Phone Number</span><span className="emergency-value">{currentPatient?.emergencyContact?.phone || 'Not provided'}</span></div>
              </div>
            </div>
          </div>

          <div className="doctor-section">
            <div className="doctor-info-header"><span>Primary Care Physician</span></div>
            {currentDoctor ? (
              <div className="doctor-info-grid">
                <div className="doctor-info-item"><span className="doctor-info-label">Name</span><span className="doctor-info-value">Dr. {currentDoctor?.profile?.firstName} {currentDoctor?.profile?.lastName}</span></div>
                <div className="doctor-info-item"><span className="doctor-info-label">Specialization</span><span className="doctor-info-value">{currentDoctor?.specialization || 'General Medicine'}</span></div>
                <div className="doctor-info-item"><span className="doctor-info-label">Email</span><span className="doctor-info-value"><Mail size={12} /> {currentDoctor?.email}</span></div>
                {currentDoctor?.hospital && <div className="doctor-info-item"><span className="doctor-info-label">Hospital</span><span className="doctor-info-value"><Building size={12} /> {currentDoctor.hospital.name}</span></div>}
              </div>
            ) : (
              <div className="no-doctor"><Stethoscope size={32} /><p>No doctor assigned yet</p><span>Your primary care physician will appear here</span></div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};