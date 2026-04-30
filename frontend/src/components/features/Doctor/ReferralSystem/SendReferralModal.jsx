// frontend/src/components/features/Doctor/ReferralSystem/SendReferralModal.jsx
import React, { useState } from 'react';
import { X } from 'lucide-react';
import './SendReferralModal.css';

export const SendReferralModal = ({ patients, doctors, onClose, onSend }) => {
  const [formData, setFormData] = useState({
    patientId: '',
    toDoctorId: '',
    reason: '',
    priority: 'normal',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSend(formData);
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="send-referral-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Send Referral</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Select Patient *</label>
            <select
              value={formData.patientId}
              onChange={(e) => setFormData({...formData, patientId: e.target.value})}
              required
            >
              <option value="">Choose a patient</option>
              {patients.map(patient => (
                <option key={patient._id} value={patient._id}>
                  {patient.user?.profile?.firstName} {patient.user?.profile?.lastName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Refer to Doctor *</label>
            <select
              value={formData.toDoctorId}
              onChange={(e) => setFormData({...formData, toDoctorId: e.target.value})}
              required
            >
              <option value="">Choose a doctor</option>
              {doctors.map(doctor => (
                <option key={doctor._id} value={doctor._id}>
                  Dr. {doctor.profile?.firstName} {doctor.profile?.lastName} - {doctor.specialization || 'General'}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Priority *</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({...formData, priority: e.target.value})}
            >
              <option value="normal">Normal</option>
              <option value="urgent">Urgent</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>

          <div className="form-group">
            <label>Reason for Referral *</label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({...formData, reason: e.target.value})}
              required
              rows="3"
              placeholder="Explain why you're referring this patient..."
            />
          </div>

          <div className="form-group">
            <label>Additional Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows="2"
              placeholder="Any additional information for the receiving doctor..."
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Sending...' : 'Send Referral'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};