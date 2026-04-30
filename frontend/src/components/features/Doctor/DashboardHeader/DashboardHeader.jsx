import React, { useState, useRef, useEffect } from 'react';
import { Stethoscope, LogOut, Users, Calendar, FileText, Share2, TrendingUp, User, Settings, Lock, ChevronDown } from 'lucide-react';
import { NotificationBell } from '../../../common/NotificationBell/NotificationBell';
import { AccountModal } from '../AccountModal/AccountModal';
import './DashboardHeader.css';

export const DashboardHeader = ({ user, onLogout, activeTab, onTabChange, onUserUpdate }) => {
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const menuRef = useRef(null);

  const tabs = [
    { id: 'patients', label: 'Patients', icon: <Users size={18} /> },
    { id: 'appointments', label: 'Appointments', icon: <Calendar size={18} /> },
    { id: 'referrals', label: 'Referrals', icon: <Share2 size={18} /> },
    { id: 'prescriptions', label: 'Prescriptions', icon: <FileText size={18} /> },
    { id: 'analytics', label: 'Analytics', icon: <TrendingUp size={18} /> },
  ];

  // Get doctor's specialization from user data
  const doctorSpecialization = user?.specialization || 'Not specified';
  const doctorName = `Dr. ${user?.profile?.firstName || ''} ${user?.profile?.lastName || ''}`.trim();

  // Close menu when clicking outside
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
      <header className="doctor-header">
        <div className="header-container">
          {/* Logo */}
          <div className="logo">
            <Stethoscope size={28} />
            <span>AEGIS</span>
          </div>

          {/* Navigation */}
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

          {/* Right Section */}
          <div className="header-actions">
            <NotificationBell />

            {/* Account Dropdown - Removed the specialization badge */}
            <div className="account-dropdown" ref={menuRef}>
              <button 
                className="account-btn"
                onClick={() => setShowAccountMenu(!showAccountMenu)}
              >
                <User size={18} />
                <ChevronDown size={14} />
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