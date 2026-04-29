import React from 'react';
import AdminSidebar from '../AdminSidebar/AdminSidebar';
import './AdminLayout.css';

const AdminLayout = ({ children, onLogout }) => {
  return (
    <div className="admin-layout">
      <AdminSidebar onLogout={onLogout} />
      <main className="admin-main">
        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;