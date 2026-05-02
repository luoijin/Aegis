// frontend/src/components/features/Doctor/AppointmentScheduler/AppointmentForm.jsx
import React, { useState, useEffect } from 'react';
import { X, MapPin, Video, Phone, AlertCircle, Clock } from 'lucide-react';
import '../../../../styles/modal.css';
import './AppointmentForm.css'; // Only for conflict modal specific styles

export const AppointmentForm = ({ patients, appointments, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    patientId: '',
    dateTime: '',
    duration: '30',
    type: 'in-person',
    reason: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [conflict, setConflict] = useState(null);
  const [showConflictModal, setShowConflictModal] = useState(false);

  const checkForConflicts = (selectedDateTime, selectedDuration) => {
    if (!selectedDateTime) return null;
    
    const selectedStart = new Date(selectedDateTime);
    const selectedEnd = new Date(selectedStart.getTime() + parseInt(selectedDuration) * 60000);
    
    const conflictingAppointment = appointments.find(apt => {
      if (apt.status === 'cancelled' || apt.status === 'completed') return false;
      const aptStart = new Date(apt.dateTime);
      const aptEnd = new Date(aptStart.getTime() + (apt.duration || 30) * 60000);
      return (selectedStart < aptEnd && selectedEnd > aptStart);
    });
    
    if (conflictingAppointment) {
      const patientName = `${conflictingAppointment.patient?.user?.profile?.firstName || ''} ${conflictingAppointment.patient?.user?.profile?.lastName || ''}`.trim();
      const aptStartTime = new Date(conflictingAppointment.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const aptEndTime = new Date(new Date(conflictingAppointment.dateTime).getTime() + (conflictingAppointment.duration || 30) * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return { patient: patientName, startTime: aptStartTime, endTime: aptEndTime, duration: conflictingAppointment.duration || 30 };
    }
    return null;
  };

  useEffect(() => {
    if (formData.dateTime && formData.duration) {
      setConflict(checkForConflicts(formData.dateTime, formData.duration));
    } else {
      setConflict(null);
    }
  }, [formData.dateTime, formData.duration, appointments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (conflict) {
      setShowConflictModal(true);
      return;
    }
    setLoading(true);
    await onSubmit(formData);
    setLoading(false);
  };

  const minDateTime = new Date();
  minDateTime.setMinutes(minDateTime.getMinutes() + 30);
  const minDateTimeStr = minDateTime.toISOString().slice(0, 16);

  const ConflictModal = () => (
    <div className="modal-overlay" onClick={() => setShowConflictModal(false)}>
      <div className="modal-container modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Schedule Conflict</h3>
          <button className="close-btn" onClick={() => setShowConflictModal(false)}>
            <X size={20} />
          </button>
        </div>
        <div className="modal-form">
          <p>You already have an appointment during this time:</p>
          <div className="conflict-details" style={{ background: '#F8FAFC', padding: '12px', borderRadius: '10px', margin: '12px 0' }}>
            <div><strong>Patient:</strong> {conflict?.patient}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
              <Clock size={14} />
              <span>{conflict?.startTime} - {conflict?.endTime} ({conflict?.duration} min)</span>
            </div>
          </div>
          <p className="conflict-suggestion" style={{ color: '#D97706' }}>Please select a different time slot.</p>
          <div className="modal-actions">
            <button className="submit-btn" onClick={() => setShowConflictModal(false)}>OK</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-container modal-md" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>Schedule Appointment</h3>
            <button className="close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          <form className="modal-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Select Patient <span className="required">*</span></label>
              <select value={formData.patientId} onChange={(e) => setFormData({...formData, patientId: e.target.value})} required>
                <option value="">Choose a patient</option>
                {patients.map(patient => {
                  const name = `${patient.user?.profile?.firstName || ''} ${patient.user?.profile?.lastName || ''}`.trim();
                  return <option key={patient._id} value={patient._id}>{name || 'Unknown Patient'}</option>;
                })}
              </select>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>Date & Time <span className="required">*</span></label>
                <input type="datetime-local" value={formData.dateTime} onChange={(e) => setFormData({...formData, dateTime: e.target.value})} min={minDateTimeStr} required />
              </div>
              <div className="form-group">
                <label>Duration</label>
                <select value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})}>
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                </select>
              </div>
            </div>

            {conflict && !showConflictModal && (
              <div className="conflict-warning">
                <AlertCircle size={14} />
                <span>Time conflict with {conflict.patient}'s appointment ({conflict.startTime} - {conflict.endTime})</span>
              </div>
            )}

            <div className="form-group">
              <label>Appointment Type</label>
              <div className="type-options">
                <button type="button" className={`type-option ${formData.type === 'in-person' ? 'selected' : ''}`} onClick={() => setFormData({...formData, type: 'in-person'})}>
                  <MapPin size={16} /> In-Person
                </button>
                <button type="button" className={`type-option ${formData.type === 'video' ? 'selected' : ''}`} onClick={() => setFormData({...formData, type: 'video'})}>
                  <Video size={16} /> Video Call
                </button>
                <button type="button" className={`type-option ${formData.type === 'phone' ? 'selected' : ''}`} onClick={() => setFormData({...formData, type: 'phone'})}>
                  <Phone size={16} /> Phone Call
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Reason for Visit</label>
              <textarea value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} rows="3" placeholder="e.g., Follow-up, Check-up, Symptoms..." />
            </div>

            <div className="form-group">
              <label>Internal Notes</label>
              <textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} rows="2" placeholder="Notes for yourself (not visible to patient)..." />
            </div>

            <div className="modal-actions">
              <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
              <button type="submit" className={`submit-btn ${conflict ? 'disabled' : ''}`} disabled={loading || conflict}>
                {loading ? 'Scheduling...' : 'Schedule Appointment'}
              </button>
            </div>
          </form>
        </div>
      </div>
      {showConflictModal && <ConflictModal />}
    </>
  );
};