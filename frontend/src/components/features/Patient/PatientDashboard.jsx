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
  AlertCircle,
  LogOut,
  Stethoscope,
  ChevronRight,
  User,
  Mail,
  Phone,
  FileText
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
  const [assignedDoctor, setAssignedDoctor] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalRecords: 0,
    averageHeartRate: 0,
    lastCheckup: null,
    healthStatus: 'Good'
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchPatientData();
  }, []);

  const fetchPatientData = async () => {
    setLoading(true);
    try {
      // Get patient record
      const patientsRes = await api.get('/patients');
      const patientRecord = patientsRes.data.find(p => p.user?._id === user?.id);
      
      if (patientRecord) {
        setPatientData(patientRecord);
        
        // Get assigned doctor info
        if (patientRecord.assignedDoctor) {
          try {
            const doctorRes = await api.get(`/users/${patientRecord.assignedDoctor}`);
            setAssignedDoctor(doctorRes.data);
          } catch (err) {
            console.error('Error fetching doctor:', err);
          }
        }
        
        // Get health logs
        const logsRes = await api.get(`/health-logs?patientId=${patientRecord._id}`);
        setHealthLogs(logsRes.data);
        
        // Calculate stats
        const heartRates = logsRes.data.map(log => log.vitals?.heartRate).filter(v => v);
        const avgHeartRate = heartRates.length > 0 
          ? Math.round(heartRates.reduce((a, b) => a + b, 0) / heartRates.length) 
          : 0;
        
        setStats({
          totalRecords: logsRes.data.length,
          averageHeartRate: avgHeartRate,
          lastCheckup: logsRes.data[0]?.createdAt || null,
          healthStatus: determineHealthStatus(logsRes.data)
        });
      }
    } catch (error) {
      console.error('Error fetching patient data:', error);
    } finally {
      setLoading(false);
    }
  };

  const determineHealthStatus = (logs) => {
    if (logs.length === 0) return 'No Data';
    const recentLogs = logs.slice(0, 5);
    const hasWarning = recentLogs.some(log => log.status === 'warning');
    const hasCritical = recentLogs.some(log => log.status === 'critical');
    if (hasCritical) return 'Critical - Needs Attention';
    if (hasWarning) return 'Monitor Required';
    return 'Stable - Good';
  };

  const downloadReport = () => {
    const reportData = {
      patient: `${user?.profile?.firstName} ${user?.profile?.lastName}`,
      email: user?.email,
      primaryDoctor: assignedDoctor ? `Dr. ${assignedDoctor.profile?.firstName} ${assignedDoctor.profile?.lastName}` : 'None assigned',
      healthSummary: stats,
      healthRecords: healthLogs.map(log => ({
        date: new Date(log.createdAt).toLocaleDateString(),
        recordedBy: `Dr. ${log.recordedBy?.profile?.firstName} ${log.recordedBy?.profile?.lastName}`,
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
      status: latestVitals.heartRate >= 60 && latestVitals.heartRate <= 100 ? 'normal' : 'warning',
      color: '#3B82F6'
    },
    { 
      title: 'Blood Pressure', 
      value: `${latestVitals.bloodPressure?.systolic || '--'}/${latestVitals.bloodPressure?.diastolic || '--'}`, 
      unit: 'mmHg', 
      icon: <Activity size={24} />,
      normal: '120/80',
      status: latestVitals.bloodPressure?.systolic <= 120 ? 'normal' : 'warning',
      color: '#10B981'
    },
    { 
      title: 'Temperature', 
      value: latestVitals.temperature || '--', 
      unit: '°C', 
      icon: <Thermometer size={24} />,
      normal: '36.5-37.5',
      status: latestVitals.temperature >= 36.5 && latestVitals.temperature <= 37.5 ? 'normal' : 'warning',
      color: '#F59E0B'
    },
    { 
      title: 'O₂ Saturation', 
      value: latestVitals.oxygenSaturation || '--', 
      unit: '%', 
      icon: <Droplet size={24} />,
      normal: '95-100',
      status: latestVitals.oxygenSaturation >= 95 ? 'normal' : 'warning',
      color: '#8B5CF6'
    }
  ];

  const getHealthStatusColor = () => {
    if (stats.healthStatus.includes('Critical')) return '#EF4444';
    if (stats.healthStatus.includes('Monitor')) return '#F59E0B';
    return '#10B981';
  };

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
            Health Data
          </button>
          <button className={`nav-btn ${activeTab === 'records' ? 'active' : ''}`} onClick={() => setActiveTab('records')}>
            Medical Records
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
        {/* Welcome Section */}
        <div className="dashboard-welcome">
          <div>
            <h1>Welcome back, {user?.profile?.firstName || 'Patient'}</h1>
            <p>Track your health journey and view your medical records.</p>
          </div>
          <div className="health-status-badge" style={{ background: getHealthStatusColor() + '20', color: getHealthStatusColor() }}>
            <span className="status-dot" style={{ background: getHealthStatusColor() }}></span>
            {stats.healthStatus}
          </div>
        </div>

        {/* Stats Overview Cards */}
        <div className="patient-stats-grid">
          <div className="patient-stat-card">
            <div className="stat-icon blue"><FileText size={20} /></div>
            <div className="stat-info">
              <h4>Total Records</h4>
              <p className="stat-number">{stats.totalRecords}</p>
            </div>
          </div>
          <div className="patient-stat-card">
            <div className="stat-icon green"><Heart size={20} /></div>
            <div className="stat-info">
              <h4>Avg Heart Rate</h4>
              <p className="stat-number">{stats.averageHeartRate || '--'} bpm</p>
            </div>
          </div>
          <div className="patient-stat-card">
            <div className="stat-icon purple"><Calendar size={20} /></div>
            <div className="stat-info">
              <h4>Last Checkup</h4>
              <p className="stat-number">{stats.lastCheckup ? new Date(stats.lastCheckup).toLocaleDateString() : '--'}</p>
            </div>
          </div>
        </div>

        {/* Assigned Doctor Info */}
        {assignedDoctor && (
          <div className="doctor-info-card">
            <div className="doctor-info-content">
              <Stethoscope size={24} className="doctor-icon" />
              <div>
                <div className="doctor-label">Your Primary Care Physician</div>
                <div className="doctor-name">Dr. {assignedDoctor.profile?.firstName} {assignedDoctor.profile?.lastName}</div>
                <div className="doctor-email">{assignedDoctor.email}</div>
              </div>
            </div>
          </div>
        )}

        {/* Vitals Grid */}
        <div className="vitals-grid">
          {vitalCards.map((vital, index) => (
            <div key={index} className={`vital-card ${vital.status}`}>
              <div className="vital-icon" style={{ color: vital.color }}>{vital.icon}</div>
              <div className="vital-info">
                <h3>{vital.title}</h3>
                <div className="vital-value">
                  {vital.value} <span className="vital-unit">{vital.unit}</span>
                </div>
                <div className="vital-normal">Normal Range: {vital.normal}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <Button variant="outline" onClick={downloadReport}>
            <Download size={16} />
            Download Health Report
          </Button>
        </div>

        {/* Health Trends Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Heart Rate Trends (Last 30 Days)</h3>
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
              <p className="small">Your doctor will add health records during your consultations</p>
            </div>
          )}
        </div>

        {/* Recent Health Records */}
        <div className="recent-logs">
          <div className="section-header">
            <h3>Recent Health Records</h3>
            <div className="header-stats">
              <span className="total-records">📋 Total: {healthLogs.length} records</span>
              <Calendar size={18} />
            </div>
          </div>
          {loading ? (
            <div className="loading-state">Loading your health records...</div>
          ) : healthLogs.length === 0 ? (
            <div className="empty-state">
              <p>No health records found</p>
              <p className="small">When your doctor records your vitals, they will appear here</p>
            </div>
          ) : (
            <div className="logs-list">
              {healthLogs.slice(0, 10).map(log => (
                <div key={log._id} className={`log-item log-status-${log.status || 'normal'}`}>
                  <div className="log-header">
                    <div className="log-date">
                      <Calendar size={14} />
                      {new Date(log.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                    <div className="log-doctor">
                      <Stethoscope size={12} />
                      Dr. {log.recordedBy?.profile?.firstName} {log.recordedBy?.profile?.lastName}
                    </div>
                    <div className={`log-status status-${log.status || 'normal'}`}>
                      {log.status === 'critical' ? '⚠️ Critical' : log.status === 'warning' ? '⚠️ Warning' : '✅ Normal'}
                    </div>
                  </div>
                  <div className="log-vitals">
                    <div className="vital-detail">
                      <Heart size={14} />
                      <span>HR: {log.vitals?.heartRate || '--'} bpm</span>
                    </div>
                    <div className="vital-detail">
                      <Activity size={14} />
                      <span>BP: {log.vitals?.bloodPressure?.systolic || '--'}/{log.vitals?.bloodPressure?.diastolic || '--'}</span>
                    </div>
                    <div className="vital-detail">
                      <Thermometer size={14} />
                      <span>Temp: {log.vitals?.temperature || '--'}°C</span>
                    </div>
                    <div className="vital-detail">
                      <Droplet size={14} />
                      <span>O2: {log.vitals?.oxygenSaturation || '--'}%</span>
                    </div>
                  </div>
                  {log.notes && (
                    <div className="log-notes">
                      <FileText size={14} />
                      <span>{log.notes}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PatientDashboard;