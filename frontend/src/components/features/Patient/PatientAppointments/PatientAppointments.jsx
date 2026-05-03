// frontend/src/components/features/Patient/PatientAppointments/PatientAppointments.jsx
import React from 'react';
import { Calendar, Clock, MapPin, Video, Phone } from 'lucide-react';
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
      case 'video': return 'Video';
      case 'phone': return 'Phone';
      default: return 'In-Person';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Group appointments by date
  const groupedAppointments = appointments.reduce((groups, apt) => {
    const dateKey = new Date(apt.dateTime).toDateString();
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(apt);
    return groups;
  }, {});

  const sortedDates = Object.keys(groupedAppointments).sort((a, b) => new Date(b) - new Date(a));

  const getStatusClass = (status) => {
    switch(status) {
      case 'confirmed': return 'status-confirmed';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      case 'no-show': return 'status-no-show';
      default: return 'status-scheduled';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'confirmed': return 'Confirmed';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      case 'no-show': return 'No Show';
      default: return 'Scheduled';
    }
  };

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
                    <th>Status</th>
                    <th>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedAppointments[dateKey].map(apt => (
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
                      <td className="col-status">
                        <span className={`status-badge ${getStatusClass(apt.status)}`}>
                          {getStatusLabel(apt.status)}
                        </span>
                      </td>
                      <td className="col-reason">
                        {apt.reason || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};