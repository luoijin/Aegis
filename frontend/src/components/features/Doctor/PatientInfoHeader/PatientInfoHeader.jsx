// frontend/src/components/features/Doctor/PatientInfoHeader/PatientInfoHeader.jsx

import React, { useState } from 'react';
import { Droplet, Check, X, FileText, Mail, Phone, Calendar, User, WifiOff } from 'lucide-react';
import { confirmDialog } from '../../../../utils/confirmDialog';
import api from '../../../../services/api';
import './PatientInfoHeader.css';

export const PatientInfoHeader = ({ patient, onRecordVitals, onPatientUpdate, onViewChart, isOffline = false }) => {
  const [isEditingBloodType, setIsEditingBloodType] = useState(false);
  const [selectedBloodType, setSelectedBloodType] = useState(patient?.bloodType || '');
  const [updating, setUpdating] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''];

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  const handleUpdateBloodType = async () => {
    if (isOffline) {
      showNotification('You are offline. Cannot update blood type.', 'error');
      return;
    }
    const confirmed = await confirmDialog(
      'Update Blood Type',
      `Are you sure you want to change blood type to ${selectedBloodType || 'Not specified'}?`,
      'info',
      'Yes, Update',
      'Cancel'
    );
    
    if (confirmed) {
      setUpdating(true);
      try {
        await api.put(`/patient/${patient._id}/blood-type`, { bloodType: selectedBloodType });
        setIsEditingBloodType(false);
        showNotification('Blood type updated successfully!', 'success');
        if (onPatientUpdate) onPatientUpdate();
      } catch (error) {
        console.error('Error updating blood type:', error);
        showNotification(error.response?.data?.message || 'Failed to update blood type', 'error');
      } finally {
        setUpdating(false);
      }
    }
  };

  const handleCancel = () => {
    setSelectedBloodType(patient?.bloodType || '');
    setIsEditingBloodType(false);
  };

  const bloodTypeDisplay = patient?.bloodType && patient.bloodType !== '' ? patient.bloodType : 'Not specified';

  const userProfile = patient?.user?.profile || {};
  const patientName = `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim() || 'Unknown Patient';

  return (
    <>
      {/* Notification Toast – no animation */}
      {notification.show && (
        <div className={`patient-info-toast ${notification.type}`}>
          {notification.type === 'success' ? '✓' : '✗'} {notification.message}
        </div>
      )}

      {isOffline && (
        <div className="offline-banner-header">
          <WifiOff size={14} />
          <span>Offline – blood type editing disabled</span>
        </div>
      )}

      <div className="patient-info-header">
        <div className="patient-details">
          <h2>{patientName}</h2>
          <p>{patient.user?.email}</p>
          
          <div className="blood-type-section">
            <div className="blood-type-label">
              <Droplet size={14} />
              <span>Blood Type</span>
            </div>
            
            {isEditingBloodType ? (
              <div className="blood-type-edit">
                <select
                  value={selectedBloodType}
                  onChange={(e) => setSelectedBloodType(e.target.value)}
                  className="blood-type-select"
                  disabled={updating || isOffline}
                >
                  <option value="">Not specified</option>
                  {bloodTypes.filter(bt => bt !== '').map(bt => (
                    <option key={bt} value={bt}>{bt}</option>
                  ))}
                </select>
                <button className="blood-type-action save" onClick={handleUpdateBloodType} disabled={updating || isOffline}>
                  <Check size={14} />
                </button>
                <button className="blood-type-action cancel" onClick={handleCancel} disabled={updating}>
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="blood-type-display">
                <span className="blood-type-value">{bloodTypeDisplay}</span>
                <button className="edit-blood-type-btn" onClick={() => setIsEditingBloodType(true)} disabled={isOffline}>
                  Edit
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="patient-header-buttons">
          <button className="view-chart-btn" onClick={onViewChart} disabled={isOffline}>
            <FileText size={16} /> View Full Chart
          </button>
          <button className="record-vitals-btn" onClick={onRecordVitals} disabled={isOffline}>
            + Record Vitals
          </button>
        </div>
      </div>
    </>
  );
};