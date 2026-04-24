import React, { useState, useEffect } from 'react';
import { 
  Users, Activity, AlertTriangle, Search, Eye, TrendingUp, Clock,
  UserPlus, FileText, LogOut, Heart, Trash2, X, Download
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Button from '../../common/Button/Button';
import api from '../../../utils/api';
import './DoctorDashboard.css';

const DoctorDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [healthLogs, setHealthLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [showHealthLogForm, setShowHealthLogForm] = useState(false);
  const [user, setUser] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [newPatient, setNewPatient] = useState({
    email: '', firstName: '', lastName: '', bloodType: '', allergies: []
  });

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
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // DYNAMIC CHART DATA CALCULATIONS
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

  const handleAddPatient = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!newPatient.email || !newPatient.firstName || !newPatient.lastName) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      const userRes = await api.post('/auth/register', {
        email: newPatient.email,
        password: 'password123',
        role: 'patient',
        profile: {
          firstName: newPatient.firstName,
          lastName: newPatient.lastName,
          phone: '1234567890'
        }
      });
      
      await api.post('/patients', {
        userId: userRes.data.user.id,
        bloodType: newPatient.bloodType,
        allergies: newPatient.allergies.filter(a => a && a.trim() !== '')
      });
      
      setSuccess(`Patient ${newPatient.firstName} ${newPatient.lastName} added successfully!`);
      setShowAddPatient(false);
      setNewPatient({ email: '', firstName: '', lastName: '', bloodType: '', allergies: [] });
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add patient');
    }
  };

  const handleDeletePatient = async (patientId) => {
    try {
      await api.delete(`/patients/${patientId}`);
      setSuccess('Patient deleted successfully');
      setShowDeleteConfirm(null);
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to delete patient');
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

  const addAllergy = () => setNewPatient({ ...newPatient, allergies: [...newPatient.allergies, ''] });
  const updateAllergy = (index, value) => {
    const updated = [...newPatient.allergies];
    updated[index] = value;
    setNewPatient({ ...newPatient, allergies: updated });
  };
  const removeAllergy = (index) => {
    const updated = newPatient.allergies.filter((_, i) => i !== index);
    setNewPatient({ ...newPatient, allergies: updated });
  };

  const filteredPatients = patients.filter(p => 
    p.user?.profile?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Export data function
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
          <p>Here's your practice overview based on real patient data.</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card"><div className="stat-icon blue"><Users size={24} /></div><div className="stat-info"><h3>Total Patients</h3><div className="stat-value">{stats.totalPatients}</div></div></div>
          <div className="stat-card"><div className="stat-icon red"><AlertTriangle size={24} /></div><div className="stat-info"><h3>Critical Alerts</h3><div className="stat-value">{stats.criticalAlerts}</div></div></div>
          <div className="stat-card"><div className="stat-icon yellow"><Activity size={24} /></div><div className="stat-info"><h3>Warning Signs</h3><div className="stat-value">{stats.warningAlerts}</div></div></div>
          <div className="stat-card"><div className="stat-icon green"><TrendingUp size={24} /></div><div className="stat-info"><h3>Avg Heart Rate</h3><div className="stat-value">{stats.avgHeartRate} bpm</div></div></div>
        </div>

        <div className="charts-row">
          <div className="chart-card">
            <h3>Weekly Patient Activity (Real Data)</h3>
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
                    <button className="action-btn" onClick={() => { setSelectedPatient(patient); setShowHealthLogForm(true); }}><FileText size={16} /> Record Vitals</button>
                    <button className="action-btn delete" onClick={() => setShowDeleteConfirm(patient)}><Trash2 size={16} /> Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="recent-logs">
          <div className="section-header"><h3>Recent Health Records</h3><Clock size={18} /></div>
          {healthLogs.length === 0 ? (
            <div className="empty-state"><p>No health records yet. Record vitals for your patients.</p></div>
          ) : (
            <div className="logs-list">
              {healthLogs.slice(0, 5).map(log => (
                <div key={log._id} className="log-item">
                  <div className="log-patient">{log.patient?.user?.profile?.firstName} {log.patient?.user?.profile?.lastName}</div>
                  <div className="log-vitals">
                    <span>❤️ {log.vitals?.heartRate || '--'} bpm</span>
                    <span>💓 {log.vitals?.bloodPressure?.systolic || '--'}/{log.vitals?.bloodPressure?.diastolic || '--'}</span>
                    <span>🌡️ {log.vitals?.temperature || '--'}°C</span>
                  </div>
                  <div className="log-date">{new Date(log.createdAt).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Add Patient Modal, Delete Modal, Health Log Modal - same as before */}

      {/* Add Patient Modal */}
      {showAddPatient && (
        <div className="modal-overlay" onClick={() => setShowAddPatient(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>Add New Patient</h3><button className="close-btn" onClick={() => setShowAddPatient(false)}>×</button></div>
            <form onSubmit={handleAddPatient}>
              <input type="email" placeholder="Email" value={newPatient.email} onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })} required />
              <input type="text" placeholder="First Name" value={newPatient.firstName} onChange={(e) => setNewPatient({ ...newPatient, firstName: e.target.value })} required />
              <input type="text" placeholder="Last Name" value={newPatient.lastName} onChange={(e) => setNewPatient({ ...newPatient, lastName: e.target.value })} required />
              <select value={newPatient.bloodType} onChange={(e) => setNewPatient({ ...newPatient, bloodType: e.target.value })}>
                <option value="">Select Blood Type</option>
                <option value="A+">A+</option><option value="A-">A-</option><option value="B+">B+</option>
                <option value="B-">B-</option><option value="O+">O+</option><option value="O-">O-</option>
                <option value="AB+">AB+</option><option value="AB-">AB-</option>
              </select>
              <div className="allergies-section">
                <label>Allergies</label>
                {newPatient.allergies.map((allergy, index) => (<input key={index} type="text" placeholder="Allergy" value={allergy} onChange={(e) => { const updated = [...newPatient.allergies]; updated[index] = e.target.value; setNewPatient({ ...newPatient, allergies: updated }); }} />))}
                <button type="button" onClick={() => setNewPatient({ ...newPatient, allergies: [...newPatient.allergies, ''] })} className="add-btn">+ Add Allergy</button>
              </div>
              <div className="modal-actions"><button type="button" onClick={() => setShowAddPatient(false)}>Cancel</button><button type="submit">Add Patient</button></div>
            </form>
          </div>
        </div>
      )}

      {/* Health Log Modal */}
      {showHealthLogForm && selectedPatient && (
        <div className="modal-overlay" onClick={() => setShowHealthLogForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>Record Vitals for {selectedPatient.user?.profile?.firstName}</h3><button className="close-btn" onClick={() => setShowHealthLogForm(false)}>×</button></div>
            <form onSubmit={handleAddHealthLog}>
              <div className="vitals-row">
                <input type="number" placeholder="Heart Rate (bpm)" value={healthLog.heartRate} onChange={(e) => setHealthLog({ ...healthLog, heartRate: e.target.value })} required />
                <input type="number" placeholder="Systolic BP" value={healthLog.systolicBP} onChange={(e) => setHealthLog({ ...healthLog, systolicBP: e.target.value })} required />
                <input type="number" placeholder="Diastolic BP" value={healthLog.diastolicBP} onChange={(e) => setHealthLog({ ...healthLog, diastolicBP: e.target.value })} required />
              </div>
              <div className="vitals-row">
                <input type="number" step="0.1" placeholder="Temperature (°C)" value={healthLog.temperature} onChange={(e) => setHealthLog({ ...healthLog, temperature: e.target.value })} />
                <input type="number" placeholder="O2 Saturation (%)" value={healthLog.oxygenSaturation} onChange={(e) => setHealthLog({ ...healthLog, oxygenSaturation: e.target.value })} />
              </div>
              <textarea placeholder="Additional Notes" value={healthLog.notes} onChange={(e) => setHealthLog({ ...healthLog, notes: e.target.value })} rows="3" />
              <div className="modal-actions"><button type="button" onClick={() => setShowHealthLogForm(false)}>Cancel</button><button type="submit">Save Vitals</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;