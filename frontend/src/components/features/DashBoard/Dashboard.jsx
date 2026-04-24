import React, { useState, useEffect } from 'react';
import Card from '../../common/Card/Card';
import Button from '../../common/Button/Button';
import './Dashboard.css';

const Dashboard = () => {
  // Mock Data - In real app, fetch from API
  const [stats, setStats] = useState({
    totalPatients: 1248,
    critical: 14,
    recovered: 850
  });

  // Mock Analysis Data
  const diseaseData = [
    { label: 'Diabetes', percent: 35, color: '#EF4444' }, // Red
    { label: 'Hypertension', percent: 25, color: '#F59E0B' }, // Orange
    { label: 'Healthy', percent: 40, color: '#10B981' }, // Green
  ];

  const recentLogs = [
    { id: 1, patient: 'Sarah Connor', type: 'BP', value: '140/90', status: 'warning', time: '10m' },
    { id: 2, patient: 'John Doe', type: 'Heart Rate', value: '110bpm', status: 'danger', time: '25m' },
    { id: 3, patient: 'Tony Stark', type: 'Glucose', value: '95mg/dL', status: 'success', time: '1h' },
  ];

  return (
    <div className="dashboard-container fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Dashboard Overview</h1>
          <p className="text-sm">Welcome back, Dr. {localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).profile.firstName : 'User'}</p>
        </div>
        <Button variant="primary">+ New Log Entry</Button>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard label="Total Patients" value={stats.totalPatients} icon="👥" color="navy" />
        <StatCard label="Critical Cases" value={stats.critical} icon="⚠️" color="red" />
        <StatCard label="Recovered/Healthy" value={stats.recovered} icon="✅" color="green" />
        <StatCard label="Pending Reviews" value="12" icon="📋" color="orange" />
      </div>

      {/* Main Content Grid */}
      <div className="content-grid">
        
        {/* Analysis Feature (Pie Chart) */}
        <Card title="Population Health Analysis" className="analysis-card">
          <div className="analysis-layout">
            <div className="pie-chart-wrapper">
              <div 
                className="pie-chart" 
                style={{
                  background: `conic-gradient(
                    ${diseaseData[0].color} 0% ${diseaseData[0].percent}%, 
                    ${diseaseData[1].color} ${diseaseData[0].percent}% ${diseaseData[0].percent + diseaseData[1].percent}%, 
                    ${diseaseData[2].color} ${diseaseData[0].percent + diseaseData[1].percent}% 100%
                  )`
                }}
              ></div>
              <div className="pie-legend">
                {diseaseData.map((d, i) => (
                  <div key={i} className="legend-item">
                    <span className="legend-dot" style={{ background: d.color }}></span>
                    <span>{d.label} ({d.percent}%)</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="analysis-insight">
              <h4>Insights</h4>
              <p className="text-sm">Diabetes prevalence has increased by 2% compared to last month. Recommended action: Review dietary plans for at-risk patients.</p>
              <Button variant="outline" size="sm" className="mt-4">View Full Report</Button>
            </div>
          </div>
        </Card>

        {/* Recent Activity Table */}
        <Card title="Recent Health Logs" className="logs-card">
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Vitals</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {recentLogs.map(log => (
                  <tr key={log.id}>
                    <td className="patient-cell">
                      <div className="avatar-xs">{log.patient[0]}</div>
                      {log.patient}
                    </td>
                    <td>{log.type}: <strong>{log.value}</strong></td>
                    <td><span className={`badge badge-${log.status}`}>{log.status}</span></td>
                    <td className="text-sm">{log.time} ago</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

// Helper Component for Stats
const StatCard = ({ label, value, icon, color }) => (
  <div className={`stat-card stat-${color}`}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-info">
      <p className="text-sm label">{label}</p>
      <h3 className="value">{value}</h3>
    </div>
  </div>
);

export default Dashboard;