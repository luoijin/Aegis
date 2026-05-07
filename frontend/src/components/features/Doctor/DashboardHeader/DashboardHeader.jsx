import React, { useState, useRef, useEffect } from 'react';
import { Stethoscope, LogOut, Users, Calendar, FileText, Share2, TrendingUp, User, Settings, Menu, X } from 'lucide-react';
import { NotificationBell } from '../../../common/NotificationBell/NotificationBell';
import { AccountModal } from '../AccountModal/AccountModal';
import './DashboardHeader.css';

export const DashboardHeader = ({ user, onLogout, activeTab, onTabChange, onUserUpdate }) => {
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const menuRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const logo = '/images/logo-dark.png';

  const tabs = [
    { id: 'patients', label: 'Patients', icon: <Users size={18} /> },
    { id: 'appointments', label: 'Appointments', icon: <Calendar size={18} /> },
    { id: 'referrals', label: 'Referrals', icon: <Share2 size={18} /> },
    { id: 'prescriptions', label: 'Prescriptions', icon: <FileText size={18} /> },
    { id: 'analytics', label: 'Analytics', icon: <TrendingUp size={18} /> },
  ];

  const doctorName = `Dr. ${user?.profile?.firstName || ''} ${user?.profile?.lastName || ''}`.trim();
  const doctorSpecialization = user?.specialization || 'Not specified';

  // Close dropdowns when clicking outside
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

  const handleAccountClick = () => {
    setShowAccountMenu(false);
    setShowMobileMenu(false); // Close mobile menu if open
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
          {/* Logo */}
          <div className="logo">
            <img src={logo} alt="AEGIS Logo" className="logo-image" />
            <span className="logo-text">AEGIS</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="nav-menu desktop-only">
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

          {/* Right Actions */}
          <div className="header-actions">
            <NotificationBell />
            
            {/* Account Dropdown */}
            <div className="account-dropdown" ref={menuRef}>
              <button 
                className="account-btn"
                onClick={() => setShowAccountMenu(!showAccountMenu)}
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

            {/* Mobile Menu Toggle */}
            <button 
              className="mobile-menu-btn"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      {showMobileMenu && (
        <div className="mobile-nav-overlay" ref={mobileMenuRef}>
          <nav className="mobile-nav-menu">
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
          </nav>
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