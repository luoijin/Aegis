import React from 'react';
import { Users, Stethoscope, Mail, Phone, Calendar, Award, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './OverviewTab.css';

const COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', 
  '#06B6D4', '#84CC16', '#F97316', '#6366F1', '#14B8A6', '#D946EF'
];

const OverviewTab = ({ stats, recentPatients, recentDoctors, specializations, doctors }) => {
  // Stats cards data - Unified colors
  const statsCards = [
    { 
      title: 'Total Patients', 
      value: stats?.totalPatients || 0,
      color: '#3B82F6',
      bgColor: 'white'
    },
    { 
      title: 'Total Doctors', 
      value: stats?.totalDoctors || 0,
      color: '#3B82F6',
      bgColor: 'white'
    },
    { 
      title: 'Total Hospitals', 
      value: stats?.totalHospitals || 0,
      color: '#3B82F6',
      bgColor: 'white'
    },
    { 
      title: 'Specializations', 
      value: specializations?.length || 0,
      color: '#3B82F6',
      bgColor: 'white'
    }
  ];

  // Doctor distribution data for pie chart
  const doctorDistribution = specializations?.slice(0, 8).map(spec => ({
    name: spec.name,
    value: doctors?.filter(d => d.specialization === spec.name).length || 0
  })).filter(item => item.value > 0);

  // Group small slices into "Other"
  const threshold = 5;
  const total = doctorDistribution.reduce((sum, item) => sum + item.value, 0);
  const mainItems = doctorDistribution.filter(item => (item.value / total) * 100 >= threshold);
  const otherValue = doctorDistribution.filter(item => (item.value / total) * 100 < threshold).reduce((sum, item) => sum + item.value, 0);
  
  let chartData = mainItems;
  if (otherValue > 0) {
    chartData.push({ name: 'Other', value: otherValue });
  }

  return (
    <div className="overview-tab">
      {/* Stats Row */}
      <div className="stats-row">
        {statsCards.map((card, index) => (
          <div key={index} className="stat-mini">
            <div className="stat-info">
              <div className="stat-value">{card.value}</div>
              <div className="stat-label">{card.title}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Doctor Distribution Chart */}
      {chartData.length > 0 && (
        <div className="distribution-chart">
          <div className="chart-card">
            <div className="chart-header">
              <div className="chart-title">
                <TrendingUp size={18} />
                <h3>Doctor Distribution</h3>
              </div>
            </div>
            
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="45%"
                    innerRadius="30%"
                    outerRadius="45%"
                    paddingAngle={2}
                    dataKey="value"
                    labelLine={{ stroke: '#94A3B8', strokeWidth: 1 }}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]} 
                        stroke="white"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #E2E8F0', 
                      borderRadius: '8px',
                      padding: '8px 12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value, name) => [`${value} doctors`, name]}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    align="center" 
                    layout="horizontal"
                    wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Recent Patients Section */}
      <div className="recent-section">
        <div className="section-header">
          <Users size={18} />
          <h3>Recent Patients</h3>
          <span className="section-count">{recentPatients?.length || 0} total</span>
        </div>
        
        <div className="items-grid">
          {recentPatients?.length === 0 ? (
            <div className="empty-state">
              <Users size={48} />
              <p>No patients found</p>
            </div>
          ) : (
            recentPatients.slice(0, 6).map(patient => (
              <div key={patient._id} className="item-card">
                <div className="card-header">
                  <div className="item-name">
                    {patient.user?.profile?.firstName} {patient.user?.profile?.lastName}
                  </div>
                  <div className={`status-badge ${patient.user?.isActive ? 'active' : 'inactive'}`}>
                    <span className="status-dot"></span>
                    {patient.user?.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
                <div className="card-body">
                  <div className="detail-row">
                    <Mail size={14} />
                    <span>{patient.user?.email}</span>
                  </div>
                  {patient.user?.profile?.phone && (
                    <div className="detail-row">
                      <Phone size={14} />
                      <span>{patient.user?.profile?.phone}</span>
                    </div>
                  )}
                  {patient.user?.profile?.dateOfBirth && (
                    <div className="detail-row">
                      <Calendar size={14} />
                      <span>DOB: {new Date(patient.user.profile.dateOfBirth).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Doctors Section */}
      <div className="recent-section">
        <div className="section-header">
          <Stethoscope size={18} />
          <h3>Recent Doctors</h3>
          <span className="section-count">{recentDoctors?.length || 0} total</span>
        </div>
        
        <div className="items-grid">
          {recentDoctors?.length === 0 ? (
            <div className="empty-state">
              <Stethoscope size={48} />
              <p>No doctors found</p>
            </div>
          ) : (
            recentDoctors.slice(0, 6).map(doctor => (
              <div key={doctor._id} className="item-card">
                <div className="card-header">
                  <div className="item-name">
                    Dr. {doctor.profile?.firstName} {doctor.profile?.lastName}
                  </div>
                  <div className={`status-badge ${doctor.isActive ? 'active' : 'inactive'}`}>
                    <span className="status-dot"></span>
                    {doctor.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
                <div className="card-body">
                  <div className="detail-row">
                    <Mail size={14} />
                    <span>{doctor.email}</span>
                  </div>
                  {doctor.specialization && (
                    <div className="detail-row">
                      <Award size={14} />
                      <span className="specialty-badge">{doctor.specialization}</span>
                    </div>
                  )}
                  {doctor.licenseNumber && (
                    <div className="detail-row">
                      <Award size={14} />
                      <span>License: {doctor.licenseNumber}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;