// frontend/src/components/features/Admin/components/AdminStats/AdminStats.jsx
import React from 'react';
import { Users, Stethoscope, Building } from 'lucide-react';
import './AdminStats.css';

const AdminStats = ({ stats }) => {
  console.log('AdminStats component received:', stats);

  const statsCards = [
    { 
      title: 'Total Patients', 
      key: 'totalPatients', 
      icon: <Users size={24} />, 
      color: '#3B82F6' 
    },
    { 
      title: 'Total Doctors', 
      key: 'totalDoctors', 
      icon: <Stethoscope size={24} />, 
      color: '#10B981' 
    },
    { 
      title: 'Total Hospitals', 
      key: 'totalHospitals', 
      icon: <Building size={24} />, 
      color: '#8B5CF6' 
    }
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
            <div className="stat-value">{stats[stat.key] !== undefined ? stats[stat.key] : 0}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminStats;