// frontend/src/components/features/Doctor/VitalsModal/VitalsModal.jsx
import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../../../../services/api';
import '../../../../styles/doctor-modal.css';
import './VitalsModal.css';

export const VitalsModal = ({ patient, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
    setError('');
    setSuccess('');
    
    try {
      await api.post(`/doctor/patients/${patient._id}/health-logs`, {
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
      
      setSuccess('Vitals recorded successfully!');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record vitals');
    } finally {
      setLoading(false);
    }
  };

  const firstName = patient.user?.profile?.firstName || '';

  return (
    <div className="doctor-modal-overlay" onClick={onClose}>
      <div className="doctor-modal-container doctor-modal-md" onClick={(e) => e.stopPropagation()}>
        <div className="doctor-modal-header">
          <h3>Record Vitals - {firstName}</h3>
          <button className="doctor-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form className="doctor-modal-form" onSubmit={handleSubmit}>
          {error && (
            <div className="vitals-error-message">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
          
          {success && (
            <div className="vitals-success-message">
              <CheckCircle size={16} />
              <span>{success}</span>
            </div>
          )}

          <div className="doctor-form-row">
            <div className="doctor-form-group">
              <label>Heart Rate <span className="doctor-required">*</span></label>
              <input
                type="number"
                value={vitals.heartRate}
                onChange={(e) => setVitals({...vitals, heartRate: e.target.value})}
                placeholder="60-100"
                required
              />
              <span className="doctor-field-hint">bpm</span>
            </div>
            <div className="doctor-form-group">
              <label>Systolic BP <span className="doctor-required">*</span></label>
              <input
                type="number"
                value={vitals.systolicBP}
                onChange={(e) => setVitals({...vitals, systolicBP: e.target.value})}
                placeholder="120"
                required
              />
              <span className="doctor-field-hint">mmHg</span>
            </div>
            <div className="doctor-form-group">
              <label>Diastolic BP <span className="doctor-required">*</span></label>
              <input
                type="number"
                value={vitals.diastolicBP}
                onChange={(e) => setVitals({...vitals, diastolicBP: e.target.value})}
                placeholder="80"
                required
              />
              <span className="doctor-field-hint">mmHg</span>
            </div>
          </div>

          <div className="doctor-form-row-2">
            <div className="doctor-form-group">
              <label>Temperature</label>
              <input
                type="number"
                step="0.1"
                value={vitals.temperature}
                onChange={(e) => setVitals({...vitals, temperature: e.target.value})}
                placeholder="36.5"
              />
              <span className="doctor-field-hint">°C</span>
            </div>
            <div className="doctor-form-group">
              <label>O₂ Saturation</label>
              <input
                type="number"
                value={vitals.oxygenSaturation}
                onChange={(e) => setVitals({...vitals, oxygenSaturation: e.target.value})}
                placeholder="95-100"
              />
              <span className="doctor-field-hint">%</span>
            </div>
          </div>

          <div className="doctor-form-group">
            <label>Clinical Notes</label>
            <textarea
              value={vitals.notes}
              onChange={(e) => setVitals({...vitals, notes: e.target.value})}
              rows="3"
              placeholder="Enter your clinical observations..."
            />
          </div>

          <div className="doctor-modal-actions">
            <button type="button" className="doctor-cancel-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="doctor-submit-btn" disabled={loading}>
              {loading ? 'Recording...' : 'Save Vitals'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};