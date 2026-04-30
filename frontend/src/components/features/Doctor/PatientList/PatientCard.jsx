// PatientList/PatientCard.jsx
import React from 'react';
import './PatientCard.css';

export const PatientCard = ({ patient, isSelected, onSelect, lastVisit }) => {
  const firstName = patient.user?.profile?.firstName || '';
  const lastName = patient.user?.profile?.lastName || '';
  const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();

  return (
    <div 
      className={`patient-item ${isSelected ? 'active' : ''}`}
      onClick={onSelect}
    >
      <div className="patient-avatar">  {/* No inline styles here */}
        {initials || 'P'}
      </div>
      <div className="patient-info">
        <div className="patient-name">
          {firstName} {lastName}
        </div>
        <div className="patient-last-visit">
          Last: {lastVisit ? new Date(lastVisit).toLocaleDateString() : 'No records'}
        </div>
      </div>
    </div>
  );
};