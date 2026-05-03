import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Building2, 
  Stethoscope, 
  Users, 
  Award,
  LogOut, TrendingUp
} from 'lucide-react';
import './AdminSidebar.css';

// Logo from public folder
const logo = '/images/logo-light.png';

const AdminSidebar = ({ activePage, onPageChange, onLogout, onToggle, isCollapsed: externalCollapsed }) => {
  const [isCollapsed, setIsCollapsed] = useState(externalCollapsed || false);

  // Load saved state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null && externalCollapsed === undefined) {
      setIsCollapsed(savedState === 'true');
    }
  }, [externalCollapsed]);

  // Sync with parent component
  useEffect(() => {
    if (externalCollapsed !== undefined) {
      setIsCollapsed(externalCollapsed);
    }
  }, [externalCollapsed]);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', newState);
    if (onToggle) {
      onToggle(newState);
    }
  };

  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'hospitals', label: 'Hospitals', icon: <Building2 size={18} /> },
    { id: 'doctors', label: 'Doctors', icon: <Stethoscope size={18} /> },
    { id: 'patients', label: 'Patients', icon: <Users size={18} /> },
    { id: 'specializations', label: 'Specializations', icon: <Award size={18} /> },
      { id: 'analytics', label: 'Analytics', icon: <TrendingUp size={18} /> } 
  ];

  return (
    <aside className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="logo" onClick={toggleSidebar}>
          <img src={logo} alt="AEGIS Logo" className="logo-image" />
          {!isCollapsed && <span>AEGIS</span>}
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activePage === item.id ? 'active' : ''}`}
            onClick={() => onPageChange(item.id)}
            title={isCollapsed ? item.label : ''}
          >
            <span className="nav-icon">{item.icon}</span>
            {!isCollapsed && <span className="nav-label">{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={onLogout} title={isCollapsed ? 'Logout' : ''}>
          <LogOut size={18} />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;