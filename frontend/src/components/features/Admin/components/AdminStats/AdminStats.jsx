import React from 'react';
import { Users, Stethoscope, Building, Calendar } from 'lucide-react';
import './AdminStats.css';

const AdminStats = ({ stats }) => {
  const statsCards = [
    { title: 'Total Patients', key: 'totalPatients', icon: <Users size={24} />, color: '#3B82F6' },
    { title: 'Total Doctors', key: 'totalDoctors', icon: <Stethoscope size={24} />, color: '#10B981' },
    { title: 'Total Hospitals', key: 'totalHospitals', icon: <Building size={24} />, color: '#8B5CF6' },
    { title: 'Appointments', key: 'totalAppointments', icon: <Calendar size={24} />, color: '#F59E0B' }
  ];

  return (
    <div className="stats-grid">
      {statsCards.map((stat) => (
        <div key={stat.key} className="stat-card">
          <div className="stat-icon" style={{ background: `${stat.color}10`, color: stat.color }}>
            {stat.icon}
          </div>
          <div className="stat-info">
            <h3>{stat.title}</h3>
            <div className="stat-value">{stats[stat.key] || 0}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminStats;