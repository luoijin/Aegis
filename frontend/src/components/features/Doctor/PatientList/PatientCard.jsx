// frontend/src/components/features/Doctor/PatientList/PatientCard.jsx

import React from 'react';
import './PatientCard.css';

export const PatientCard = ({ patient, isSelected, onSelect, lastVisit }) => {
  const firstName = patient.user?.profile?.firstName || '';
  const lastName = patient.user?.profile?.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim() || 'Unknown Patient';

  return (
    <div 
      className={`patient-card-item ${isSelected ? 'active' : ''}`}
      onClick={onSelect}
    >
      <div className="patient-card-info">
        <div className="patient-card-name">{fullName}</div>
        <div className="patient-last-visit">
          Last: {lastVisit ? new Date(lastVisit).toLocaleDateString() : 'No records'}
        </div>
      </div>
    </div>
  );
};