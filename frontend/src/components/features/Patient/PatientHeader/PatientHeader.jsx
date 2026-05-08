// frontend/src/components/features/Patient/PatientHeader/PatientHeader.jsx

import React, { useState, useRef, useEffect } from 'react';
import { LogOut, User, Settings, Menu, X, Bell, WifiOff } from 'lucide-react';
import { NotificationBell } from '../../../common/NotificationBell/NotificationBell';
import { PatientAccountModal } from '../PatientAccountModal/PatientAccountModal';
import './PatientHeader.css';

const logo = '/images/logo-dark.png';

export const PatientHeader = ({ user, patientData, onLogout, activeTab, onTabChange, onUserUpdate }) => {
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const menuRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const patientName = `${user?.profile?.firstName || ''} ${user?.profile?.lastName || ''}`.trim();
  
  const navItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'vitals', label: 'Health Records' },
    { id: 'prescriptions', label: 'Prescriptions' },
    { id: 'appointments', label: 'Appointments' },
    { id: 'referrals', label: 'Referrals' }
  ];

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowAccountMenu(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setShowMobileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (showMobileMenu) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showMobileMenu]);

  const handleAccountClick = () => {
    setShowAccountMenu(false);
    setShowMobileMenu(false);
    setShowAccountModal(true);
  };

  const handleLogout = () => {
    setShowMobileMenu(false);
    onLogout();
  };

  return (
    <>
      <header className="patient-header">
        <div className="header-container">
          <div className="logo">
            <img src={logo} alt="AEGIS" className="logo-image" />
            <span className="logo-text">AEGIS</span>
          </div>

          {/* Desktop Navigation */}
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

          <div className="header-actions">
            {/* Account dropdown – desktop only */}
            <div className="account-dropdown" ref={menuRef}>
              <button 
                className="account-btn"
                onClick={() => setShowAccountMenu(!showAccountMenu)}
                aria-label="Account"
              >
                <User size={18} />
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
                  <button className="dropdown-item" onClick={handleLogout}>
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Notification bell – now left of hamburger */}
            <NotificationBell />

            {/* Hamburger menu button */}
            <button 
              className="mobile-menu-btn"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              aria-label="Menu"
            >
              {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Offline indicator – moved to far right */}
            {isOffline && (
              <div className="offline-indicator" title="You are offline">
                <WifiOff size={16} />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {showMobileMenu && (
        <div className="mobile-nav-overlay" onClick={() => setShowMobileMenu(false)}>
          <div className="mobile-nav-drawer" ref={mobileMenuRef} onClick={(e) => e.stopPropagation()}>
            <div className="mobile-nav-header">
              <div className="mobile-user-info">
                <div className="mobile-user-name">{patientName || 'Patient'}</div>
                <div className="mobile-user-email">{user?.email}</div>
              </div>
              <button className="mobile-nav-close" onClick={() => setShowMobileMenu(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="mobile-nav-list">
              {navItems.map(item => (
                <button
                  key={item.id}
                  className={`mobile-nav-link ${activeTab === item.id ? 'active' : ''}`}
                  onClick={() => {
                    onTabChange(item.id);
                    setShowMobileMenu(false);
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="mobile-nav-footer">
              <button className="mobile-nav-footer-item" onClick={handleAccountClick}>
                <Settings size={18} />
                Account Settings
              </button>
              <button className="mobile-nav-footer-item" onClick={handleLogout}>
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

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