// frontend/src/components/features/Doctor/AppointmentScheduler/AppointmentCard.jsx
import React from 'react';
import { Calendar, Clock, User, MapPin, CheckCircle, XCircle } from 'lucide-react';
import './AppointmentCard.css';

export const AppointmentCard = ({ appointment, onUpdateStatus }) => {
  const getStatusBadge = (status) => {
    switch(status) {
      case 'confirmed':
        return <span className="badge confirmed"><CheckCircle size={12} /> Confirmed</span>;
      case 'completed':
        return <span className="badge completed"><CheckCircle size={12} /> Completed</span>;
      case 'cancelled':
        return <span className="badge cancelled"><XCircle size={12} /> Cancelled</span>;
      default:
        return <span className="badge scheduled">Scheduled</span>;
    }
  };

  return (
    <div className="appointment-card">
      <div className="card-header">
        <div className="patient-avatar">
          {appointment.patient?.user?.profile?.firstName?.[0]}
          {appointment.patient?.user?.profile?.lastName?.[0]}
        </div>
        <div className="patient-details">
          <h4>
            {appointment.patient?.user?.profile?.firstName} {appointment.patient?.user?.profile?.lastName}
          </h4>
          <p className="reason">{appointment.reason || 'General Checkup'}</p>
        </div>
        {getStatusBadge(appointment.status)}
      </div>

      <div className="card-body">
        <div className="info-row">
          <Calendar size={16} />
          <span>{new Date(appointment.dateTime).toLocaleDateString()}</span>
        </div>
        <div className="info-row">
          <Clock size={16} />
          <span>{new Date(appointment.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div className="info-row">
          <MapPin size={16} />
          <span>{appointment.type === 'video' ? 'Video Call' : 'In-Person Visit'}</span>
        </div>
      </div>

      {appointment.status === 'scheduled' && (
        <div className="card-actions">
          <button className="confirm-btn" onClick={() => onUpdateStatus(appointment._id, 'confirmed')}>
            Confirm
          </button>
          <button className="cancel-btn" onClick={() => onUpdateStatus(appointment._id, 'cancelled')}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};