// frontend/src/components/features/Doctor/PatientChart/PatientChartModal.jsx
import React, { useState, useEffect } from 'react';
import { X, User, Calendar, Phone, Mail, Droplet, AlertCircle, Pill, Activity, Clock, Share2, FileText } from 'lucide-react';
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

  useEffect(() => {
    if (patient?._id) fetchAllData();
  }, [patient]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Patient profile (always try this first)
      const profileRes = await api.get(`/doctor/patients/${patient._id}`, { headers });
      setProfile(profileRes.data);

      // 2. Health logs
      try {
        const logsRes = await api.get(`/doctor/patients/${patient._id}/health-logs`, { headers });
        setHealthLogs(logsRes.data || []);
      } catch (err) {
        console.warn('Health logs endpoint not available yet');
        setHealthLogs([]);
      }

      // 3. Prescriptions (optional - skip if 404)
      try {
        const prescriptionsRes = await api.get('/doctor/prescriptions', { headers });
        const allPrescriptions = prescriptionsRes.data || [];
        setPrescriptions(allPrescriptions.filter(p => p.patient?._id === patient._id || p.patient === patient._id));
      } catch (err) {
        console.warn('Prescriptions endpoint not available yet');
        setPrescriptions([]);
      }

      // 4. Appointments (optional - skip if 404)
      try {
        const appointmentsRes = await api.get('/doctor/appointments', { headers });
        const allAppointments = appointmentsRes.data || [];
        setAppointments(allAppointments.filter(a => a.patient?._id === patient._id || a.patient === patient._id));
      } catch (err) {
        console.warn('Appointments endpoint not available yet');
        setAppointments([]);
      }

      // 5. Referrals (optional - skip if 404)
      try {
        const referralsRes = await api.get('/doctor/referrals', { headers });
        const allReferrals = referralsRes.data || [];
        setReferrals(allReferrals.filter(r => r.patient?._id === patient._id || r.patient === patient._id));
      } catch (err) {
        console.warn('Referrals endpoint not available yet');
        setReferrals([]);
      }

    } catch (err) {
      console.error('Error fetching patient chart data:', err);
      setError('Failed to load patient chart. Please try again later.');
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

  if (loading) {
    return (
      <div className="doctor-modal-overlay" onClick={onClose}>
        <div className="patient-chart-modal" style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '12px' }}>
          <div className="loading-spinner"></div>
          <p>Loading patient chart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="doctor-modal-overlay" onClick={onClose}>
        <div className="patient-chart-modal" style={{ textAlign: 'center', padding: '40px', color: '#ef4444', background: 'white', borderRadius: '12px' }}>
          <AlertCircle size={48} />
          <p>{error}</p>
          <button onClick={onClose} style={{ marginTop: '16px', padding: '8px 16px', background: '#3B82F6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Close</button>
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
            <FileText size={18} style={{ marginRight: '8px' }} />
            Electronic Health Record – {user.profile?.firstName || patientData.firstName} {user.profile?.lastName || patientData.lastName}
          </h3>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal-body unified-chart">
          {/* Demographics */}
          <section className="chart-section">
            <h4><User size={16} /> Demographics</h4>
            <div className="demographics-grid">
              <div><strong>Name:</strong> {user.profile?.firstName || patientData.firstName} {user.profile?.lastName || patientData.lastName}</div>
              <div><strong>DOB:</strong> {user.profile?.dateOfBirth ? formatDate(user.profile.dateOfBirth) : 'N/A'}</div>
              <div><strong>Age:</strong> {calculateAge(user.profile?.dateOfBirth)}</div>
              <div><strong>Gender:</strong> {user.profile?.gender || patientData.gender || 'N/A'}</div>
              <div><strong>Blood Type:</strong> {patientData.bloodType || 'Not specified'}</div>
              <div><strong>Phone:</strong> {user.profile?.phone || patientData.phone || 'N/A'}</div>
              <div><strong>Email:</strong> {user.email || patientData.email || 'N/A'}</div>
              <div><strong>Emergency Contact:</strong> {patientData.emergencyContact?.name || 'N/A'} ({patientData.emergencyContact?.relationship || 'N/A'}) - {patientData.emergencyContact?.phone || 'N/A'}</div>
            </div>
          </section>

          {/* Medical Conditions */}
          <section className="chart-section">
            <h4><AlertCircle size={16} /> Medical Conditions</h4>
            {!patientData.conditions || patientData.conditions.filter(c => c.isActive !== false).length === 0 ? (
              <p>No active conditions</p>
            ) : (
              <ul className="conditions-list">
                {patientData.conditions.filter(c => c.isActive !== false).map((c, idx) => (
                  <li key={idx}>
                    <strong>{c.name}</strong> – <em>{c.severity || 'N/A'}</em> (Diagnosed: {formatDate(c.diagnosedDate)})
                    {c.notes && <span className="condition-notes"> – {c.notes}</span>}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Allergies */}
          <section className="chart-section">
            <h4><AlertCircle size={16} /> Allergies</h4>
            <p>{patientData.allergies?.length ? patientData.allergies.join(', ') : 'No known allergies'}</p>
          </section>

          {/* Current Medications */}
          <section className="chart-section">
            <h4><Pill size={16} /> Current Medications</h4>
            {activePrescriptions.length === 0 ? (
              <p className="coming-soon">⚠️ Prescription management coming soon</p>
            ) : (
              activePrescriptions.map(p => (
                <div key={p._id} className="med-item">
                  <strong>Issued:</strong> {formatDate(p.issuedDate)}<br />
                  <strong>Medications:</strong> {p.medications?.map(m => `${m.name} ${m.dosage} – ${m.frequency} for ${m.duration}`).join('; ')}<br />
                  <strong>Refills left:</strong> {p.refillsRemaining} | <strong>Status:</strong> Active
                  {p.notes && <div><strong>Notes:</strong> {p.notes}</div>}
                </div>
              ))
            )}
          </section>

          {/* Vitals History + Trend Chart */}
          <section className="chart-section">
            <h4><Activity size={16} /> Vitals History & Trend</h4>
            {chartData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="heartRate" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.1} name="Heart Rate (bpm)" />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="latest-vitals-note">
                  <strong>Latest Vitals:</strong> {
                    healthLogs[0] ? 
                    `BP ${healthLogs[0].vitals?.bloodPressure?.systolic}/${healthLogs[0].vitals?.bloodPressure?.diastolic}, HR ${healthLogs[0].vitals?.heartRate}, Temp ${healthLogs[0].vitals?.temperature}°C, O₂ ${healthLogs[0].vitals?.oxygenSaturation}%` 
                    : 'No data'
                  }
                </div>
              </>
            ) : <p>No vitals recorded yet.</p>}

            {/* Recent Health Logs Table */}
            <h5 style={{ marginTop: 20 }}>Recent Health Logs</h5>
            <div className="health-logs-table">
              <table className="data-table">
                <thead>
                  <tr><th>Date</th><th>Heart Rate</th><th>BP</th><th>Temp</th><th>O₂ Sat</th><th>Notes</th></tr>
                </thead>
                <tbody>
                  {healthLogs.length === 0 ? (
                    <tr><td colSpan="6" style={{ textAlign: 'center' }}>No health records available</td></tr>
                  ) : (
                    healthLogs.slice(0, 10).map(log => (
                      <tr key={log._id}>
                        <td>{formatDate(log.createdAt)}</td>
                        <td>{log.vitals?.heartRate || '--'} bpm</td>
                        <td>{log.vitals?.bloodPressure?.systolic || '--'}/{log.vitals?.bloodPressure?.diastolic || '--'}</td>
                        <td>{log.vitals?.temperature || '--'} °C</td>
                        <td>{log.vitals?.oxygenSaturation || '--'}%</td>
                        <td>{log.notes || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Appointments */}
          <section className="chart-section">
            <h4><Calendar size={16} /> Appointments</h4>
            {appointments.length === 0 ? (
              <p className="coming-soon">⚠️ Appointment scheduling coming soon</p>
            ) : (
              <>
                <div><strong>Upcoming:</strong></div>
                {upcomingAppointments.length === 0 ? <p>No upcoming appointments</p> : upcomingAppointments.map(a => (
                  <div key={a._id} className="appointment-record"><strong>{formatDate(a.dateTime)}</strong> – {a.type} – {a.status}</div>
                ))}
                <div style={{ marginTop: 12 }}><strong>Past:</strong></div>
                {pastAppointments.length === 0 ? <p>No past appointments</p> : pastAppointments.map(a => (
                  <div key={a._id} className="appointment-record"><strong>{formatDate(a.dateTime)}</strong> – {a.type} – {a.status}{a.reason && ` (Reason: ${a.reason})`}</div>
                ))}
              </>
            )}
          </section>

          {/* Referrals */}
          <section className="chart-section">
            <h4><Share2 size={16} /> Referrals</h4>
            {referrals.length === 0 ? (
              <p className="coming-soon">⚠️ Referral system coming soon</p>
            ) : (
              <>
                <div><strong>Received Referrals:</strong></div>
                {referrals.filter(r => r.toDoctor?._id === patient?.assignedDoctor?._id).length === 0 ? 
                  <p>No received referrals</p> : 
                  referrals.filter(r => r.toDoctor?._id === patient?.assignedDoctor?._id).map(r => (
                    <div key={r._id}><strong>From Dr. {r.fromDoctor?.profile?.firstName}</strong> – {r.reason} – Status: {r.status}</div>
                  ))}
                <div style={{ marginTop: 12 }}><strong>Sent Referrals:</strong></div>
                {referrals.filter(r => r.fromDoctor?._id === patient?.assignedDoctor?._id).length === 0 ? 
                  <p>No sent referrals</p> : 
                  referrals.filter(r => r.fromDoctor?._id === patient?.assignedDoctor?._id).map(r => (
                    <div key={r._id}><strong>To Dr. {r.toDoctor?.profile?.firstName}</strong> – {r.reason} – Status: {r.status}</div>
                  ))}
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default PatientChartModal;