// frontend/src/components/features/Doctor/PatientChart/PatientChartModal.jsx

import React, { useState, useEffect } from 'react';
import { X, User, Calendar, Phone, Mail, Droplet, AlertCircle, Pill, Activity, Share2, FileText, Heart, Stethoscope, Thermometer, Clock, CheckCircle, XCircle, Syringe, History, MapPin, Home, Briefcase, WifiOff } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../../../services/api';
import './PatientChartModal.css';

const PatientChartModal = ({ patient, onClose }) => {
  const [profile, setProfile] = useState(null);
  const [healthLogs, setHealthLogs] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    if (patient?._id) fetchAllData();

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [patient]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const profileRes = await api.get(`/doctor/patients/${patient._id}`, { headers });
      setProfile(profileRes.data);
      localStorage.setItem(`cachedPatientProfile_${patient._id}`, JSON.stringify(profileRes.data));

      try {
        const logsRes = await api.get(`/doctor/patients/${patient._id}/health-logs`, { headers });
        setHealthLogs(logsRes.data || []);
        localStorage.setItem(`cachedHealthLogs_${patient._id}`, JSON.stringify(logsRes.data || []));
      } catch (err) {
        const cached = localStorage.getItem(`cachedHealthLogs_${patient._id}`);
        if (cached) setHealthLogs(JSON.parse(cached));
        else setHealthLogs([]);
      }

      try {
        const prescriptionsRes = await api.get('/doctor/prescriptions', { headers });
        const filtered = prescriptionsRes.data.filter(p => p.patient?._id === patient._id);
        setPrescriptions(filtered);
        localStorage.setItem(`cachedPrescriptions_${patient._id}`, JSON.stringify(filtered));
      } catch (err) {
        const cached = localStorage.getItem(`cachedPrescriptions_${patient._id}`);
        if (cached) setPrescriptions(JSON.parse(cached));
        else setPrescriptions([]);
      }

      try {
        const appointmentsRes = await api.get('/doctor/appointments', { headers });
        const filtered = appointmentsRes.data.filter(a => a.patient?._id === patient._id);
        setAppointments(filtered);
        localStorage.setItem(`cachedAppointments_${patient._id}`, JSON.stringify(filtered));
      } catch (err) {
        const cached = localStorage.getItem(`cachedAppointments_${patient._id}`);
        if (cached) setAppointments(JSON.parse(cached));
        else setAppointments([]);
      }

      try {
        const referralsRes = await api.get('/doctor/referrals', { headers });
        const filtered = referralsRes.data.filter(r => r.patient?._id === patient._id);
        setReferrals(filtered);
        localStorage.setItem(`cachedReferrals_${patient._id}`, JSON.stringify(filtered));
      } catch (err) {
        const cached = localStorage.getItem(`cachedReferrals_${patient._id}`);
        if (cached) setReferrals(JSON.parse(cached));
        else setReferrals([]);
      }
    } catch (err) {
      console.error('Error fetching patient chart data:', err);
      // Try to load from cache
      const cachedProfile = localStorage.getItem(`cachedPatientProfile_${patient._id}`);
      if (cachedProfile) {
        setProfile(JSON.parse(cachedProfile));
        setError('Using cached data (offline mode)');
      } else {
        setError('Failed to load patient chart. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const diff = Date.now() - birthDate.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const formatDate = (date) => new Date(date).toLocaleDateString();

  const chartData = [...healthLogs]
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .slice(-30)
    .map(log => ({
      date: new Date(log.createdAt).toLocaleDateString(),
      heartRate: log.vitals?.heartRate || 0,
    }));

  const activePrescriptions = prescriptions.filter(p => p.isActive !== false);
  const upcomingAppointments = appointments.filter(a => new Date(a.dateTime) > new Date() && a.status !== 'cancelled');
  const pastAppointments = appointments.filter(a => new Date(a.dateTime) <= new Date() || a.status === 'completed');

  const activeConditions = profile?.conditions?.filter(c => c.isActive !== false) || [];
  const resolvedConditions = profile?.conditions?.filter(c => c.isActive === false) || [];

  const getStatusIcon = (status) => {
    switch(status) {
      case 'accepted': return <CheckCircle size={14} className="status-icon accepted" />;
      case 'denied': return <XCircle size={14} className="status-icon denied" />;
      case 'pending': return <Clock size={14} className="status-icon pending" />;
      default: return <Clock size={14} className="status-icon" />;
    }
  };

  if (loading) {
    return (
      <div className="doctor-modal-overlay" onClick={onClose}>
        <div className="patient-chart-modal" style={{ textAlign: 'center', padding: '40px' }}>
          <div className="loading-spinner-static"></div>
          <p style={{ color: 'var(--gray-500)', marginTop: '16px' }}>Loading Electronic Health Record...</p>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="doctor-modal-overlay" onClick={onClose}>
        <div className="patient-chart-modal" style={{ textAlign: 'center', padding: '40px' }}>
          <AlertCircle size={48} color="var(--danger)" />
          <p style={{ color: 'var(--danger)', marginTop: '16px' }}>{error}</p>
          <button onClick={onClose} className="close-error-btn">Close</button>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const patientData = profile.patient || profile;
  const user = patientData.user || profile.user || {};

  return (
    <div className="doctor-modal-overlay" onClick={onClose}>
      <div className="patient-chart-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            <FileText size={20} />
            Electronic Health Record – {user.profile?.firstName || patientData.firstName} {user.profile?.lastName || patientData.lastName}
          </h3>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        {isOffline && (
          <div className="offline-banner-modal-chart">
            <WifiOff size={14} />
            <span>Offline – displaying cached data</span>
          </div>
        )}

        <div className="modal-body">
          {/* Section 1: Demographics */}
          <div className="demographics-wrapper">
            <div className="demographics-column">
              <div className="demographics-subheader">
                <User size={14} />
                <span>Personal Information</span>
              </div>
              <div className="demographic-item">
                <span className="demographic-label">Full Name</span>
                <span className="demographic-value">{user.profile?.firstName || patientData.firstName} {user.profile?.lastName || patientData.lastName}</span>
              </div>
              <div className="demographic-item">
                <span className="demographic-label">Date of Birth</span>
                <span className="demographic-value">{user.profile?.dateOfBirth ? formatDate(user.profile.dateOfBirth) : 'N/A'}</span>
              </div>
              <div className="demographic-item">
                <span className="demographic-label">Age</span>
                <span className="demographic-value">{calculateAge(user.profile?.dateOfBirth)} years</span>
              </div>
              <div className="demographic-item">
                <span className="demographic-label">Gender</span>
                <span className="demographic-value">{user.profile?.gender || patientData.gender || 'Not specified'}</span>
              </div>
            </div>

            <div className="demographics-column">
              <div className="demographics-subheader">
                <Heart size={14} />
                <span>Medical Information</span>
              </div>
              <div className="demographic-item">
                <span className="demographic-label">Blood Type</span>
                <span className="demographic-value">{patientData.bloodType || 'Not specified'}</span>
              </div>
              <div className="demographic-item">
                <span className="demographic-label">Phone Number</span>
                <span className="demographic-value">{user.profile?.phone || patientData.phone || 'Not provided'}</span>
              </div>
              <div className="demographic-item">
                <span className="demographic-label">Email Address</span>
                <span className="demographic-value">{user.email || patientData.email || 'Not provided'}</span>
              </div>
            </div>
          </div>

          {/* Emergency Contact Section */}
          <div className="emergency-contact-section">
            <div className="emergency-header">
              <AlertCircle size={14} />
              <span>Emergency Contact</span>
            </div>
            <div className="emergency-grid">
              <div className="emergency-item">
                <span className="emergency-label">Name</span>
                <span className="emergency-value">{patientData.emergencyContact?.name || 'Not provided'}</span>
              </div>
              <div className="emergency-item">
                <span className="emergency-label">Relationship</span>
                <span className="emergency-value">{patientData.emergencyContact?.relationship || 'Not specified'}</span>
              </div>
              <div className="emergency-item">
                <span className="emergency-label">Phone Number</span>
                <span className="emergency-value">{patientData.emergencyContact?.phone || 'Not provided'}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Medical Summary */}
          <section className="chart-section">
            <h4><Stethoscope size={18} /> Medical Summary</h4>
            <div className="medical-summary-grid">
              <div className="summary-block">
                <div className="summary-header">
                  <Heart size={16} />
                  <span>Active Conditions</span>
                </div>
                {activeConditions.length === 0 ? (
                  <p className="empty-message">No active conditions</p>
                ) : (
                  <ul className="conditions-list">
                    {activeConditions.map((c, idx) => (
                      <li key={idx}>
                        <span className="condition-name">{c.name}</span>
                        <span className="condition-severity">{c.severity || 'N/A'}</span>
                        <span className="condition-date">Diagnosed: {formatDate(c.diagnosedDate)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="summary-block">
                <div className="summary-header">
                  <AlertCircle size={16} />
                  <span>Allergies</span>
                </div>
                <p className="allergies-text">{patientData.allergies?.length ? patientData.allergies.join(', ') : 'No known allergies'}</p>
              </div>
            </div>

            {resolvedConditions.length > 0 && (
              <div className="resolved-conditions-section">
                <div className="resolved-header">
                  <History size={16} />
                  <span>Previously Diagnosed (Resolved)</span>
                </div>
                <ul className="resolved-conditions-list">
                  {resolvedConditions.map((c, idx) => (
                    <li key={idx}>
                      <span className="condition-name">{c.name}</span>
                      <span className="condition-severity-resolved">{c.severity || 'N/A'}</span>
                      <span className="condition-date">Diagnosed: {formatDate(c.diagnosedDate)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* Section 3: Current Medications */}
          <section className="chart-section">
            <h4><Pill size={18} /> Current Medications</h4>
            {activePrescriptions.length === 0 ? (
              <div className="empty-state">
                <Pill size={32} strokeWidth={1.5} />
                <p>No active prescriptions</p>
              </div>
            ) : (
              <div className="medications-list">
                {activePrescriptions.map(p => (
                  <div key={p._id} className="medication-card">
                    <div className="medication-date">
                      <Calendar size={14} />
                      <span>Issued {formatDate(p.issuedDate)}</span>
                    </div>
                    <div className="medication-items">
                      {p.medications?.map((m, idx) => (
                        <div key={idx} className="medication-item">
                          <Syringe size={14} />
                          <div className="medication-details">
                            <span className="medication-name">{m.name}</span>
                            {m.dosage && <span className="medication-dosage">{m.dosage}</span>}
                            {m.frequency && <span className="medication-frequency">{m.frequency}</span>}
                            {m.duration && <span className="medication-duration">{m.duration}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                    {p.notes && (
                      <div className="medication-notes">
                        <FileText size={14} />
                        <span>{p.notes}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Section 4: Vitals History */}
          <section className="chart-section">
            <h4><Activity size={18} /> Vitals History & Trend</h4>
            {chartData.length > 0 ? (
              <>
                <div className="vitals-chart-container">
                  <div className="chart-header">
                    <Heart size={14} />
                    <span>Heart Rate Trend (Last 30 days)</span>
                  </div>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-200)" />
                      <XAxis dataKey="date" stroke="var(--gray-400)" fontSize={11} />
                      <YAxis stroke="var(--gray-400)" fontSize={11} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }} />
                      <Area type="monotone" dataKey="heartRate" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.1} name="Heart Rate (bpm)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="latest-vitals-grid">
                  {healthLogs[0] ? (
                    <>
                      <div className="vital-item">
                        <Droplet size={16} />   {/* Changed from Droplets */}
                        <div>
                          <span className="vital-label">Blood Pressure</span>
                          <span className="vital-value">{healthLogs[0].vitals?.bloodPressure?.systolic || '--'}/{healthLogs[0].vitals?.bloodPressure?.diastolic || '--'}</span>
                        </div>
                      </div>
                      <div className="vital-item">
                        <Heart size={16} />
                        <div>
                          <span className="vital-label">Heart Rate</span>
                          <span className="vital-value">{healthLogs[0].vitals?.heartRate || '--'} bpm</span>
                        </div>
                      </div>
                      <div className="vital-item">
                        <Thermometer size={16} />
                        <div>
                          <span className="vital-label">Temperature</span>
                          <span className="vital-value">{healthLogs[0].vitals?.temperature || '--'} °C</span>
                        </div>
                      </div>
                      <div className="vital-item">
                        <Droplet size={16} />   {/* Changed from Droplets */}
                        <div>
                          <span className="vital-label">O₂ Saturation</span>
                          <span className="vital-value">{healthLogs[0].vitals?.oxygenSaturation || '--'}%</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="empty-message">No vitals recorded</div>
                  )}
                </div>
              </>
            ) : (
              <div className="empty-state">
                <Activity size={32} strokeWidth={1.5} />
                <p>No vitals recorded yet</p>
              </div>
            )}

            {/* Health Logs Table */}
            <div className="health-logs-section">
              <div className="section-subheader">
                <Clock size={14} />
                <span>Recent Health Logs</span>
              </div>
              <div className="health-logs-table">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Heart Rate</th>
                      <th>Blood Pressure</th>
                      <th>Temperature</th>
                      <th>O₂ Sat</th>
                      <th>Recorded By</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {healthLogs.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="empty-table-message">No health records available</td>
                      </tr>
                    ) : (
                      healthLogs.slice(0, 10).map(log => {
                        let doctorName = 'Unknown';
                        if (log.recordedBy) {
                          if (log.recordedBy.profile?.firstName && log.recordedBy.profile?.lastName) {
                            doctorName = `Dr. ${log.recordedBy.profile.firstName} ${log.recordedBy.profile.lastName}`;
                          } else if (log.recordedBy.email) {
                            doctorName = log.recordedBy.email.split('@')[0];
                          }
                        }
                        return (
                          <tr key={log._id}>
                            <td className="log-date">{formatDate(log.createdAt)}</td>
                            <td>{log.vitals?.heartRate || '--'} <span className="unit">bpm</span></td>
                            <td>{log.vitals?.bloodPressure?.systolic || '--'}/{log.vitals?.bloodPressure?.diastolic || '--'}</td>
                            <td>{log.vitals?.temperature || '--'} <span className="unit">°C</span></td>
                            <td>{log.vitals?.oxygenSaturation || '--'} <span className="unit">%</span></td>
                            <td className="recorded-by-cell">{doctorName}</td>
                            <td className="log-notes">{log.notes || '-'}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Section 5: Appointments */}
          <section className="chart-section">
            <h4><Calendar size={18} /> Appointments</h4>
            {appointments.length === 0 ? (
              <div className="empty-state">
                <Calendar size={32} strokeWidth={1.5} />
                <p>No appointments scheduled</p>
              </div>
            ) : (
              <div className="appointments-container">
                {upcomingAppointments.length > 0 && (
                  <div className="appointment-group">
                    <div className="group-header"><Clock size={14} /><span>Upcoming</span></div>
                    {upcomingAppointments.map(a => (
                      <div key={a._id} className="appointment-item">
                        <Calendar size={14} />
                        <div className="appointment-details">
                          <span className="appointment-date">{formatDate(a.dateTime)}</span>
                          <span className="appointment-type">{a.type}</span>
                          <span className={`appointment-status ${a.status}`}>{a.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {pastAppointments.length > 0 && (
                  <div className="appointment-group">
                    <div className="group-header"><CheckCircle size={14} /><span>Past</span></div>
                    {pastAppointments.map(a => (
                      <div key={a._id} className="appointment-item">
                        <Calendar size={14} />
                        <div className="appointment-details">
                          <span className="appointment-date">{formatDate(a.dateTime)}</span>
                          <span className="appointment-type">{a.type}</span>
                          <span className={`appointment-status ${a.status}`}>{a.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Section 6: Referrals */}
          <section className="chart-section">
            <h4><Share2 size={18} /> Referrals</h4>
            {referrals.length === 0 ? (
              <div className="empty-state">
                <Share2 size={32} strokeWidth={1.5} />
                <p>No referral records</p>
              </div>
            ) : (
              <div className="referrals-container">
                {referrals.filter(r => r.fromDoctor?._id === patient?.assignedDoctor?._id).length > 0 && (
                  <div className="referral-group">
                    <div className="group-header"><Share2 size={14} /><span>Sent</span></div>
                    {referrals.filter(r => r.fromDoctor?._id === patient?.assignedDoctor?._id).map(r => (
                      <div key={r._id} className="referral-item">
                        {getStatusIcon(r.status)}
                        <div className="referral-details">
                          <span className="referral-doctor">To Dr. {r.toDoctor?.profile?.firstName} {r.toDoctor?.profile?.lastName}</span>
                          <span className="referral-reason">{r.reason}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {referrals.filter(r => r.toDoctor?._id === patient?.assignedDoctor?._id).length > 0 && (
                  <div className="referral-group">
                    <div className="group-header"><Share2 size={14} /><span>Received</span></div>
                    {referrals.filter(r => r.toDoctor?._id === patient?.assignedDoctor?._id).map(r => (
                      <div key={r._id} className="referral-item">
                        {getStatusIcon(r.status)}
                        <div className="referral-details">
                          <span className="referral-doctor">From Dr. {r.fromDoctor?.profile?.firstName} {r.fromDoctor?.profile?.lastName}</span>
                          <span className="referral-reason">{r.reason}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default PatientChartModal;