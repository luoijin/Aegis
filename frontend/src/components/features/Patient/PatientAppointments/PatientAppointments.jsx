// frontend/src/components/features/Patient/PatientAppointments/PatientAppointments.jsx
import React from 'react';
import { Calendar, Clock, MapPin, Video, Phone, Building, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import './PatientAppointments.css';

export const PatientAppointments = ({ appointments }) => {
  if (!appointments || appointments.length === 0) {
    return (
      <div className="appointments-card">
        <div className="card-header">
          <h3><Calendar size={16} /> Appointments</h3>
        </div>
        <div className="empty-state">
          <Calendar size={48} />
          <p>No appointments scheduled</p>
          <span>Your appointments will appear here</span>
        </div>
      </div>
    );
  }

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

  const getStatusConfig = (status) => {
    switch(status) {
      case 'confirmed': return { icon: <CheckCircle size={12} />, class: 'confirmed', label: 'Confirmed' };
      case 'completed': return { icon: <CheckCircle size={12} />, class: 'completed', label: 'Completed' };
      case 'cancelled': return { icon: <XCircle size={12} />, class: 'cancelled', label: 'Cancelled' };
      case 'no-show': return { icon: <AlertCircle size={12} />, class: 'no-show', label: 'No Show' };
      default: return { icon: <Clock size={12} />, class: 'scheduled', label: 'Scheduled' };
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Group appointments by date
  const groupedAppointments = appointments.reduce((groups, apt) => {
    const dateKey = new Date(apt.dateTime).toDateString();
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(apt);
    return groups;
  }, {});

  const sortedDates = Object.keys(groupedAppointments).sort((a, b) => new Date(b) - new Date(a));

  return (
    <div className="appointments-card">
      <div className="card-header">
        <h3><Calendar size={16} /> Appointments</h3>
      </div>
      
      <div className="appointments-list">
        {sortedDates.map(dateKey => (
          <div key={dateKey} className="appointment-group">
            <div className="group-header">
              <Calendar size={14} />
              <span>{formatDate(dateKey)}</span>
            </div>
            
            <div className="appointments-table-wrapper">
              <table className="appointments-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Type</th>
                    <th>Location / Hospital</th>
                    <th>Status</th>
                    <th>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedAppointments[dateKey].map(apt => {
                    const statusConfig = getStatusConfig(apt.status);
                    const hospital = apt.hospital;
                    
                    return (
                      <tr key={apt._id}>
                        <td className="col-time">
                          <Clock size={12} />
                          <span>{formatTime(apt.dateTime)}</span>
                          <span className="duration">({apt.duration || 30} min)</span>
                        </td>
                        <td className="col-type">
                          {getTypeIcon(apt.type)}
                          <span>{getTypeLabel(apt.type)}</span>
                        </td>
                        <td className="col-location">
                          {apt.type === 'video' ? (
                            <span className="video-link">Video call link will be sent</span>
                          ) : apt.type === 'phone' ? (
                            <span className="phone-call">Phone consultation</span>
                          ) : (
                            <div className="location-info">
                              {hospital ? (
                                <>
                                  <Building size={12} />
                                  <span className="hospital-name">{hospital.name}</span>
                                  {apt.location?.room && <span className="room-info">({apt.location.room})</span>}
                                  {hospital.address?.street && (
                                    <span className="hospital-address">
                                      {hospital.address.street}, {hospital.address.city}
                                    </span>
                                  )}
                                </>
                              ) : (
                                <span className="no-location">Location to be confirmed</span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="col-status">
                          <span className={`status-badge ${statusConfig.class}`}>
                            {statusConfig.icon}
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="col-reason">
                          {apt.reason || '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};