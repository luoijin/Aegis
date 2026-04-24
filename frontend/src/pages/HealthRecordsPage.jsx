import React from 'react';
import HealthRecordList from '../components/features/HealthLogs/HealthRecordList';
import Navigation from '../components/layout/Navigation/Navigation';

const HealthRecordsPage = () => {
  return (
    <div>
      <Navigation />
      <HealthRecordList />
    </div>
  );
};

export default HealthRecordsPage;