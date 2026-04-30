// frontend/src/components/features/Doctor/DashboardSidebar/SidebarPatientCard.jsx
import React from 'react';
import './SidebarPatientCard.css';

export const SidebarPatientCard = ({ patient, isSelected, onSelect, lastVisit, conditionSummary }) => {
  const firstName = patient.user?.profile?.firstName || '';
  const lastName = patient.user?.profile?.lastName || '';
  const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();

  return (
    <div 
      className={`sidebar-patient-card ${isSelected ? 'active' : ''}`}
      onClick={onSelect}
    >
      <div className="patient-avatar">
        {initials || 'P'}
      </div>
      <div className="patient-info">
        <div className="patient-name">
          {firstName} {lastName}
        </div>
        <div className="patient-condition-summary">
          {conditionSummary}
        </div>
        <div className="patient-last-visit">
          Last: {lastVisit ? new Date(lastVisit).toLocaleDateString() : 'No records'}
        </div>
      </div>
    </div>
  );
};