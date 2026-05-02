import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Video, Phone, MapPin, CheckCircle, XCircle, AlertCircle, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { AppointmentForm } from './AppointmentForm';
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

  useEffect(() => {
    fetchAppointments();
    fetchStats();
  }, [filter]);

  const fetchAppointments = async () => {
    try {
      const response = await api.get(`/doctor/appointments?status=${filter}`);
      setAppointments(response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/doctor/appointments/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleCreateAppointment = async (appointmentData) => {
    try {
      await api.post('/doctor/appointments', appointmentData);
      setShowForm(false);
      fetchAppointments();
      fetchStats();
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert(error.response?.data?.message || 'Failed to schedule appointment');
    }
  };

  const handleUpdateStatus = async (appointmentId, status) => {
    try {
      await api.put(`/doctor/appointments/${appointmentId}`, { status });
      fetchAppointments();
      fetchStats();
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert(error.response?.data?.message || 'Failed to update appointment');
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      scheduled: { icon: <Clock size={14} />, class: 'status-scheduled', label: 'Scheduled' },
      confirmed: { icon: <CheckCircle size={14} />, class: 'status-confirmed', label: 'Confirmed' },
      completed: { icon: <CheckCircle size={14} />, class: 'status-completed', label: 'Completed' },
      cancelled: { icon: <XCircle size={14} />, class: 'status-cancelled', label: 'Cancelled' },
      'no-show': { icon: <AlertCircle size={14} />, class: 'status-no-show', label: 'No Show' }
    };
    return configs[status] || configs.scheduled;
  };

  const getTypeConfig = (type) => {
    const configs = {
      video: { icon: <Video size={14} />, label: 'Video Call' },
      phone: { icon: <Phone size={14} />, label: 'Phone Call' },
      'in-person': { icon: <MapPin size={14} />, label: 'In-Person' }
    };
    return configs[type] || configs['in-person'];
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Filter appointments for calendar view
  const getFilteredAppointmentsForCalendar = () => {
    if (filter === 'all') return appointments;
    return appointments.filter(apt => apt.status === filter);
  };

  // Calendar View Functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
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

  const statsConfig = [
    { label: 'Total', value: stats?.total || 0, icon: <Calendar size={18} /> },
    { label: 'Today', value: stats?.today || 0, icon: <Clock size={18} /> },
    { label: 'Upcoming', value: stats?.upcoming || 0, icon: <AlertCircle size={18} /> },
    { label: 'Completed', value: stats?.completed || 0, icon: <CheckCircle size={18} /> }
  ];

  return (
    <div className="appointment-scheduler">
      {/* Header */}
      <div className="appointment-header">
        <div>
          <h2>Appointments</h2>
          <p>Schedule and manage patient appointments</p>
        </div>
        <div className="header-actions">
          <div className="view-toggle">
            <button 
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              List View
            </button>
            <button 
              className={`view-btn ${viewMode === 'calendar' ? 'active' : ''}`}
              onClick={() => setViewMode('calendar')}
            >
              Calendar View
            </button>
          </div>
          <button className="schedule-btn" onClick={() => setShowForm(true)}>
            <Plus size={18} /> New Appointment
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {statsConfig.map(stat => (
          <div key={stat.label} className="stat-card">
            <div className="stat-icon">{stat.icon}</div>
            <div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button className={`filter-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          All ({stats?.total || 0})
        </button>
        <button className={`filter-tab ${filter === 'scheduled' ? 'active' : ''}`} onClick={() => setFilter('scheduled')}>
          Scheduled ({stats?.scheduled || 0})
        </button>
        <button className={`filter-tab ${filter === 'confirmed' ? 'active' : ''}`} onClick={() => setFilter('confirmed')}>
          Confirmed ({stats?.confirmed || 0})
        </button>
        <button className={`filter-tab ${filter === 'completed' ? 'active' : ''}`} onClick={() => setFilter('completed')}>
          Completed ({stats?.completed || 0})
        </button>
        <button className={`filter-tab ${filter === 'cancelled' ? 'active' : ''}`} onClick={() => setFilter('cancelled')}>
          Cancelled ({stats?.cancelled || 0})
        </button>
        <button className={`filter-tab ${filter === 'no-show' ? 'active' : ''}`} onClick={() => setFilter('no-show')}>
          No Show ({stats?.['no-show'] || 0})
        </button>
      </div>

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="calendar-view">
          <div className="calendar-header">
            <button className="month-nav" onClick={() => changeMonth(-1)}>
              <ChevronLeft size={20} />
            </button>
            <h3>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
            <button className="month-nav" onClick={() => changeMonth(1)}>
              <ChevronRight size={20} />
            </button>
          </div>
          <div className="calendar-grid">
            {daysOfWeek.map(day => (
              <div key={day} className="calendar-weekday">{day}</div>
            ))}
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
                          const patientName = `${apt.patient?.user?.profile?.firstName || ''} ${apt.patient?.user?.profile?.lastName || ''}`.trim();
                          const statusConfig = getStatusConfig(apt.status);
                          return (
                            <div key={apt._id} className={`day-appointment ${statusConfig.class}`} title={patientName}>
                              <Clock size={10} />
                              <span>{formatTime(apt.dateTime)}</span>
                              <span className="appointment-patient">{patientName.substring(0, 12)}</span>
                            </div>
                          );
                        })}
                        {dayAppointments.length > 3 && (
                          <div className="more-appointments">+{dayAppointments.length - 3} more</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* List View - Grouped by Date */}
      {viewMode === 'list' && (
        <div className="appointments-list-wrapper">
          {loading ? (
            <div className="empty-state">Loading appointments...</div>
          ) : filteredAppointments.length === 0 ? (
            <div className="empty-state">
              <Calendar size={48} />
              <p>No appointments found</p>
              <span>Click "New Appointment" to create one</span>
            </div>
          ) : (
            (() => {
              // Group appointments by date
              const grouped = {};
              filteredAppointments.forEach(apt => {
                const dateKey = new Date(apt.dateTime).toDateString();
                if (!grouped[dateKey]) grouped[dateKey] = [];
                grouped[dateKey].push(apt);
              });

              return Object.entries(grouped).map(([dateKey, dayAppointments]) => (
                <div key={dateKey} className="date-group">
                  <div className="date-header">
                    <Calendar size={16} />
                    <span>{new Date(dateKey).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    <span className="appointment-count">{dayAppointments.length} appointments</span>
                  </div>
                  <div className="appointments-grid">
                    {dayAppointments.map(appointment => {
                      const statusConfig = getStatusConfig(appointment.status);
                      const typeConfig = getTypeConfig(appointment.type);
                      const patientName = `${appointment.patient?.user?.profile?.firstName || ''} ${appointment.patient?.user?.profile?.lastName || ''}`.trim();
                      const appointmentDate = new Date(appointment.dateTime);
                      const formattedTime = appointmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      
                      return (
                        <div key={appointment._id} className="appointment-card">
                          <div className="card-header">
                            <div className="patient-info">
                              <div className="patient-initial">
                                {patientName.charAt(0) || 'P'}
                              </div>
                              <div>
                                <div className="patient-name">{patientName || 'Unknown Patient'}</div>
                                <div className="appointment-time">
                                  <Clock size={12} />
                                  <span>{formattedTime}</span>
                                  <span className="duration-badge">{appointment.duration} min</span>
                                </div>
                              </div>
                            </div>
                            <div className={`status-badge ${statusConfig.class}`}>
                              {statusConfig.icon}
                              {statusConfig.label}
                            </div>
                          </div>

                          <div className="card-body">
                            <div className="info-item">
                              {typeConfig.icon}
                              <span>{typeConfig.label}</span>
                            </div>
                            {appointment.reason && (
                              <div className="reason-row">
                                <strong>Reason:</strong> {appointment.reason}
                              </div>
                            )}
                          </div>

                          {appointment.status === 'scheduled' && (
                            <div className="card-actions">
                              <button className="confirm-btn" onClick={() => handleUpdateStatus(appointment._id, 'confirmed')}>
                                <CheckCircle size={14} /> Confirm
                              </button>
                              <button className="cancel-action-btn" onClick={() => handleUpdateStatus(appointment._id, 'cancelled')}>
                                <XCircle size={14} /> Cancel
                              </button>
                            </div>
                          )}

                          {appointment.status === 'confirmed' && (
                            <div className="card-actions">
                              <button className="complete-btn" onClick={() => handleUpdateStatus(appointment._id, 'completed')}>
                                <CheckCircle size={14} /> Mark Completed
                              </button>
                              <button className="noshow-btn" onClick={() => handleUpdateStatus(appointment._id, 'no-show')}>
                                <AlertCircle size={14} /> No Show
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ));
            })()
          )}
        </div>
      )}

      {/* Schedule Modal */}
      {showForm && (
        <AppointmentForm
          patients={patients}
          appointments={appointments}
          onClose={() => setShowForm(false)}
          onSubmit={handleCreateAppointment}
        />
      )}
    </div>
  );
};