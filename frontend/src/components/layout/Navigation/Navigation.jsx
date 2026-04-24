import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
  return (
    <nav className="navigation">
      <div className="nav-container">
        <NavLink to="/dashboard" className={({ isActive }) => 
          `nav-link ${isActive ? 'active' : ''}`
        }>
          📊 Dashboard
        </NavLink>
        <NavLink to="/patients" className={({ isActive }) => 
          `nav-link ${isActive ? 'active' : ''}`
        }>
          👥 Patients
        </NavLink>
        <NavLink to="/health-records" className={({ isActive }) => 
          `nav-link ${isActive ? 'active' : ''}`
        }>
          📋 Health Records
        </NavLink>
      </div>
    </nav>
  );
};

export default Navigation;