// frontend/src/components/features/Doctor/AppointmentScheduler/AppointmentScheduler.jsx
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Stethoscope, Plus, CheckCircle, XCircle } from 'lucide-react';
import { AppointmentForm } from './AppointmentForm';
import { AppointmentCard } from './AppointmentCard';
import api from '../../../../services/api';
import './AppointmentScheduler.css';

export const AppointmentScheduler = ({ doctorId, patients }) => {
  const [appointments, setAppointments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/doctor/appointments');
      setAppointments(response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAppointment = async (appointmentData) => {
    try {
      await api.post('/doctor/appointments', appointmentData);
      setShowForm(false);
      fetchAppointments();
      alert('Appointment scheduled successfully!');
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert(error.response?.data?.message || 'Failed to schedule appointment');
    }
  };

  const handleUpdateStatus = async (appointmentId, status) => {
    try {
      await api.put(`/doctor/appointments/${appointmentId}`, { status });
      fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  const getAppointmentsByDate = (date) => {
    return appointments.filter(apt => 
      new Date(apt.dateTime).toDateString() === date.toDateString()
    );
  };

  const upcomingAppointments = appointments
    .filter(apt => apt.status === 'scheduled' && new Date(apt.dateTime) > new Date())
    .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))
    .slice(0, 5);

  const todayAppointments = getAppointmentsByDate(new Date());

  return (
    <div className="appointment-scheduler">
      <div className="appointment-header">
        <div>
          <h2>Appointment Scheduler</h2>
          <p>Manage your patient appointments and schedule</p>
        </div>
        <button className="schedule-btn" onClick={() => setShowForm(true)}>
          <Plus size={18} /> Schedule Appointment
        </button>
      </div>

      <div className="appointment-stats">
        <div className="stat-card">
          <Calendar size={20} />
          <div>
            <div className="stat-value">{todayAppointments.length}</div>
            <div className="stat-label">Today</div>
          </div>
        </div>
        <div className="stat-card">
          <Clock size={20} />
          <div>
            <div className="stat-value">{upcomingAppointments.length}</div>
            <div className="stat-label">Upcoming</div>
          </div>
        </div>
        <div className="stat-card">
          <div>
            <div className="stat-value">{appointments.length}</div>
            <div className="stat-label">Total</div>
          </div>
        </div>
      </div>

      <div className="appointments-grid">
        {/* Upcoming Appointments */}
        <div className="appointments-section">
          <h3>Upcoming Appointments</h3>
          {loading ? (
            <div className="loading">Loading...</div>
          ) : upcomingAppointments.length === 0 ? (
            <div className="empty-state">No upcoming appointments</div>
          ) : (
            upcomingAppointments.map(apt => (
              <AppointmentCard
                key={apt._id}
                appointment={apt}
                onUpdateStatus={handleUpdateStatus}
              />
            ))
          )}
        </div>

        {/* Today's Schedule */}
        <div className="appointments-section">
          <h3>Today's Schedule</h3>
          {loading ? (
            <div className="loading">Loading...</div>
          ) : todayAppointments.length === 0 ? (
            <div className="empty-state">No appointments scheduled for today</div>
          ) : (
            todayAppointments.map(apt => (
              <AppointmentCard
                key={apt._id}
                appointment={apt}
                onUpdateStatus={handleUpdateStatus}
              />
            ))
          )}
        </div>
      </div>

      {/* Schedule Form Modal */}
      {showForm && (
        <AppointmentForm
          patients={patients}
          onClose={() => setShowForm(false)}
          onSubmit={handleCreateAppointment}
        />
      )}
    </div>
  );
};