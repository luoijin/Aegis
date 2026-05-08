// frontend/src/components/features/Doctor/DashboardHeader/DashboardHeader.jsx

import React, { useState, useRef, useEffect } from 'react';
import { LogOut, Users, Calendar, FileText, Share2, TrendingUp, User, Settings, Menu, X, Bell, WifiOff } from 'lucide-react';
import { NotificationBell } from '../../../common/NotificationBell/NotificationBell';
import { AccountModal } from '../AccountModal/AccountModal';
import './DashboardHeader.css';

export const DashboardHeader = ({ user, onLogout, activeTab, onTabChange, onUserUpdate }) => {
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const menuRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const logo = '/images/logo-dark.png';

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

  const tabs = [
    { id: 'patients', label: 'Patients', icon: <Users size={18} /> },
    { id: 'appointments', label: 'Appointments', icon: <Calendar size={18} /> },
    { id: 'referrals', label: 'Referrals', icon: <Share2 size={18} /> },
    { id: 'prescriptions', label: 'Prescriptions', icon: <FileText size={18} /> },
    { id: 'analytics', label: 'Analytics', icon: <TrendingUp size={18} /> },
  ];

  const doctorName = `Dr. ${user?.profile?.firstName || ''} ${user?.profile?.lastName || ''}`.trim();
  const doctorSpecialization = user?.specialization || 'Not specified';

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

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (showMobileMenu) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
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
      <header className="doctor-header">
        <div className="header-container">
          {/* Logo - Left Side */}
          <div className="logo">
            <img src={logo} alt="AEGIS Logo" className="logo-image" />
            <span className="logo-text">AEGIS</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="nav-menu">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => onTabChange(tab.id)}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="header-actions">
            <NotificationBell />

            {/* Offline indicator */}
            {isOffline && (
              <div className="offline-indicator" title="You are offline">
                <WifiOff size={16} />
              </div>
            )}

            {/* Account Dropdown - Desktop */}
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
                    <div className="dropdown-name">{doctorName}</div>
                    <div className="dropdown-email">{user?.email}</div>
                    <div className="dropdown-specialization">{doctorSpecialization}</div>
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

            {/* Hamburger Menu Button - Mobile only */}
            <button 
              className="mobile-menu-btn"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              aria-label="Menu"
            >
              {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {showMobileMenu && (
        <div className="mobile-nav-overlay" onClick={() => setShowMobileMenu(false)}>
          <div className="mobile-nav-drawer" ref={mobileMenuRef} onClick={(e) => e.stopPropagation()}>
            <div className="mobile-nav-header">
              <div className="mobile-user-info">
                <div className="mobile-user-name">{doctorName}</div>
                <div className="mobile-user-email">{user?.email}</div>
                <div className="mobile-user-specialty">{doctorSpecialization}</div>
              </div>
              <button className="mobile-nav-close" onClick={() => setShowMobileMenu(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="mobile-nav-list">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`mobile-nav-link ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => {
                    onTabChange(tab.id);
                    setShowMobileMenu(false);
                  }}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
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

      {/* Account Modal */}
      {showAccountModal && (
        <AccountModal
          user={user}
          onClose={() => setShowAccountModal(false)}
          onUpdate={onUserUpdate}
        />
      )}
    </>
  );
};