import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Activity, 
  Thermometer, 
  Droplet, 
  Calendar, 
  Clock, 
  TrendingUp, 
  Download, 
  Share2, 
  AlertCircle,
  LogOut,
  FileText,
  User
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import Button from '../../common/Button/Button';
import api from '../../../utils/api';
import './PatientDashboard.css';

const PatientDashboard = () => {
  const [patientData, setPatientData] = useState(null);
  const [healthLogs, setHealthLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchPatientData();
  }, []);

  const fetchPatientData = async () => {
    try {
      const patientsRes = await api.get('/patients');
      const patientRecord = patientsRes.data.find(p => p.user?._id === user?.id);
      
      if (patientRecord) {
        setPatientData(patientRecord);
        const logsRes = await api.get(`/health-logs?patientId=${patientRecord._id}`);
        setHealthLogs(logsRes.data);
      }
    } catch (error) {
      console.error('Error fetching patient data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShareWithDoctor = () => {
    alert(`Data sharing request sent to ${shareEmail}`);
    setShowShareModal(false);
    setShareEmail('');
  };

  const downloadReport = () => {
    const reportData = {
      patient: `${user?.profile?.firstName} ${user?.profile?.lastName}`,
      email: user?.email,
      healthRecords: healthLogs.map(log => ({
        date: new Date(log.createdAt).toLocaleDateString(),
        heartRate: log.vitals?.heartRate,
        bloodPressure: log.vitals?.bloodPressure,
        temperature: log.vitals?.temperature,
        oxygenSaturation: log.vitals?.oxygenSaturation,
        notes: log.notes
      }))
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `aegis_health_report_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    window.location.href = '/';
  };

  const chartData = healthLogs.slice().reverse().slice(0, 30).map(log => ({
    date: new Date(log.createdAt).toLocaleDateString(),
    heartRate: log.vitals?.heartRate || 0,
    systolic: log.vitals?.bloodPressure?.systolic || 0,
    diastolic: log.vitals?.bloodPressure?.diastolic || 0,
    temperature: log.vitals?.temperature || 0
  }));

  const latestVitals = healthLogs[0]?.vitals || {
    heartRate: 0,
    bloodPressure: { systolic: 0, diastolic: 0 },
    temperature: 0,
    oxygenSaturation: 0
  };

  const vitalCards = [
    { 
      title: 'Heart Rate', 
      value: latestVitals.heartRate || '--', 
      unit: 'bpm', 
      icon: <Heart size={24} />,
      normal: '60-100',
      status: latestVitals.heartRate >= 60 && latestVitals.heartRate <= 100 ? 'normal' : 'warning'
    },
    { 
      title: 'Blood Pressure', 
      value: `${latestVitals.bloodPressure?.systolic || '--'}/${latestVitals.bloodPressure?.diastolic || '--'}`, 
      unit: 'mmHg', 
      icon: <Activity size={24} />,
      normal: '120/80',
      status: latestVitals.bloodPressure?.systolic <= 120 ? 'normal' : 'warning'
    },
    { 
      title: 'Temperature', 
      value: latestVitals.temperature || '--', 
      unit: '°C', 
      icon: <Thermometer size={24} />,
      normal: '36.5-37.5',
      status: latestVitals.temperature >= 36.5 && latestVitals.temperature <= 37.5 ? 'normal' : 'warning'
    },
    { 
      title: 'O₂ Saturation', 
      value: latestVitals.oxygenSaturation || '--', 
      unit: '%', 
      icon: <Droplet size={24} />,
      normal: '95-100',
      status: latestVitals.oxygenSaturation >= 95 ? 'normal' : 'warning'
    }
  ];

  return (
    <div className="patient-dashboard">
      {/* Header */}
      <header className="dashboard-header-bar">
        <div className="header-logo">
          <Heart size={28} strokeWidth={1.5} />
          <span>AEGIS</span>
        </div>
        <nav className="header-nav">
          <button className={`nav-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            Overview
          </button>
          <button className={`nav-btn ${activeTab === 'vitals' ? 'active' : ''}`} onClick={() => setActiveTab('vitals')}>
            Vitals
          </button>
          <button className={`nav-btn ${activeTab === 'records' ? 'active' : ''}`} onClick={() => setActiveTab('records')}>
            Records
          </button>
        </nav>
        <div className="header-user">
          <span className="user-name">{user?.profile?.firstName || 'Patient'}</span>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-welcome">
          <h1>Welcome back, {user?.profile?.firstName || 'Patient'}</h1>
          <p>Track your health journey and stay informed about your wellness.</p>
        </div>

        {/* Vitals Grid */}
        <div className="vitals-grid">
          {vitalCards.map((vital, index) => (
            <div key={index} className={`vital-card ${vital.status}`}>
              <div className="vital-icon">{vital.icon}</div>
              <div className="vital-info">
                <h3>{vital.title}</h3>
                <div className="vital-value">
                  {vital.value} <span className="vital-unit">{vital.unit}</span>
                </div>
                <div className="vital-normal">Normal: {vital.normal}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <Button variant="outline" size="md" onClick={downloadReport}>
            <Download size={16} />
            Download Health Report
          </Button>
          <Button variant="primary" size="md" onClick={() => setShowShareModal(true)}>
            <Share2 size={16} />
            Share with Healthcare Provider
          </Button>
        </div>

        {/* Health Trends Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Health Trends (Last 30 Days)</h3>
            <TrendingUp size={18} className="trend-icon" />
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="date" stroke="#64748B" />
                <YAxis stroke="#64748B" />
                <Tooltip />
                <Area type="monotone" dataKey="heartRate" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data">
              <AlertCircle size={48} />
              <p>No health data available yet</p>
              <p className="small">Share your health records with your doctor to start tracking</p>
            </div>
          )}
        </div>

        {/* Recent Health Records */}
        <div className="recent-logs">
          <div className="section-header">
            <h3>Recent Health Records</h3>
            <Calendar size={18} />
          </div>
          {healthLogs.length === 0 ? (
            <div className="empty-state">
              <p>No health records found</p>
            </div>
          ) : (
            <div className="logs-list">
              {healthLogs.slice(0, 5).map(log => (
                <div key={log._id} className="log-item">
                  <div className="log-date">
                    {new Date(log.createdAt).toLocaleDateString()}
                  </div>
                  <div className="log-vitals">
                    <span>❤️ {log.vitals?.heartRate || '--'} bpm</span>
                    <span>💓 {log.vitals?.bloodPressure?.systolic || '--'}/{log.vitals?.bloodPressure?.diastolic || '--'}</span>
                    <span>🌡️ {log.vitals?.temperature || '--'}°C</span>
                    <span>🫁 {log.vitals?.oxygenSaturation || '--'}%</span>
                  </div>
                  {log.notes && (
                    <div className="log-notes">{log.notes}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Share Modal */}
      {showShareModal && (
        <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Share Health Data</h3>
              <button className="close-btn" onClick={() => setShowShareModal(false)}>×</button>
            </div>
            <div className="share-info">
              <p>Your health records will be shared securely with your healthcare provider.</p>
            </div>
            <input 
              type="email" 
              placeholder="Doctor's Email Address" 
              value={shareEmail}
              onChange={(e) => setShareEmail(e.target.value)}
            />
            <div className="modal-actions">
              <button onClick={() => setShowShareModal(false)}>Cancel</button>
              <button onClick={handleShareWithDoctor}>Share Data</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;