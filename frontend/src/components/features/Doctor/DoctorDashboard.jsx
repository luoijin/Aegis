import React, { useState, useEffect } from 'react';
import { 
  Users, Activity, AlertTriangle, Search, Eye, TrendingUp, Clock,
  UserPlus, FileText, LogOut, Heart, Trash2, Download,
  Calendar, CheckCircle, AlertCircle, Thermometer, Droplet,
  Stethoscope, Mail, Phone, User, Plus, X, Edit
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Button from '../../common/Button/Button';
import api from '../../../utils/api';
import PatientSelectionModal from './PatientSelectionModal';
import PatientDetailsModal from './PatientDetailsModal';
import './DoctorDashboard.css';

const DoctorDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [healthLogs, setHealthLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [showHealthLogForm, setShowHealthLogForm] = useState(false);
  const [showPatientDetails, setShowPatientDetails] = useState(false);
  const [user, setUser] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [healthLog, setHealthLog] = useState({
    heartRate: '', systolicBP: '', diastolicBP: '', temperature: '', oxygenSaturation: '', notes: ''
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [patientsRes, logsRes] = await Promise.all([
        api.get('/patients'),
        api.get('/health-logs')
      ]);
      setPatients(patientsRes.data);
      setHealthLogs(logsRes.data);
      console.log('Patients loaded:', patientsRes.data);
      console.log('Health logs loaded:', logsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const getWeeklyActivityData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyMap = new Map();
    days.forEach(day => weeklyMap.set(day, 0));
    
    healthLogs.forEach(log => {
      if (log.createdAt) {
        const date = new Date(log.createdAt);
        const dayName = days[date.getDay()];
        weeklyMap.set(dayName, (weeklyMap.get(dayName) || 0) + 1);
      }
    });
    
    return days.map(day => ({
      day: day,
      patients: weeklyMap.get(day) || 0
    }));
  };

  const getStatusDistribution = () => {
    const critical = healthLogs.filter(l => l.status === 'critical').length;
    const warning = healthLogs.filter(l => l.status === 'warning').length;
    const stable = patients.length - critical - warning;
    
    return [
      { name: 'Critical', value: Math.max(0, critical), color: '#EF4444' },
      { name: 'Warning', value: Math.max(0, warning), color: '#F59E0B' },
      { name: 'Stable', value: Math.max(0, stable), color: '#10B981' }
    ];
  };

  const getRealStats = () => {
    const criticalLogs = healthLogs.filter(l => l.status === 'critical').length;
    const warningLogs = healthLogs.filter(l => l.status === 'warning').length;
    const totalHeartRate = healthLogs.reduce((sum, log) => sum + (log.vitals?.heartRate || 0), 0);
    
    return {
      totalPatients: patients.length,
      criticalAlerts: criticalLogs,
      warningAlerts: warningLogs,
      avgHeartRate: healthLogs.length > 0 ? Math.round(totalHeartRate / healthLogs.length) : 0
    };
  };

  const weeklyData = getWeeklyActivityData();
  const statusData = getStatusDistribution();
  const stats = getRealStats();

  const handleRemovePatient = async (patientId) => {
    try {
      await api.delete(`/patients/${patientId}/remove-from-list`);
      setSuccess('Patient removed from your list successfully');
      setShowDeleteConfirm(null);
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to remove patient');
    }
  };

  const handleAddHealthLog = async (e) => {
    e.preventDefault();
    if (!selectedPatient) return;
    setError('');
    
    if (!healthLog.heartRate || !healthLog.systolicBP || !healthLog.diastolicBP) {
      setError('Please fill in required vitals');
      return;
    }
    
    try {
      await api.post('/health-logs', {
        patient: selectedPatient._id,
        vitals: {
          heartRate: parseInt(healthLog.heartRate),
          bloodPressure: {
            systolic: parseInt(healthLog.systolicBP),
            diastolic: parseInt(healthLog.diastolicBP)
          },
          temperature: healthLog.temperature ? parseFloat(healthLog.temperature) : null,
          oxygenSaturation: healthLog.oxygenSaturation ? parseInt(healthLog.oxygenSaturation) : null
        },
        notes: healthLog.notes
      });

      setSuccess('Vitals recorded successfully!');
      setShowHealthLogForm(false);
      setHealthLog({ heartRate: '', systolicBP: '', diastolicBP: '', temperature: '', oxygenSaturation: '', notes: '' });
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to record vitals');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    window.location.href = '/';
  };

  const filteredPatients = patients.filter(p => 
    p.user?.profile?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportData = () => {
    const exportData = {
      patients: patients.map(p => ({
        name: `${p.user?.profile?.firstName} ${p.user?.profile?.lastName}`,
        email: p.user?.email,
        bloodType: p.bloodType,
        allergies: p.allergies,
        createdAt: p.createdAt
      })),
      healthLogs: healthLogs.map(l => ({
        patient: `${l.patient?.user?.profile?.firstName} ${l.patient?.user?.profile?.lastName}`,
        heartRate: l.vitals?.heartRate,
        bloodPressure: l.vitals?.bloodPressure,
        temperature: l.vitals?.temperature,
        status: l.status,
        date: l.createdAt
      })),
      summary: stats
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', `aegis_export_${new Date().toISOString().split('T')[0]}.json`);
    linkElement.click();
  };

  return (
    <div className="doctor-dashboard">
      <header className="dashboard-header-bar">
        <div className="header-logo"><Heart size={28} strokeWidth={1.5} /><span>AEGIS</span></div>
        <div className="header-user">
          <button className="export-btn" onClick={exportData} title="Export Data">
            <Download size={18} /> Export
          </button>
          <span className="user-name">Dr. {user?.profile?.firstName || 'Smith'}</span>
          <button className="logout-btn" onClick={handleLogout}><LogOut size={18} /></button>
        </div>
      </header>

      <main className="dashboard-main">
        {success && <div className="success-message">{success}</div>}
        {error && <div className="error-message">{error}</div>}

        <div className="dashboard-welcome">
          <h1>Welcome back, Dr. {user?.profile?.firstName || 'Smith'}</h1>
        </div>

        <div className="stats-grid">
          <div className="stat-card"><div className="stat-icon blue"><Users size={24} /></div><div className="stat-info"><h3>Total Patients</h3><div className="stat-value">{stats.totalPatients}</div></div></div>
          <div className="stat-card"><div className="stat-icon red"><AlertTriangle size={24} /></div><div className="stat-info"><h3>Critical Alerts</h3><div className="stat-value">{stats.criticalAlerts}</div></div></div>
          <div className="stat-card"><div className="stat-icon yellow"><Activity size={24} /></div><div className="stat-info"><h3>Warning Signs</h3><div className="stat-value">{stats.warningAlerts}</div></div></div>
          <div className="stat-card"><div className="stat-icon green"><TrendingUp size={24} /></div><div className="stat-info"><h3>Avg Heart Rate</h3><div className="stat-value">{stats.avgHeartRate} bpm</div></div></div>
        </div>

        <div className="charts-row">
          <div className="chart-card">
            <h3>Weekly Patient Activity</h3>
            {weeklyData.some(d => d.patients > 0) ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="day" stroke="#64748B" />
                  <YAxis stroke="#64748B" />
                  <Tooltip />
                  <Bar dataKey="patients" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-data-chart">No data yet. Add health records to see charts.</div>
            )}
          </div>

          <div className="chart-card">
            <h3>Patient Status Distribution</h3>
            {statusData.some(d => d.value > 0) ? (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value">
                      {statusData.map((entry, index) => (<Cell key={index} fill={entry.color} />))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pie-legend">
                  {statusData.map((item, idx) => (
                    <div key={idx} className="legend-item">
                      <div className="legend-color" style={{ background: item.color }}></div>
                      <span>{item.name}: {item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="no-data-chart">No patient data available yet.</div>
            )}
          </div>
        </div>

        <div className="patients-section">
          <div className="section-header">
            <h3>My Patients</h3>
            <div className="header-actions">
              <div className="search-bar"><Search size={18} /><input type="text" placeholder="Search patients..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
              <Button variant="primary" size="sm" onClick={() => setShowAddPatient(true)}><UserPlus size={16} /> Add Patient</Button>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">Loading patients...</div>
          ) : filteredPatients.length === 0 ? (
            <div className="empty-state"><p>No patients found. Click "Add Patient" to get started.</p></div>
          ) : (
            <div className="patients-grid">
              {filteredPatients.map(patient => (
                <div key={patient._id} className="patient-card">
                  <div className="patient-avatar">{patient.user?.profile?.firstName?.[0]}{patient.user?.profile?.lastName?.[0]}</div>
                  <div className="patient-details">
                    <h4>{patient.user?.profile?.firstName} {patient.user?.profile?.lastName}</h4>
                    <p>{patient.user?.email}</p>
                    <div className="patient-meta"><span className="blood-type">Blood: {patient.bloodType || 'N/A'}</span></div>
                  </div>
                  <div className="patient-actions">
                    <button className="action-btn" onClick={() => {
                      setSelectedPatient(patient);
                      setShowPatientDetails(true);
                    }}>
                      <Eye size={16} /> View
                    </button>
                    <button className="action-btn" onClick={() => { 
                      setSelectedPatient(patient); 
                      setShowHealthLogForm(true); 
                    }}>
                      <FileText size={16} /> Record Vitals
                    </button>
                    <button className="action-btn delete" onClick={() => setShowDeleteConfirm(patient)}>
                      <Trash2 size={16} /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="recent-logs">
          <div className="section-header">
            <h3>Recent Health Records</h3>
            <div className="header-stats">
              <span className="total-records">
                <FileText size={14} /> Total: {healthLogs.length} records
              </span>
            </div>
          </div>
          
          {healthLogs.length === 0 ? (
            <div className="empty-state">
              <AlertCircle size={48} />
              <p>No health records yet. Record vitals for your patients.</p>
            </div>
          ) : (
            <div className="logs-list">
              {healthLogs.slice(0, 10).map(log => (
                <div key={log._id} className="log-card">
                  {/* Patient Header */}
                  <div className="log-patient-header">
                    <div className="patient-avatar-sm">
                      {log.patient?.user?.profile?.firstName?.[0]}{log.patient?.user?.profile?.lastName?.[0]}
                    </div>
                    <div className="patient-info-header">
                      <div className="patient-name-header">
                        {log.patient?.user?.profile?.firstName} {log.patient?.user?.profile?.lastName}
                      </div>
                      <div className="patient-email-header">
                        <Mail size={12} /> {log.patient?.user?.email}
                      </div>
                    </div>
                    <div className="log-date-header">
                      <Calendar size={14} />
                      <span>{new Date(log.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}</span>
                      <span className="log-time">at {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  {/* Vitals Grid */}
                  <div className="log-vitals-grid">
                    <div className="log-vital-item">
                      <Heart size={18} className="vital-icon-red" />
                      <div>
                        <div className="vital-label-sm">Heart Rate</div>
                        <div className="vital-value-sm">{log.vitals?.heartRate || '--'} <span>bpm</span></div>
                      </div>
                    </div>
                    <div className="log-vital-item">
                      <Activity size={18} className="vital-icon-blue" />
                      <div>
                        <div className="vital-label-sm">Blood Pressure</div>
                        <div className="vital-value-sm">{log.vitals?.bloodPressure?.systolic || '--'}/{log.vitals?.bloodPressure?.diastolic || '--'} <span>mmHg</span></div>
                      </div>
                    </div>
                    <div className="log-vital-item">
                      <Thermometer size={18} className="vital-icon-orange" />
                      <div>
                        <div className="vital-label-sm">Temperature</div>
                        <div className="vital-value-sm">{log.vitals?.temperature || '--'} <span>°C</span></div>
                      </div>
                    </div>
                    <div className="log-vital-item">
                      <Droplet size={18} className="vital-icon-purple" />
                      <div>
                        <div className="vital-label-sm">O₂ Saturation</div>
                        <div className="vital-value-sm">{log.vitals?.oxygenSaturation || '--'} <span>%</span></div>
                      </div>
                    </div>
                  </div>

                  {/* Notes & Footer */}
                  {log.notes && (
                    <div className="log-notes-simple">
                      <FileText size={14} />
                      <span>{log.notes}</span>
                    </div>
                  )}

                  <div className="log-footer-simple">
                    <div className="recorded-by-simple">
                      <Stethoscope size={14} />
                      Dr. {log.recordedBy?.profile?.firstName} {log.recordedBy?.profile?.lastName}
                    </div>
                    <div className={`status-badge-simple ${log.status || 'normal'}`}>
                      {log.status === 'critical' ? 'Critical' : log.status === 'warning' ? 'Warning' : 'Normal'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Patient Selection Modal - This is the correct Add Patient modal */}
      {showAddPatient && (
        <PatientSelectionModal 
          onClose={() => setShowAddPatient(false)}
          onSuccess={(selectedPatient) => {
            setSuccess(`Patient ${selectedPatient.user?.profile?.firstName} ${selectedPatient.user?.profile?.lastName} added successfully!`);
            setShowAddPatient(false);
            fetchData();
            setTimeout(() => setSuccess(''), 3000);
          }}
        />
      )}

      {/* Patient Details Modal */}
      {showPatientDetails && selectedPatient && (
        <PatientDetailsModal 
          patient={selectedPatient}
          onClose={() => {
            setShowPatientDetails(false);
            setSelectedPatient(null);
          }}
          onRefresh={fetchData}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
          <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Remove Patient</h3>
              <button className="close-btn" onClick={() => setShowDeleteConfirm(null)}>×</button>
            </div>
            <p>Are you sure you want to remove <strong>{showDeleteConfirm.user?.profile?.firstName} {showDeleteConfirm.user?.profile?.lastName}</strong> from your patient list?</p>
            <p className="warning-text">This only removes them from your list. Their health records remain in the system.</p>
            <div className="modal-actions">
              <button onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
              <button className="delete-btn" onClick={() => handleRemovePatient(showDeleteConfirm._id)}>Remove Patient</button>
            </div>
          </div>
        </div>
      )}

      {/* Health Log Modal */}
      {showHealthLogForm && selectedPatient && (
        <div className="modal-overlay" onClick={() => setShowHealthLogForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><Heart size={20} /> Record Vitals for {selectedPatient.user?.profile?.firstName}</h3>
              <button className="close-btn" onClick={() => setShowHealthLogForm(false)}>×</button>
            </div>
            <form onSubmit={handleAddHealthLog}>
              <div className="vitals-row">
                <div className="input-group">
                  <Heart size={16} className="input-icon" />
                  <input type="number" placeholder="Heart Rate (bpm) *" value={healthLog.heartRate} onChange={(e) => setHealthLog({ ...healthLog, heartRate: e.target.value })} required />
                </div>
                <div className="input-group">
                  <Activity size={16} className="input-icon" />
                  <input type="number" placeholder="Systolic BP *" value={healthLog.systolicBP} onChange={(e) => setHealthLog({ ...healthLog, systolicBP: e.target.value })} required />
                </div>
                <div className="input-group">
                  <Activity size={16} className="input-icon" />
                  <input type="number" placeholder="Diastolic BP *" value={healthLog.diastolicBP} onChange={(e) => setHealthLog({ ...healthLog, diastolicBP: e.target.value })} required />
                </div>
              </div>
              <div className="vitals-row">
                <div className="input-group">
                  <Thermometer size={16} className="input-icon" />
                  <input type="number" step="0.1" placeholder="Temperature (°C)" value={healthLog.temperature} onChange={(e) => setHealthLog({ ...healthLog, temperature: e.target.value })} />
                </div>
                <div className="input-group">
                  <Droplet size={16} className="input-icon" />
                  <input type="number" placeholder="O2 Saturation (%)" value={healthLog.oxygenSaturation} onChange={(e) => setHealthLog({ ...healthLog, oxygenSaturation: e.target.value })} />
                </div>
              </div>
              <div className="input-group">
                <FileText size={16} className="input-icon" />
                <textarea placeholder="Additional Notes" value={healthLog.notes} onChange={(e) => setHealthLog({ ...healthLog, notes: e.target.value })} rows="3" />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowHealthLogForm(false)}>Cancel</button>
                <button type="submit">Save Vitals</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;