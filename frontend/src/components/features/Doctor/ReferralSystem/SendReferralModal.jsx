// frontend/src/components/features/Doctor/ReferralSystem/SendReferralModal.jsx

import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import './SendReferralModal.css';

export const SendReferralModal = ({ patients, doctors, onClose, onSend, isOffline = false }) => {
  const [formData, setFormData] = useState({
    patientId: '',
    toDoctorId: '',
    reason: '',
    priority: 'normal',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isOffline) {
      setError('You are offline. Cannot send referral.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onSend(formData);
      onClose(); // close modal on success
    } catch (err) {
      setError(err.message || 'Failed to send referral');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="doctor-modal-overlay" onClick={onClose}>
      <div className="doctor-modal-container doctor-modal-md" onClick={(e) => e.stopPropagation()}>
        <div className="doctor-modal-header">
          <h3>Send Referral</h3>
          <button className="doctor-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form className="doctor-modal-form" onSubmit={handleSubmit}>
          {error && <div className="doctor-error-message">{error}</div>}

          <div className="doctor-form-group">
            <label>Select Patient <span className="doctor-required">*</span></label>
            <select
              value={formData.patientId}
              onChange={(e) => setFormData({...formData, patientId: e.target.value})}
              required
              disabled={isOffline}
            >
              <option value="">Choose a patient</option>
              {patients.map(patient => {
                const name = `${patient.user?.profile?.firstName || ''} ${patient.user?.profile?.lastName || ''}`.trim();
                return (
                  <option key={patient._id} value={patient._id}>
                    {name || 'Unknown Patient'}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="doctor-form-group">
            <label>Refer to Doctor <span className="doctor-required">*</span></label>
            <select
              value={formData.toDoctorId}
              onChange={(e) => setFormData({...formData, toDoctorId: e.target.value})}
              required
              disabled={isOffline}
            >
              <option value="">Choose a doctor</option>
              {doctors.map(doctor => (
                <option key={doctor._id} value={doctor._id}>
                  Dr. {doctor.profile?.firstName} {doctor.profile?.lastName} - {doctor.specialization || 'General'}
                </option>
              ))}
            </select>
          </div>

          <div className="doctor-form-group">
            <label>Priority <span className="doctor-required">*</span></label>
            <div className="doctor-priority-options">
              <button
                type="button"
                className={`doctor-priority-option ${formData.priority === 'normal' ? 'selected normal' : ''}`}
                onClick={() => setFormData({...formData, priority: 'normal'})}
                disabled={isOffline}
              >
                Normal
              </button>
              <button
                type="button"
                className={`doctor-priority-option ${formData.priority === 'urgent' ? 'selected urgent' : ''}`}
                onClick={() => setFormData({...formData, priority: 'urgent'})}
                disabled={isOffline}
              >
                Urgent
              </button>
              <button
                type="button"
                className={`doctor-priority-option ${formData.priority === 'emergency' ? 'selected emergency' : ''}`}
                onClick={() => setFormData({...formData, priority: 'emergency'})}
                disabled={isOffline}
              >
                Emergency
              </button>
            </div>
          </div>

          <div className="doctor-form-group">
            <label>Reason for Referral <span className="doctor-required">*</span></label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({...formData, reason: e.target.value})}
              required
              rows="3"
              placeholder="Explain why you're referring this patient..."
              disabled={isOffline}
            />
          </div>

          <div className="doctor-form-group">
            <label>Additional Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows="2"
              placeholder="Any additional information for the receiving doctor..."
              disabled={isOffline}
            />
          </div>

          <div className="doctor-modal-actions">
            <button type="button" className="doctor-cancel-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="doctor-submit-btn" disabled={loading || isOffline}>
              {loading ? 'Sending...' : 'Send Referral'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};