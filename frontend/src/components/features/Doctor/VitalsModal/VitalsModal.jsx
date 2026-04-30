import React, { useState } from 'react';
import { VitalsForm } from './VitalsForm';
import api from '../../../../services/api';
import './VitalsModal.css';

export const VitalsModal = ({ patient, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [vitals, setVitals] = useState({
    heartRate: '',
    systolicBP: '',
    diastolicBP: '',
    temperature: '',
    oxygenSaturation: '',
    notes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await api.post('/health-logs', {
        patient: patient._id,
        vitals: {
          heartRate: parseInt(vitals.heartRate),
          bloodPressure: {
            systolic: parseInt(vitals.systolicBP),
            diastolic: parseInt(vitals.diastolicBP)
          },
          temperature: vitals.temperature ? parseFloat(vitals.temperature) : null,
          oxygenSaturation: vitals.oxygenSaturation ? parseInt(vitals.oxygenSaturation) : null
        },
        notes: vitals.notes
      });
      
      onSuccess();
      onClose(); // Close modal after success
    } catch (error) {
      console.error('Error recording vitals:', error);
      alert(error.response?.data?.message || 'Failed to record vitals');
    } finally {
      setLoading(false);
    }
  };

  const firstName = patient.user?.profile?.firstName || '';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Record Vitals for {firstName}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <VitalsForm 
          vitals={vitals}
          setVitals={setVitals}
          onSubmit={handleSubmit}
          loading={loading}
          onCancel={onClose}  // ← Pass onClose as onCancel
        />
      </div>
    </div>
  );
};