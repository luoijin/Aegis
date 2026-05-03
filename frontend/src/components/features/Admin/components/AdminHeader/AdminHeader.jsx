// frontend/src/components/features/Admin/components/AdminHeader/AdminHeader.jsx

import React, { useState, useRef, useEffect } from 'react';
import { LogOut, User, Settings, ChevronDown } from 'lucide-react';
import { AdminAccountModal } from '../AdminAccountModal/AdminAccountModal';
import './AdminHeader.css';

const logo = '/images/logo-dark.png'; // or use your logo

export const AdminHeader = ({ user, onLogout, pageTitle, onUserUpdate, isSidebarCollapsed = false }) => {
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const menuRef = useRef(null);

  const adminName = `${user?.profile?.firstName || ''} ${user?.profile?.lastName || ''}`.trim();

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
      <header className={`admin-header ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="header-left">
          <h1 className="page-title">{pageTitle}</h1>
        </div>
  
      </header>
      {showAccountModal && (
        <AdminAccountModal user={user} onClose={() => setShowAccountModal(false)} onUpdate={onUserUpdate} />
      )}
    </>
  );
};

export default AdminHeader;