// frontend/src/components/features/Doctor/DashboardWelcome/DashboardWelcome.jsx
import React from 'react';
import './DashboardWelcome.css';

export const DashboardWelcome = ({ user }) => {
  return (
    <div className="dashboard-welcome">
      <h1>Welcome back, Dr. {user?.profile?.firstName || 'Smith'}</h1>
    </div>
  );
};