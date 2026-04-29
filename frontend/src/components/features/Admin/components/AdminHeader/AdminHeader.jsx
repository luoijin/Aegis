import React from 'react';
import { Bell, User } from 'lucide-react';
import './AdminHeader.css';

const AdminHeader = ({ user, pageTitle }) => {
  return (
    <header className="admin-header">
      <div className="header-left">
        <h1 className="page-title">{pageTitle}</h1>
      </div>
      <div className="header-right">
        <button className="notification-btn">
          <Bell size={20} />
        </button>
        <div className="user-info">
          <div className="user-avatar">
            {user?.profile?.firstName?.[0] || 'A'}
          </div>
          <div className="user-details">
            <span className="user-name">Admin {user?.profile?.firstName || ''}</span>
            <span className="user-role">Administrator</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;