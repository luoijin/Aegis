// frontend/src/components/features/Doctor/AppointmentScheduler/AppointmentForm.jsx

import React, { useState, useEffect } from 'react';
import { X, MapPin, Video, Phone, AlertCircle, Clock, Building, WifiOff } from 'lucide-react';
import { HospitalSelector } from '../../../common/HospitalSelector/HospitalSelector';
import api from '../../../../services/api';
import './AppointmentForm.css';

export const AppointmentForm = ({ patients, appointments, onClose, onSubmit, isOffline = false }) => {
  const [formData, setFormData] = useState({
    patientId: '',
    dateTime: '',
    duration: '30',
    type: 'in-person',
    reason: '',
    notes: '',
    hospitalId: '',
    location: { room: '', floor: '', instructions: '' }
  });
  const [loading, setLoading] = useState(false);
  const [conflict, setConflict] = useState(null);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [doctorHospital, setDoctorHospital] = useState(null);
  const [loadingHospital, setLoadingHospital] = useState(true);

  // Fetch doctor's hospital on mount
  useEffect(() => {
    const fetchDoctorProfile = async () => {
      try {
        const response = await api.get('/auth/profile');
        const doctor = response.data;
        if (doctor.hospital) {
          setDoctorHospital(doctor.hospital);
          setFormData(prev => ({ ...prev, hospitalId: doctor.hospital._id }));
        }
      } catch (error) {
        console.error('Error fetching doctor hospital:', error);
      } finally {
        setLoadingHospital(false);
      }
    };
    fetchDoctorProfile();
  }, []);

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
    if (formData.dateTime && formData.duration && !isOffline) {
      setConflict(checkForConflicts(formData.dateTime, formData.duration));
    } else {
      setConflict(null);
    }
  }, [formData.dateTime, formData.duration, appointments, isOffline]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isOffline) {
      // error handled by parent
      onClose();
      return;
    }
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

  // Disable all inputs if offline
  const isDisabled = isOffline || loading;

  return (
    <>
      <div className="doctor-modal-overlay" onClick={onClose}>
        <div className="doctor-modal-container doctor-modal-md" onClick={(e) => e.stopPropagation()}>
          {isOffline && (
            <div className="offline-banner-modal">
              <WifiOff size={14} />
              <span>Offline – cannot schedule appointments</span>
            </div>
          )}
          <div className="doctor-modal-header">
            <h3>Schedule Appointment</h3>
            <button className="doctor-close-btn" onClick={onClose}><X size={20} /></button>
          </div>
          <form className="doctor-modal-form" onSubmit={handleSubmit}>
            <div className="doctor-form-group">
              <label>Select Patient <span className="doctor-required">*</span></label>
              <select 
                value={formData.patientId} 
                onChange={(e) => setFormData({...formData, patientId: e.target.value})} 
                required 
                disabled={isDisabled}
              >
                <option value="">Choose a patient</option>
                {patients.map(patient => {
                  const name = `${patient.user?.profile?.firstName || ''} ${patient.user?.profile?.lastName || ''}`.trim();
                  return <option key={patient._id} value={patient._id}>{name || 'Unknown Patient'}</option>;
                })}
              </select>
            </div>

            <div className="doctor-form-row-2">
              <div className="doctor-form-group">
                <label>Date & Time <span className="doctor-required">*</span></label>
                <input 
                  type="datetime-local" 
                  value={formData.dateTime} 
                  onChange={(e) => setFormData({...formData, dateTime: e.target.value})} 
                  min={minDateTimeStr} 
                  required 
                  disabled={isDisabled}
                />
              </div>
              <div className="doctor-form-group">
                <label>Duration</label>
                <select 
                  value={formData.duration} 
                  onChange={(e) => setFormData({...formData, duration: e.target.value})} 
                  disabled={isDisabled}
                >
                  <option value="15">15 min</option>
                  <option value="30">30 min</option>
                  <option value="45">45 min</option>
                  <option value="60">60 min</option>
                </select>
              </div>
            </div>

            {conflict && !showConflictModal && !isOffline && (
              <div className="doctor-conflict-warning">
                <AlertCircle size={14} />
                Time conflict with {conflict.patient}'s appointment ({conflict.startTime} - {conflict.endTime})
              </div>
            )}

            <div className="doctor-form-group">
              <label>Appointment Type</label>
              <div className="doctor-type-options">
                <button 
                  type="button" 
                  className={`doctor-type-option ${formData.type === 'in-person' ? 'selected' : ''}`} 
                  onClick={() => setFormData({...formData, type: 'in-person'})}
                  disabled={isDisabled}
                >
                  <MapPin size={16} /> In-Person
                </button>
                <button 
                  type="button" 
                  className={`doctor-type-option ${formData.type === 'video' ? 'selected' : ''}`} 
                  onClick={() => setFormData({...formData, type: 'video'})}
                  disabled={isDisabled}
                >
                  <Video size={16} /> Video Call
                </button>
                <button 
                  type="button" 
                  className={`doctor-type-option ${formData.type === 'phone' ? 'selected' : ''}`} 
                  onClick={() => setFormData({...formData, type: 'phone'})}
                  disabled={isDisabled}
                >
                  <Phone size={16} /> Phone Call
                </button>
              </div>
            </div>

            <div className="doctor-form-group">
              <label>Hospital / Clinic Location</label>
              {loadingHospital ? (
                <div className="loading-indicator">Loading hospital info...</div>
              ) : doctorHospital ? (
                <div className="hospital-info-static">
                  <Building size={16} />
                  <div className="hospital-details">
                    <div className="hospital-name">{doctorHospital.name}</div>
                    {doctorHospital.address?.street && (
                      <div className="hospital-address">{doctorHospital.address.street}, {doctorHospital.address.city}</div>
                    )}
                    {doctorHospital.phone && <div className="hospital-phone">{doctorHospital.phone}</div>}
                  </div>
                </div>
              ) : (
                <>
                  <HospitalSelector 
                    value={formData.hospitalId} 
                    onChange={(hospitalId) => setFormData({...formData, hospitalId})} 
                    disabled={isDisabled}
                  />
                  <p className="field-note">No default hospital assigned. Please select one.</p>
                </>
              )}
            </div>

            {formData.hospitalId && (doctorHospital?._id !== formData.hospitalId) && (
              <div className="doctor-form-group">
                <label>Room / Suite (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g., Room 304, 3rd Floor" 
                  value={formData.location.room} 
                  onChange={(e) => setFormData({...formData, location: { ...formData.location, room: e.target.value }})}
                  disabled={isDisabled}
                />
              </div>
            )}

            <div className="doctor-form-group">
              <label>Reason for Visit</label>
              <textarea 
                value={formData.reason} 
                onChange={(e) => setFormData({...formData, reason: e.target.value})} 
                rows="3" 
                placeholder="e.g., Follow-up, Check-up, Symptoms..."
                disabled={isDisabled}
              />
            </div>

            <div className="doctor-form-group">
              <label>Internal Notes</label>
              <textarea 
                value={formData.notes} 
                onChange={(e) => setFormData({...formData, notes: e.target.value})} 
                rows="2" 
                placeholder="Notes for yourself..."
                disabled={isDisabled}
              />
            </div>

            <div className="doctor-modal-actions">
              <button type="button" className="doctor-cancel-btn" onClick={onClose} disabled={loading}>Cancel</button>
              <button type="submit" className="doctor-submit-btn" disabled={loading || isDisabled || conflict}>
                {loading ? 'Scheduling...' : 'Schedule Appointment'}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {showConflictModal && (
        <div className="doctor-modal-overlay" onClick={() => setShowConflictModal(false)}>
          <div className="doctor-modal-container doctor-modal-sm">
            <div className="doctor-modal-header">
              <h3>Schedule Conflict</h3>
              <button className="doctor-close-btn" onClick={() => setShowConflictModal(false)}><X size={20} /></button>
            </div>
            <div className="doctor-modal-form">
              <p>You already have an appointment during this time:</p>
              <div className="conflict-details-static">
                <div><strong>Patient:</strong> {conflict?.patient}</div>
                <div><Clock size={14} /> {conflict?.startTime} - {conflict?.endTime} ({conflict?.duration} min)</div>
              </div>
              <p className="conflict-suggestion">Please select a different time slot.</p>
              <div className="doctor-modal-actions">
                <button className="doctor-submit-btn" onClick={() => setShowConflictModal(false)}>OK</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};