import React from 'react';
import PatientList from '../components/features/Patients/PatientList';
import Navigation from '../components/layout/Navigation/Navigation';

const PatientsPage = () => {
  return (
    <div>
      <Navigation />
      <PatientList />
    </div>
  );
};

export default PatientsPage;