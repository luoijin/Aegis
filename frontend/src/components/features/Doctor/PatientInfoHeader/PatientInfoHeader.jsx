// frontend/src/components/features/Doctor/PatientInfoHeader/PatientInfoHeader.jsx
import React, { useState } from 'react';
import { Droplet, Check, X } from 'lucide-react';
import api from '../../../../services/api';
import './PatientInfoHeader.css';

export const PatientInfoHeader = ({ patient, onRecordVitals, onPatientUpdate }) => {
  const [isEditingBloodType, setIsEditingBloodType] = useState(false);
  const [selectedBloodType, setSelectedBloodType] = useState(patient?.bloodType || '');
  const [updating, setUpdating] = useState(false);

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''];

  const handleUpdateBloodType = async () => {
    setUpdating(true);
    try {
      // Use the existing update endpoint (this already exists in your routes)
      await api.put(`/patient/${patient._id}/blood-type`, { bloodType: selectedBloodType });
      setIsEditingBloodType(false);
      if (onPatientUpdate) onPatientUpdate();
    } catch (error) {
      console.error('Error updating blood type:', error);
      alert(error.response?.data?.message || 'Failed to update blood type');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    setSelectedBloodType(patient?.bloodType || '');
    setIsEditingBloodType(false);
  };

  const bloodTypeDisplay = patient?.bloodType && patient.bloodType !== '' ? patient.bloodType : 'Not specified';

  return (
    <div className="patient-info-header">
      <div className="patient-details">
        <h2>{patient.user?.profile?.firstName} {patient.user?.profile?.lastName}</h2>
        <p>{patient.user?.email}</p>
        
        {/* Blood Type Section */}
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
                disabled={updating}
              >
                <option value="">Not specified</option>
                {bloodTypes.filter(bt => bt !== '').map(bt => (
                  <option key={bt} value={bt}>{bt}</option>
                ))}
              </select>
              <button 
                className="blood-type-action save" 
                onClick={handleUpdateBloodType}
                disabled={updating}
              >
                <Check size={14} />
              </button>
              <button 
                className="blood-type-action cancel" 
                onClick={handleCancel}
                disabled={updating}
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="blood-type-display">
              <span className="blood-type-value">{bloodTypeDisplay}</span>
              <button 
                className="edit-blood-type-btn"
                onClick={() => setIsEditingBloodType(true)}
              >
                Edit
              </button>
            </div>
          )}
        </div>
      </div>
      
      <button className="record-vitals-btn" onClick={onRecordVitals}>
        + Record Vitals
      </button>
    </div>
  );
};