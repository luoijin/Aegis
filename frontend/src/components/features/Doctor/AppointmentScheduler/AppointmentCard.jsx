// frontend/src/components/features/Doctor/AppointmentScheduler/AppointmentCard.jsx

import React from 'react';
import { Calendar, Clock, User, MapPin, Video, Phone, CheckCircle, XCircle, AlertCircle, Building } from 'lucide-react';
import './AppointmentCard.css';

export const AppointmentCard = ({ appointment, onUpdateStatus, isOffline = false }) => {
  const getStatusConfig = (status) => {
    switch(status) {
      case 'confirmed': return { icon: <CheckCircle size={12} />, class: 'confirmed', label: 'Confirmed' };
      case 'completed': return { icon: <CheckCircle size={12} />, class: 'completed', label: 'Completed' };
      case 'cancelled': return { icon: <XCircle size={12} />, class: 'cancelled', label: 'Cancelled' };
      case 'no-show': return { icon: <AlertCircle size={12} />, class: 'no-show', label: 'No Show' };
      default: return { icon: <Clock size={12} />, class: 'scheduled', label: 'Scheduled' };
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'video': return <Video size={14} />;
      case 'phone': return <Phone size={14} />;
      default: return <MapPin size={14} />;
    }
  };

  const getTypeLabel = (type) => {
    switch(type) {
      case 'video': return 'Video Call';
      case 'phone': return 'Phone Call';
      default: return 'In-Person';
    }
  };

  const statusConfig = getStatusConfig(appointment.status);
  const patientName = `${appointment.patient?.user?.profile?.firstName || ''} ${appointment.patient?.user?.profile?.lastName || ''}`.trim();
  const hospitalName = appointment.hospital?.name || '';
  const hospitalAddress = appointment.hospital?.address;
  const roomInfo = appointment.location?.room;
  const appointmentDate = new Date(appointment.dateTime);
  const formattedDate = appointmentDate.toLocaleDateString();
  const formattedTime = appointmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleConfirm = () => onUpdateStatus(appointment._id, 'confirmed');
  const handleCancel = () => onUpdateStatus(appointment._id, 'cancelled');
  const handleComplete = () => onUpdateStatus(appointment._id, 'completed');
  const handleNoShow = () => onUpdateStatus(appointment._id, 'no-show');

  return (
    <div className="appointment-card">
      <div className="card-header">
        <div className="patient-info">
          <User size={16} />
          <span className="patient-name">{patientName || 'Unknown Patient'}</span>
        </div>
        <div className={`status-badge ${statusConfig.class}`}>
          {statusConfig.icon}{statusConfig.label}
        </div>
      </div>

      <div className="card-body">
        <div className="info-row">
          <Calendar size={14} /><span>{formattedDate}</span>
          <Clock size={14} /><span>{formattedTime}</span>
          <span className="duration-badge">{appointment.duration || 30} min</span>
        </div>
        
        <div className="info-row">
          {getTypeIcon(appointment.type)}<span>{getTypeLabel(appointment.type)}</span>
        </div>

        {appointment.type === 'in-person' && (
          <div className="info-row location-row">
            <Building size={14} />
            <div className="location-details">
              {hospitalName ? (
                <>
                  <span className="hospital-name">{hospitalName}</span>
                  {roomInfo && <span className="room-info">({roomInfo})</span>}
                  {hospitalAddress?.street && <span className="hospital-address">{hospitalAddress.street}, {hospitalAddress.city}</span>}
                </>
              ) : <span className="no-location">Location not specified</span>}
            </div>
          </div>
        )}

        {appointment.reason && (
          <div className="reason-row">
            <strong>Reason:</strong> {appointment.reason}
          </div>
        )}
      </div>

      {appointment.status === 'scheduled' && (
        <div className="card-actions">
          <button className="confirm-btn" onClick={handleConfirm} disabled={isOffline}>
            <CheckCircle size={14} /> Confirm
          </button>
          <button className="cancel-btn" onClick={handleCancel} disabled={isOffline}>
            <XCircle size={14} /> Cancel
          </button>
        </div>
      )}

      {appointment.status === 'confirmed' && (
        <div className="card-actions">
          <button className="complete-btn" onClick={handleComplete} disabled={isOffline}>
            <CheckCircle size={14} /> Mark Completed
          </button>
          <button className="noshow-btn" onClick={handleNoShow} disabled={isOffline}>
            <AlertCircle size={14} /> No Show
          </button>
        </div>
      )}
    </div>
  );
};