import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  Stethoscope, 
  Users, 
  Award,
  LogOut,
  Heart,
  Calendar,
  FileText,
  Settings
} from 'lucide-react';
import './AdminSidebar.css';

const AdminSidebar = ({ onLogout }) => {
  const location = useLocation();
  
  const menuItems = [
    { path: '/admin/dashboard', icon: <LayoutDashboard size={20} />, label: 'Overview' },
    { path: '/admin/hospitals', icon: <Building2 size={20} />, label: 'Hospitals' },
    { path: '/admin/doctors', icon: <Stethoscope size={20} />, label: 'Doctors' },
    { path: '/admin/patients', icon: <Users size={20} />, label: 'Patients' },
    { path: '/admin/specializations', icon: <Award size={20} />, label: 'Specializations' },
  ];

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <Heart size={28} strokeWidth={1.5} />
          <span>AEGIS</span>
        </div>
        <p className="sidebar-subtitle">Admin Portal</p>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={onLogout}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;