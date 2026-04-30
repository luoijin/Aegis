// frontend/src/components/features/Doctor/AppointmentScheduler/AppointmentForm.jsx
import React, { useState } from 'react';
import { X } from 'lucide-react';
import './AppointmentForm.css';

export const AppointmentForm = ({ patients, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    patientId: '',
    dateTime: '',
    type: 'in-person',
    reason: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(formData);
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="appointment-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Schedule Appointment</h3>
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
            <label>Date & Time *</label>
            <input
              type="datetime-local"
              value={formData.dateTime}
              onChange={(e) => setFormData({...formData, dateTime: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Appointment Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
            >
              <option value="in-person">In-Person Visit</option>
              <option value="video">Video Consultation</option>
              <option value="phone">Phone Call</option>
            </select>
          </div>

          <div className="form-group">
            <label>Reason / Notes</label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({...formData, reason: e.target.value})}
              rows="3"
              placeholder="Reason for appointment..."
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Scheduling...' : 'Schedule Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};