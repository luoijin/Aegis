import React from 'react';
import Button from '../../../common/Button/Button';
import { Plus } from 'lucide-react';
import './PatientHeader.css';

export const PatientHeader = ({ patient, onRecordVitals }) => {
  const firstName = patient.user?.profile?.firstName || '';
  const lastName = patient.user?.profile?.lastName || '';
  const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();

  return (
    <div className="patient-header">
      <div className="patient-header-info">
        <div className="patient-header-avatar">
          {initials || 'P'}
        </div>
        <div>
          <h2>{firstName} {lastName}</h2>
          <p>{patient.user?.email}</p>
        </div>
      </div>
      <Button variant="primary" onClick={onRecordVitals}>
        <Plus size={16} /> Record Vitals
      </Button>
    </div>
  );
};