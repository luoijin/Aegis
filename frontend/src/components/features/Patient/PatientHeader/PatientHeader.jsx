// frontend/src/components/features/Patient/PatientHeader/PatientHeader.jsx
import React, { useState, useRef, useEffect } from 'react';
import { LogOut, User, Settings, ChevronDown, Bell } from 'lucide-react';
import { NotificationBell } from '../../../common/NotificationBell/NotificationBell';
import { PatientAccountModal } from '../PatientAccountModal/PatientAccountModal';
import './PatientHeader.css';

const logo = '/images/logo-dark.png';

export const PatientHeader = ({ user, patientData, onLogout, activeTab, onTabChange, onUserUpdate }) => {
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const menuRef = useRef(null);

  const patientName = `${user?.profile?.firstName || ''} ${user?.profile?.lastName || ''}`.trim();
  
  const navItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'vitals', label: 'Health Records' },
    { id: 'prescriptions', label: 'Prescriptions' },
    { id: 'appointments', label: 'Appointments' },
    { id: 'referrals', label: 'Referrals' }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowAccountMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAccountClick = () => {
    setShowAccountMenu(false);
    setShowAccountModal(true);
  };

  return (
    <>
      <header className="patient-header">
        <div className="header-container">
          {/* Logo with both image and text */}
          <div className="logo">
            <img src={logo} alt="AEGIS" className="logo-image" />
            <span className="logo-text">AEGIS</span>
          </div>

          {/* Navigation - Center */}
          <nav className="nav-menu">
            {navItems.map(item => (
              <button
                key={item.id}
                className={`nav-link ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => onTabChange(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right section */}
          <div className="header-actions">
            <NotificationBell />
            
            <div className="account-dropdown" ref={menuRef}>
              <button 
                className="account-btn"
                onClick={() => setShowAccountMenu(!showAccountMenu)}
              >
                <User size={18} />
                <span>{patientName || 'Patient'}</span>
                <ChevronDown size={14} />
              </button>

              {showAccountMenu && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <div className="dropdown-name">{patientName || 'Patient'}</div>
                    <div className="dropdown-email">{user?.email}</div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item" onClick={handleAccountClick}>
                    <Settings size={16} />
                    Account Settings
                  </button>
                  <button className="dropdown-item" onClick={onLogout}>
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {showAccountModal && (
        <PatientAccountModal
          user={user}
          patientData={patientData}
          onClose={() => setShowAccountModal(false)}
          onUpdate={onUserUpdate}
        />
      )}
    </>
  );
};