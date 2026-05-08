// frontend/src/components/features/Doctor/AppointmentScheduler/AppointmentScheduler.jsx

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Video, Phone, MapPin, CheckCircle, XCircle, AlertCircle, Plus, ChevronLeft, ChevronRight, Building, WifiOff } from 'lucide-react';
import { AppointmentForm } from './AppointmentForm';
import { confirmDialog } from '../../../../utils/confirmDialog';
import api from '../../../../services/api';
import './AppointmentScheduler.css';

export const AppointmentScheduler = ({ doctorId, patients }) => {
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    fetchAppointments();
    fetchStats();

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [filter]);

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const showError = (message) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(''), 3000);
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/doctor/appointments?status=${filter}`);
      setAppointments(response.data);
      localStorage.setItem(`cachedAppointments_${filter}`, JSON.stringify(response.data));
    } catch (error) {
      console.error('Error fetching appointments:', error);
      // Offline fallback
      const cached = localStorage.getItem(`cachedAppointments_${filter}`);
      if (cached) {
        setAppointments(JSON.parse(cached));
        if (!isOffline) showError('Failed to load appointments. Showing cached data.');
      } else {
        showError('Failed to load appointments');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/doctor/appointments/stats');
      setStats(response.data);
      localStorage.setItem('cachedAppointmentStats', JSON.stringify(response.data));
    } catch (error) {
      console.error('Error fetching stats:', error);
      const cached = localStorage.getItem('cachedAppointmentStats');
      if (cached) setStats(JSON.parse(cached));
    }
  };

  const handleCreateAppointment = async (appointmentData) => {
    if (isOffline) {
      showError('You are offline. Cannot schedule appointment.');
      return;
    }
    try {
      await api.post('/doctor/appointments', appointmentData);
      setShowForm(false);
      showSuccess('Appointment scheduled successfully!');
      await fetchAppointments();
      await fetchStats();
    } catch (error) {
      console.error('Error creating appointment:', error);
      showError(error.response?.data?.message || 'Failed to schedule appointment');
    }
  };

  const handleUpdateStatus = async (appointmentId, status, actionName) => {
    if (isOffline) {
      showError('You are offline. Cannot update appointment.');
      return;
    }
    const confirmed = await confirmDialog(
      `${actionName} Appointment`,
      `Are you sure you want to mark this appointment as ${actionName.toLowerCase()}?`,
      'warning',
      `Yes, ${actionName}`,
      'Cancel'
    );
    
    if (confirmed) {
      try {
        await api.put(`/doctor/appointments/${appointmentId}`, { status });
        showSuccess(`Appointment marked as ${actionName.toLowerCase()}!`);
        await fetchAppointments();
        await fetchStats();
      } catch (error) {
        console.error('Error updating appointment:', error);
        showError(error.response?.data?.message || 'Failed to update appointment');
      }
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    if (isOffline) {
      showError('You are offline. Cannot cancel appointment.');
      return;
    }
    const confirmed = await confirmDialog(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      'danger',
      'Yes, Cancel',
      'No, Keep'
    );
    
    if (confirmed) {
      try {
        await api.delete(`/doctor/appointments/${appointmentId}`);
        showSuccess('Appointment cancelled successfully!');
        await fetchAppointments();
        await fetchStats();
      } catch (error) {
        console.error('Error deleting appointment:', error);
        showError(error.response?.data?.message || 'Failed to cancel appointment');
      }
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      scheduled: { class: 'status-scheduled', label: 'Scheduled' },
      confirmed: { class: 'status-confirmed', label: 'Confirmed' },
      completed: { class: 'status-completed', label: 'Completed' },
      cancelled: { class: 'status-cancelled', label: 'Cancelled' },
      'no-show': { class: 'status-no-show', label: 'No Show' }
    };
    return configs[status] || configs.scheduled;
  };

  const getTypeConfig = (type) => {
    const configs = {
      video: { icon: <Video size={14} />, label: 'Video Call' },
      phone: { icon: <Phone size={14} />, label: 'Phone Call' },
      'in-person': { icon: <Building size={14} />, label: 'In-Person' }
    };
    return configs[type] || configs['in-person'];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getFilteredAppointmentsForCalendar = () => {
    if (filter === 'all') return appointments;
    return appointments.filter(apt => apt.status === filter);
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  };

  const getAppointmentsForDay = (date) => {
    if (!date) return [];
    const filteredAppointments = getFilteredAppointmentsForCalendar();
    return filteredAppointments.filter(apt => {
      const aptDate = new Date(apt.dateTime);
      return aptDate.toDateString() === date.toDateString();
    }).sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
  };

  const changeMonth = (increment) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + increment, 1));
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const calendarDays = getDaysInMonth(currentDate);
  const filteredAppointments = getFilteredAppointmentsForCalendar();

  const groupedAppointments = filteredAppointments.reduce((groups, appointment) => {
    const dateKey = new Date(appointment.dateTime).toDateString();
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(appointment);
    return groups;
  }, {});

  const sortedDates = Object.keys(groupedAppointments).sort((a, b) => new Date(a) - new Date(b));

  const statsConfig = [
    { label: 'Total', value: stats?.total || 0, icon: <Calendar size={18} /> },
    { label: 'Today', value: stats?.today || 0, icon: <Clock size={18} /> },
    { label: 'Upcoming', value: stats?.upcoming || 0, icon: <AlertCircle size={18} /> },
    { label: 'Completed', value: stats?.completed || 0, icon: <CheckCircle size={18} /> }
  ];

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Loading appointments...</p>
      </div>
    );
  }

  return (
    <div className="appointment-scheduler">
      {/* Offline banner */}
      {isOffline && (
        <div className="offline-banner">
          <WifiOff size={16} />
          <span>You are offline. Appointments are read‑only.</span>
        </div>
      )}

      {successMessage && <div className="success-message">{successMessage}</div>}
      {errorMessage && <div className="error-message">{errorMessage}</div>}

      <div className="appointment-header">
        <div>
          <h2>Appointments</h2>
          <p>Schedule and manage patient appointments</p>
        </div>
        <div className="header-actions">
          <div className="view-toggle">
            <button className={`view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}>List View</button>
            <button className={`view-btn ${viewMode === 'calendar' ? 'active' : ''}`} onClick={() => setViewMode('calendar')}>Calendar View</button>
          </div>
          <button className="schedule-btn" onClick={() => setShowForm(true)} disabled={isOffline}>
            <Plus size={18} /> New Appointment
          </button>
        </div>
      </div>

      <div className="stats-grid">
        {statsConfig.map(stat => (
          <div key={stat.label} className="stat-card">
            <div className="stat-icon">{stat.icon}</div>
            <div><div className="stat-value">{stat.value}</div><div className="stat-label">{stat.label}</div></div>
          </div>
        ))}
      </div>

      <div className="filter-tabs">
        <button className={`filter-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')} disabled={isOffline}>All ({stats?.total || 0})</button>
        <button className={`filter-tab ${filter === 'scheduled' ? 'active' : ''}`} onClick={() => setFilter('scheduled')} disabled={isOffline}>Scheduled ({stats?.scheduled || 0})</button>
        <button className={`filter-tab ${filter === 'confirmed' ? 'active' : ''}`} onClick={() => setFilter('confirmed')} disabled={isOffline}>Confirmed ({stats?.confirmed || 0})</button>
        <button className={`filter-tab ${filter === 'completed' ? 'active' : ''}`} onClick={() => setFilter('completed')} disabled={isOffline}>Completed ({stats?.completed || 0})</button>
        <button className={`filter-tab ${filter === 'cancelled' ? 'active' : ''}`} onClick={() => setFilter('cancelled')} disabled={isOffline}>Cancelled ({stats?.cancelled || 0})</button>
        <button className={`filter-tab ${filter === 'no-show' ? 'active' : ''}`} onClick={() => setFilter('no-show')} disabled={isOffline}>No Show ({stats?.['no-show'] || 0})</button>
      </div>

      {viewMode === 'calendar' && (
        <div className="calendar-view">
          <div className="calendar-header">
            <button className="month-nav" onClick={() => changeMonth(-1)} disabled={isOffline}><ChevronLeft size={20} /></button>
            <h3>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
            <button className="month-nav" onClick={() => changeMonth(1)} disabled={isOffline}><ChevronRight size={20} /></button>
          </div>
          <div className="calendar-grid">
            {daysOfWeek.map(day => <div key={day} className="calendar-weekday">{day}</div>)}
            {calendarDays.map((day, index) => {
              const dayAppointments = day ? getAppointmentsForDay(day) : [];
              const isToday = day && day.toDateString() === new Date().toDateString();
              return (
                <div key={index} className={`calendar-day ${!day ? 'empty' : ''} ${isToday ? 'today' : ''}`}>
                  {day && (
                    <>
                      <div className="day-number">{day.getDate()}</div>
                      <div className="day-appointments">
                        {dayAppointments.slice(0, 3).map(apt => {
                          const statusConfig = getStatusConfig(apt.status);
                          const patientName = `${apt.patient?.user?.profile?.firstName || ''} ${apt.patient?.user?.profile?.lastName || ''}`.trim();
                          return (
                            <div key={apt._id} className={`day-appointment ${statusConfig.class}`} title={`${patientName} - ${formatTime(apt.dateTime)}`}>
                              <Clock size={10} />
                              <span>{formatTime(apt.dateTime)}</span>
                            </div>
                          );
                        })}
                        {dayAppointments.length > 3 && <div className="more-appointments">+{dayAppointments.length - 3} more</div>}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {viewMode === 'list' && (
        <div className="appointments-list-wrapper">
          {filteredAppointments.length === 0 ? (
            <div className="empty-state">
              <Calendar size={48} />
              <p>No appointments found</p>
              <span>Click "New Appointment" to create one</span>
            </div>
          ) : (
            sortedDates.map(dateKey => (
              <div key={dateKey} className="date-group">
                <div className="date-header">
                  <span>{formatDate(dateKey)}</span>
                  <span className="appointment-count">{groupedAppointments[dateKey].length}</span>
                </div>
                <div className="appointments-grid">
                  {groupedAppointments[dateKey].map(appointment => {
                    const statusConfig = getStatusConfig(appointment.status);
                    const typeConfig = getTypeConfig(appointment.type);
                    const patientName = `${appointment.patient?.user?.profile?.firstName || ''} ${appointment.patient?.user?.profile?.lastName || ''}`.trim() || 'Unknown Patient';
                    const appointmentDate = new Date(appointment.dateTime);
                    const hospitalName = appointment.hospital?.name || '';
                    
                    return (
                      <div key={appointment._id} className="appointment-card">
                        <div className="card-header">
                          <div className="patient-info">
                            <User size={16} />
                            <span className="patient-name">{patientName}</span>
                          </div>
                          <div className={`status-badge ${statusConfig.class}`}>{statusConfig.label}</div>
                        </div>

                        <div className="card-body">
                          <div className="info-row">
                            <Calendar size={14} />
                            <span>{appointmentDate.toLocaleDateString()}</span>
                            <Clock size={14} />
                            <span>{formatTime(appointment.dateTime)}</span>
                            <span className="duration-badge">{appointment.duration || 30} min</span>
                          </div>
                          <div className="info-row">
                            {typeConfig.icon}
                            <span>{typeConfig.label}</span>
                          </div>
                          {appointment.type === 'in-person' && (
                            <div className="info-row location-row">
                              <Building size={14} />
                              <div className="location-details">
                                {hospitalName ? (
                                  <>
                                    <span className="hospital-name">{hospitalName}</span>
                                    {appointment.location?.room && <span className="room-info">({appointment.location.room})</span>}
                                  </>
                                ) : (
                                  <span className="no-location">Location not specified</span>
                                )}
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
                            <button className="confirm-btn" onClick={() => handleUpdateStatus(appointment._id, 'confirmed', 'Confirm')} disabled={isOffline}>
                              <CheckCircle size={14} /> Confirm
                            </button>
                            <button className="cancel-btn" onClick={() => handleDeleteAppointment(appointment._id)} disabled={isOffline}>
                              <XCircle size={14} /> Cancel
                            </button>
                          </div>
                        )}
                        {appointment.status === 'confirmed' && (
                          <div className="card-actions">
                            <button className="complete-btn" onClick={() => handleUpdateStatus(appointment._id, 'completed', 'Complete')} disabled={isOffline}>
                              <CheckCircle size={14} /> Mark Completed
                            </button>
                            <button className="noshow-btn" onClick={() => handleUpdateStatus(appointment._id, 'no-show', 'No Show')} disabled={isOffline}>
                              <AlertCircle size={14} /> No Show
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showForm && (
        <AppointmentForm
          patients={patients}
          appointments={appointments}
          onClose={() => setShowForm(false)}
          onSubmit={handleCreateAppointment}
          isOffline={isOffline}
        />
      )}
    </div>
  );
};