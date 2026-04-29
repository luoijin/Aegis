import React, { useState, useEffect } from 'react';
import { 
  Users, Activity, Heart, Thermometer, Droplet, 
  Calendar, Clock, TrendingUp, FileText, LogOut,
  Stethoscope, Search, Plus, Eye, Trash2,
  AlertCircle, CheckCircle, Download
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import Button from '../../common/Button/Button';
import api from '../../../utils/api';
import './DoctorDashboard.css';

const DoctorDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [healthLogs, setHealthLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showVitalsForm, setShowVitalsForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState(null);
  
  const [vitals, setVitals] = useState({
    heartRate: '',
    systolicBP: '',
    diastolicBP: '',
    temperature: '',
    oxygenSaturation: '',
    notes: ''
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [patientsRes, logsRes] = await Promise.all([
        api.get('/patients'),
        api.get('/health-logs')
      ]);
      setPatients(patientsRes.data);
      setHealthLogs(logsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPatient = async (patient) => {
    setSelectedPatient(patient);
    try {
      const logsRes = await api.get(`/health-logs?patientId=${patient._id}`);
      setHealthLogs(logsRes.data);
    } catch (error) {
      console.error('Error fetching health logs:', error);
    }
  };

  const handleRecordVitals = async (e) => {
    e.preventDefault();
    if (!selectedPatient) return;
    
    try {
      await api.post('/health-logs', {
        patient: selectedPatient._id,
        vitals: {
          heartRate: parseInt(vitals.heartRate),
          bloodPressure: {
            systolic: parseInt(vitals.systolicBP),
            diastolic: parseInt(vitals.diastolicBP)
          },
          temperature: vitals.temperature ? parseFloat(vitals.temperature) : null,
          oxygenSaturation: vitals.oxygenSaturation ? parseInt(vitals.oxygenSaturation) : null
        },
        notes: vitals.notes
      });
      
      setShowVitalsForm(false);
      setVitals({ heartRate: '', systolicBP: '', diastolicBP: '', temperature: '', oxygenSaturation: '', notes: '' });
      
      // Refresh health logs
      const logsRes = await api.get(`/health-logs?patientId=${selectedPatient._id}`);
      setHealthLogs(logsRes.data);
      
    } catch (error) {
      console.error('Error recording vitals:', error);
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
    p.user?.profile?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Prepare chart data
  const chartData = healthLogs.slice().reverse().slice(0, 30).map(log => ({
    date: new Date(log.createdAt).toLocaleDateString(),
    heartRate: log.vitals?.heartRate || 0,
    systolic: log.vitals?.bloodPressure?.systolic || 0,
    diastolic: log.vitals?.bloodPressure?.diastolic || 0
  }));

  const latestVitals = healthLogs[0]?.vitals;

  return (
    <div className="doctor-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-logo">
          <Stethoscope size={28} />
          <span>AEGIS</span>
        </div>
        <div className="header-user">
          <span>Dr. {user?.profile?.firstName || 'Doctor'}</span>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <div className="dashboard-container">
        {/* Patients Sidebar */}
        <div className="patients-sidebar">
          <div className="sidebar-header">
            <h3>My Patients</h3>
            <div className="search-box">
              <Search size={16} />
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="patients-list">
            {loading ? (
              <div className="loading">Loading...</div>
            ) : filteredPatients.length === 0 ? (
              <div className="empty">No patients found</div>
            ) : (
              filteredPatients.map(patient => (
                <div 
                  key={patient._id} 
                  className={`patient-item ${selectedPatient?._id === patient._id ? 'active' : ''}`}
                  onClick={() => handleSelectPatient(patient)}
                >
                  <div className="patient-avatar">
                    {patient.user?.profile?.firstName?.[0]}{patient.user?.profile?.lastName?.[0]}
                  </div>
                  <div className="patient-info">
                    <div className="patient-name">
                      {patient.user?.profile?.firstName} {patient.user?.profile?.lastName}
                    </div>
                    <div className="patient-last-visit">
                      Last: {healthLogs.find(l => l.patient?._id === patient._id)?.createdAt 
                        ? new Date(healthLogs.find(l => l.patient?._id === patient._id).createdAt).toLocaleDateString() 
                        : 'No records'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {selectedPatient ? (
            <>
              {/* Patient Header */}
              <div className="patient-header">
                <div className="patient-header-info">
                  <div className="patient-header-avatar">
                    {selectedPatient.user?.profile?.firstName?.[0]}{selectedPatient.user?.profile?.lastName?.[0]}
                  </div>
                  <div>
                    <h2>{selectedPatient.user?.profile?.firstName} {selectedPatient.user?.profile?.lastName}</h2>
                    <p>{selectedPatient.user?.email}</p>
                  </div>
                </div>
                <Button variant="primary" onClick={() => setShowVitalsForm(true)}>
                  <Plus size={16} /> Record Vitals
                </Button>
              </div>

              {/* Latest Vitals */}
              <div className="vitals-grid">
                <div className="vital-card">
                  <Heart size={24} />
                  <div>
                    <div className="vital-label">Heart Rate</div>
                    <div className="vital-value">{latestVitals?.heartRate || '--'} <span>bpm</span></div>
                  </div>
                </div>
                <div className="vital-card">
                  <Activity size={24} />
                  <div>
                    <div className="vital-label">Blood Pressure</div>
                    <div className="vital-value">
                      {latestVitals?.bloodPressure?.systolic || '--'}/{latestVitals?.bloodPressure?.diastolic || '--'} <span>mmHg</span>
                    </div>
                  </div>
                </div>
                <div className="vital-card">
                  <Thermometer size={24} />
                  <div>
                    <div className="vital-label">Temperature</div>
                    <div className="vital-value">{latestVitals?.temperature || '--'} <span>°C</span></div>
                  </div>
                </div>
                <div className="vital-card">
                  <Droplet size={24} />
                  <div>
                    <div className="vital-label">O2 Saturation</div>
                    <div className="vital-value">{latestVitals?.oxygenSaturation || '--'} <span>%</span></div>
                  </div>
                </div>
              </div>

              {/* Health Trends Chart */}
              <div className="chart-container">
                <h3>Heart Rate Trends (Last 30 Days)</h3>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="date" stroke="#64748B" />
                      <YAxis stroke="#64748B" />
                      <Tooltip />
                      <Area type="monotone" dataKey="heartRate" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.1} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="no-data">No health data available</div>
                )}
              </div>

              {/* Health History Table */}
              <div className="history-container">
                <h3>Health History</h3>
                <div className="history-table">
                  {healthLogs.length === 0 ? (
                    <div className="no-data">No health records found</div>
                  ) : (
                    <table>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Heart Rate</th>
                          <th>Blood Pressure</th>
                          <th>Temperature</th>
                          <th>O2 Sat</th>
                          <th>Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {healthLogs.slice(0, 10).map(log => (
                          <tr key={log._id}>
                            <td>{new Date(log.createdAt).toLocaleDateString()}</td>
                            <td>{log.vitals?.heartRate || '--'} bpm</td>
                            <td>{log.vitals?.bloodPressure?.systolic || '--'}/{log.vitals?.bloodPressure?.diastolic || '--'}</td>
                            <td>{log.vitals?.temperature || '--'} °C</td>
                            <td>{log.vitals?.oxygenSaturation || '--'}%</td>
                            <td className="notes-cell">{log.notes || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="no-selection">
              <Stethoscope size={64} />
              <h3>Select a Patient</h3>
              <p>Choose a patient from the list to view their health records and record vitals.</p>
            </div>
          )}
        </div>
      </div>

      {/* Record Vitals Modal */}
      {showVitalsForm && selectedPatient && (
        <div className="modal-overlay" onClick={() => setShowVitalsForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Record Vitals for {selectedPatient.user?.profile?.firstName}</h3>
              <button className="close-btn" onClick={() => setShowVitalsForm(false)}>×</button>
            </div>
            <form onSubmit={handleRecordVitals}>
              <div className="vitals-form-row">
                <div className="form-group">
                  <label>Heart Rate (bpm)</label>
                  <input type="number" placeholder="60-100" value={vitals.heartRate} onChange={(e) => setVitals({...vitals, heartRate: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Systolic BP</label>
                  <input type="number" placeholder="120" value={vitals.systolicBP} onChange={(e) => setVitals({...vitals, systolicBP: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Diastolic BP</label>
                  <input type="number" placeholder="80" value={vitals.diastolicBP} onChange={(e) => setVitals({...vitals, diastolicBP: e.target.value})} required />
                </div>
              </div>
              <div className="vitals-form-row">
                <div className="form-group">
                  <label>Temperature (°C)</label>
                  <input type="number" step="0.1" placeholder="36.5" value={vitals.temperature} onChange={(e) => setVitals({...vitals, temperature: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>O2 Saturation (%)</label>
                  <input type="number" placeholder="95-100" value={vitals.oxygenSaturation} onChange={(e) => setVitals({...vitals, oxygenSaturation: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea placeholder="Additional notes..." value={vitals.notes} onChange={(e) => setVitals({...vitals, notes: e.target.value})} rows="3" />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowVitalsForm(false)}>Cancel</button>
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