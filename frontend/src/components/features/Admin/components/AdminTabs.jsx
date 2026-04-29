import React from 'react';
import { LayoutDashboard, Building, Stethoscope, Users, Award } from 'lucide-react';

const tabs = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={16} /> },
  { id: 'hospitals', label: 'Hospitals', icon: <Building size={16} /> },
  { id: 'doctors', label: 'Doctors', icon: <Stethoscope size={16} /> },
  { id: 'patients', label: 'Patients', icon: <Users size={16} /> },
  { id: 'specializations', label: 'Specializations', icon: <Award size={16} /> }
];

const AdminTabs = ({ activeTab, onTabChange }) => {
  return (
    <div className="admin-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.icon} {tab.label}
        </button>
      ))}
    </div>
  );
};

export default AdminTabs;