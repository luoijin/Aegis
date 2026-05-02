import React from 'react';
import { Calendar } from 'lucide-react';
import './PatientAppointments.css';

export const PatientAppointments = ({ appointments }) => {
  if (!appointments || appointments.length === 0) {
    return (
      <div className="appointments-card">
        <h3>Appointments</h3>
        <div className="empty-state">
          <Calendar size={48} />
          <p>No appointments scheduled</p>
        </div>
      </div>
    );
  }

  return (
    <div className="appointments-card">
      <h3>Appointments</h3>
      <div className="appointments-list">
        {appointments.map(apt => (
          <div key={apt._id} className="appointment-item">
            <div className="appointment-date">
              {new Date(apt.dateTime).toLocaleDateString()}
            </div>
            <div className="appointment-time">
              {new Date(apt.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="appointment-type">{apt.type || 'In-Person'}</div>
            <div className="appointment-status">{apt.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
};