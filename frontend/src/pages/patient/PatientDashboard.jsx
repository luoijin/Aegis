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
  User,
  Mail,
  Phone,
  FileText,
  Eye,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import Button from '../../common/Button/Button';
import api from '../../../utils/api';
import Notifications from './Notifications';
import './PatientDashboard.css';

const PatientDashboard = () => {
  const [patientData, setPatientData] = useState(null);
  const [healthLogs, setHealthLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [assignedDoctor, setAssignedDoctor] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('month');
  const [stats, setStats] = useState({
    totalRecords: 0,
    averageHeartRate: 0,
    averageBP: { systolic: 0, diastolic: 0 },
    lastCheckup: null,
    healthStatus: 'Good',
    trends: {
      heartRate: 'stable',
      bloodPressure: 'stable',
      temperature: 'stable'
    }
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
      const patientsRes = await api.get('/patients');
      const patientRecord = patientsRes.data.find(p => p.user?._id === user?.id);
      
      if (patientRecord) {
        setPatientData(patientRecord);
        
        if (patientRecord.assignedDoctor) {
          try {
            const doctorRes = await api.get('/users/' + patientRecord.assignedDoctor);
            setAssignedDoctor(doctorRes.data);
          } catch (err) {
            console.error('Error fetching doctor:', err);
          }
        }
        
        const logsRes = await api.get('/health-logs?patientId=' + patientRecord._id);
        setHealthLogs(logsRes.data);
        
        // Calculate comprehensive stats
        const heartRates = logsRes.data.map(log => log.vitals?.heartRate).filter(v => v);
        const bpSystolic = logsRes.data.map(log => log.vitals?.bloodPressure?.systolic).filter(v => v);
        const bpDiastolic = logsRes.data.map(log => log.vitals?.bloodPressure?.diastolic).filter(v => v);
        const temperatures = logsRes.data.map(log => log.vitals?.temperature).filter(v => v);
        
        const avgHeartRate = heartRates.length > 0 
          ? Math.round(heartRates.reduce((a, b) => a + b, 0) / heartRates.length) 
          : 0;
        
        // Calculate trends
        const recentLogs = logsRes.data.slice(0, 5);
        const olderLogs = logsRes.data.slice(5, 10);
        
        const getTrend = (recent, older) => {
          if (recent.length === 0 || older.length === 0) return 'stable';
          const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
          const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
          if (recentAvg > olderAvg * 1.05) return 'increasing';
          if (recentAvg < olderAvg * 0.95) return 'decreasing';
          return 'stable';
        };
        
        setStats({
          totalRecords: logsRes.data.length,
          averageHeartRate: avgHeartRate,
          averageBP: {
            systolic: bpSystolic.length > 0 ? Math.round(bpSystolic.reduce((a, b) => a + b, 0) / bpSystolic.length) : 0,
            diastolic: bpDiastolic.length > 0 ? Math.round(bpDiastolic.reduce((a, b) => a + b, 0) / bpDiastolic.length) : 0
          },
          lastCheckup: logsRes.data[0]?.createdAt || null,
          healthStatus: determineHealthStatus(logsRes.data),
          trends: {
            heartRate: getTrend(heartRates.slice(0, 5), heartRates.slice(5, 10)),
            bloodPressure: getTrend(bpSystolic.slice(0, 5), bpSystolic.slice(5, 10)),
            temperature: getTrend(temperatures.slice(0, 5), temperatures.slice(5, 10))
          }
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
      patient: (user?.profile?.firstName || '') + ' ' + (user?.profile?.lastName || ''),
      email: user?.email,
      primaryDoctor: assignedDoctor ? 'Dr. ' + (assignedDoctor.profile?.firstName || '') + ' ' + (assignedDoctor.profile?.lastName || '') : 'None assigned',
      healthSummary: stats,
      healthRecords: healthLogs.map(log => ({
        date: new Date(log.createdAt).toLocaleDateString(),
        recordedBy: 'Dr. ' + (log.recordedBy?.profile?.firstName || '') + ' ' + (log.recordedBy?.profile?.lastName || ''),
        heartRate: log.vitals?.heartRate,
        bloodPressure: log.vitals?.bloodPressure,
        temperature: log.vitals?.temperature,
        oxygenSaturation: log.vitals?.oxygenSaturation,
        notes: log.notes
      }))
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = 'aegis_health_report_' + new Date().toISOString().split('T')[0] + '.json';
    
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

  const getChartData = () => {
    let data = [...healthLogs];
    if (timeRange === 'week') {
      data = data.slice(0, 7);
    } else if (timeRange === 'month') {
      data = data.slice(0, 30);
    }
    return data.reverse().map(log => ({
      date: new Date(log.createdAt).toLocaleDateString(),
      heartRate: log.vitals?.heartRate || 0,
      systolic: log.vitals?.bloodPressure?.systolic || 0,
      diastolic: log.vitals?.bloodPressure?.diastolic || 0,
      temperature: log.vitals?.temperature || 0
    }));
  };

  const getTrendIcon = (trend) => {
    if (trend === 'increasing') return <ArrowUp size={14} className="trend-up" />;
    if (trend === 'decreasing') return <ArrowDown size={14} className="trend-down" />;
    return null;
  };

  const chartData = getChartData();
  const latestVitals = healthLogs[0]?.vitals || null;

  const vitalCards = [
    { 
      title: 'Heart Rate', 
      value: latestVitals?.heartRate || '--', 
      unit: 'bpm', 
      icon: <Heart size={24} />,
      normal: '60-100',
      status: (latestVitals?.heartRate >= 60 && latestVitals?.heartRate <= 100) ? 'normal' : (latestVitals?.heartRate ? 'warning' : 'normal'),
      color: '#EF4444',
      trend: stats.trends.heartRate
    },
    { 
      title: 'Blood Pressure', 
      value: latestVitals ? (latestVitals.bloodPressure?.systolic || '--') + '/' + (latestVitals.bloodPressure?.diastolic || '--') : '--/--', 
      unit: 'mmHg', 
      icon: <Activity size={24} />,
      normal: '120/80',
      status: (latestVitals?.bloodPressure?.systolic <= 120) ? 'normal' : 'warning',
      color: '#3B82F6',
      trend: stats.trends.bloodPressure
    },
    { 
      title: 'Temperature', 
      value: latestVitals?.temperature || '--', 
      unit: '°C', 
      icon: <Thermometer size={24} />,
      normal: '36.5-37.5',
      status: (latestVitals?.temperature >= 36.5 && latestVitals?.temperature <= 37.5) ? 'normal' : 'warning',
      color: '#10B981',
      trend: stats.trends.temperature
    },
    { 
      title: 'O₂ Saturation', 
      value: latestVitals?.oxygenSaturation || '--', 
      unit: '%', 
      icon: <Droplet size={24} />,
      normal: '95-100',
      status: (latestVitals?.oxygenSaturation >= 95) ? 'normal' : 'warning',
      color: '#8B5CF6',
      trend: 'stable'
    }
  ];

  const getHealthStatusColor = () => {
    if (stats.healthStatus.includes('Critical')) return '#EF4444';
    if (stats.healthStatus.includes('Monitor')) return '#F59E0B';
    return '#10B981';
  };

  const bpTrendData = chartData.map(d => ({
    date: d.date,
    systolic: d.systolic,
    diastolic: d.diastolic
  }));

  const statusDistribution = [
    { name: 'Critical', value: healthLogs.filter(l => l.status === 'critical').length, color: '#EF4444' },
    { name: 'Warning', value: healthLogs.filter(l => l.status === 'warning').length, color: '#F59E0B' },
    { name: 'Normal', value: healthLogs.filter(l => l.status === 'normal').length, color: '#10B981' }
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
          <button className={'nav-btn ' + (activeTab === 'overview' ? 'active' : '')} onClick={() => setActiveTab('overview')}>
            Overview
          </button>
          <button className={'nav-btn ' + (activeTab === 'vitals' ? 'active' : '')} onClick={() => setActiveTab('vitals')}>
            Health Data
          </button>
          <button className={'nav-btn ' + (activeTab === 'records' ? 'active' : '')} onClick={() => setActiveTab('records')}>
            Medical Records
          </button>
        </nav>
        <div className="header-user">
          {patientData && <Notifications patientId={patientData._id} onNotificationAction={fetchPatientData} />}
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
              {getTrendIcon(stats.trends.heartRate)}
            </div>
          </div>
          <div className="patient-stat-card">
            <div className="stat-icon purple"><Activity size={20} /></div>
            <div className="stat-info">
              <h4>Avg BP</h4>
              <p className="stat-number">{stats.averageBP.systolic || '--'}/{stats.averageBP.diastolic || '--'} mmHg</p>
            </div>
          </div>
          <div className="patient-stat-card">
            <div className="stat-icon orange"><Calendar size={20} /></div>
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
            <div key={index} className={'vital-card ' + vital.status}>
              <div className="vital-icon" style={{ color: vital.color }}>{vital.icon}</div>
              <div className="vital-info">
                <h3>{vital.title}</h3>
                <div className="vital-value">
                  {vital.value} <span className="vital-unit">{vital.unit}</span>
                </div>
                <div className="vital-normal">Normal Range: {vital.normal}</div>
                {vital.trend && vital.trend !== 'stable' && (
                  <div className={'vital-trend ' + vital.trend}>
                    {getTrendIcon(vital.trend)}
                    <span>{vital.trend === 'increasing' ? 'Increasing' : 'Decreasing'}</span>
                  </div>
                )}
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

        {/* Time Range Selector */}
        <div className="time-range-selector">
          <button className={'range-btn ' + (timeRange === 'week' ? 'active' : '')} onClick={() => setTimeRange('week')}>Last Week</button>
          <button className={'range-btn ' + (timeRange === 'month' ? 'active' : '')} onClick={() => setTimeRange('month')}>Last Month</button>
          <button className={'range-btn ' + (timeRange === 'year' ? 'active' : '')} onClick={() => setTimeRange('year')}>Last Year</button>
        </div>

        {/* Health Trends - Heart Rate Chart */}
        {chartData.length > 0 ? (
          <>
            <div className="chart-card">
              <div className="chart-header">
                <h3>Heart Rate Trends</h3>
                <TrendingUp size={18} className="trend-icon" />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="date" stroke="#64748B" />
                  <YAxis stroke="#64748B" />
                  <Tooltip />
                  <Area type="monotone" dataKey="heartRate" stroke="#EF4444" fill="#EF4444" fillOpacity={0.1} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Blood Pressure Trends */}
            <div className="chart-card">
              <div className="chart-header">
                <h3>Blood Pressure Trends</h3>
                <Activity size={18} className="trend-icon" />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={bpTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="date" stroke="#64748B" />
                  <YAxis stroke="#64748B" />
                  <Tooltip />
                  <Line type="monotone" dataKey="systolic" stroke="#3B82F6" strokeWidth={2} />
                  <Line type="monotone" dataKey="diastolic" stroke="#60A5FA" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Health Status Distribution */}
            <div className="chart-card">
              <div className="chart-header">
                <h3>Health Status Distribution</h3>
                <AlertCircle size={18} />
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={statusDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value">
                    {statusDistribution.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="pie-legend">
                {statusDistribution.map((item, idx) => (
                  <div key={idx} className="legend-item">
                    <div className="legend-color" style={{ background: item.color }}></div>
                    <span>{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="no-data">
            <AlertCircle size={48} />
            <p>No health data available yet</p>
            <p className="small">Your doctor will add health records during your consultations</p>
          </div>
        )}

        {/* Recent Health Records */}
        <div className="recent-logs">
          <div className="section-header">
            <h3>Recent Health Records</h3>
            <div className="header-stats">
              <span className="total-records">
                <FileText size={14} /> Total: {healthLogs.length} records
              </span>
              <Calendar size={18} />
            </div>
          </div>
          {loading ? (
            <div className="loading-state">Loading your health records...</div>
          ) : healthLogs.length === 0 ? (
            <div className="empty-state">
              <AlertCircle size={48} />
              <p>No health records found</p>
              <p className="small">When your doctor records your vitals, they will appear here</p>
            </div>
          ) : (
            <div className="logs-list">
              {healthLogs.slice(0, 10).map(log => (
                <div key={log._id} className={'log-item log-status-' + (log.status || 'normal')}>
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
                    <div className={'log-status status-' + (log.status || 'normal')}>
                      {log.status === 'critical' ? 'Critical' : log.status === 'warning' ? 'Warning' : 'Normal'}
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