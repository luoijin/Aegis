// frontend/src/components/features/Doctor/PatientInfoHeader/PatientInfoHeader.jsx
import React from 'react';
import './PatientInfoHeader.css';

export const PatientInfoHeader = ({ patient, onRecordVitals }) => {
  return (
    <div className="patient-info-header">
      <div>
        <h2>{patient.user?.profile?.firstName} {patient.user?.profile?.lastName}</h2>
        <p>{patient.user?.email}</p>
      </div>
      <button className="record-vitals-btn" onClick={onRecordVitals}>
        + Record Vitals
      </button>
    </div>
  );
};