// frontend/src/components/features/Patient/PatientWelcome/PatientWelcome.jsx
import React from 'react';
import { Activity } from 'lucide-react';
import './PatientWelcome.css';

export const PatientWelcome = ({ user }) => {
  const firstName = user?.profile?.firstName || 'Patient';

  return (
    <div className="patient-welcome">
      {/* <h1>Welcome back, {firstName}!</h1> */}
      {/* <p>View your health records, prescriptions, and appointments.</p> */}
    </div>
  );
};