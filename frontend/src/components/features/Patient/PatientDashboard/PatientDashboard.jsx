// frontend/src/components/features/Patient/PatientDashboard/PatientDashboard.jsx
import React, { useState, useEffect } from 'react';
import { PatientHeader } from '../PatientHeader/PatientHeader';
import { PatientWelcome } from '../PatientWelcome/PatientWelcome';
import { PatientInfoCard } from '../PatientInfoCard/PatientInfoCard';
import { PatientVitals } from '../PatientVitals/PatientVitals';
import { PatientHealthChart } from '../PatientHealthChart/PatientHealthChart';
import { PatientConditions } from '../PatientConditions/PatientConditions';
import { PatientHealthHistory } from '../PatientHealthHistory/PatientHealthHistory';
import { PatientPrescriptions } from '../PatientPrescriptions/PatientPrescriptions';
import { PatientAppointments } from '../PatientAppointments/PatientAppointments';
import { PatientReferrals } from '../PatientReferrals/PatientReferrals';
import api from '../../../../services/api';
import './PatientDashboard.css';

const PatientDashboard = () => {
  const [user, setUser] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [healthLogs, setHealthLogs] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsed = JSON.parse(userData);
      setUser(parsed);
    }
    fetchPatientData();
  }, []);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [patientRes, logsRes, prescriptionsRes, appointmentsRes, referralsRes] = await Promise.all([
        api.get('/patient/profile'),
        api.get('/patient/my-health-logs'),
        api.get('/patient/my-prescriptions'),
        api.get('/patient/my-appointments'),
        api.get('/patient/my-referrals')
      ]);
      
      setPatientData(patientRes.data);
      setDoctor(patientRes.data.assignedDoctor);
      setHealthLogs(logsRes.data || []);
      setPrescriptions(prescriptionsRes.data || []);
      setAppointments(appointmentsRes.data || []);
      setReferrals(referralsRes.data || []);
    } catch (error) {
      console.error('Error fetching patient data:', error);
      setError(error.response?.data?.message || 'Failed to load patient data');
    } finally {
      setLoading(false);
    }
  };

  const refreshPatientProfile = async () => {
    try {
      const [patientRes, userRes] = await Promise.all([
        api.get('/patient/profile'),
        api.get('/auth/profile')
      ]);
      
      setPatientData(patientRes.data);
      setDoctor(patientRes.data.assignedDoctor);
      
      const updatedUser = userRes.data;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return true;
    } catch (error) {
      console.error('Error refreshing profile:', error);
      return false;
    }
  };

  const refreshPatientData = async () => {
    try {
      const patientRes = await api.get('/patient/profile');
      setPatientData(patientRes.data);
      setDoctor(patientRes.data.assignedDoctor);
    } catch (error) {
      console.error('Error refreshing patient data:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const handleUserUpdate = async (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    await refreshPatientProfile();
  };

  // Prepare chart data from health logs
  const chartData = healthLogs.slice().reverse().slice(0, 30).map(log => ({
    date: new Date(log.createdAt).toLocaleDateString(),
    heartRate: log.vitals?.heartRate || 0,
    systolic: log.vitals?.bloodPressure?.systolic || 0,
    diastolic: log.vitals?.bloodPressure?.diastolic || 0
  }));

  const renderContent = () => {
    if (error) {
      return (
        <div className="error-state">
          <p>{error}</p>
          <button onClick={fetchPatientData}>Retry</button>
        </div>
      );
    }

    switch(activeTab) {
      case 'overview':
        return (
          <>
            <PatientInfoCard patient={patientData} doctor={doctor} user={user} />
            
            <div className="overview-grid">
              <div className="overview-left">
                <PatientVitals latestVitals={healthLogs[0]?.vitals} />
                <PatientHealthChart chartData={chartData} />
              </div>
              <div className="overview-right">
                <PatientConditions conditions={patientData?.conditions || []} />
              </div>
            </div>
            
            <PatientHealthHistory healthLogs={healthLogs.slice(0, 5)} />
          </>
        );
      case 'vitals':
        return <PatientHealthHistory healthLogs={healthLogs} showAll={true} />;
      case 'prescriptions':
        return <PatientPrescriptions prescriptions={prescriptions} />;
      case 'appointments':
        return <PatientAppointments appointments={appointments} />;
      case 'referrals':
        return <PatientReferrals referrals={referrals} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="patient-dashboard loading">
        <div className="spinner"></div>
        <p>Loading your health data...</p>
      </div>
    );
  }

  return (
    <div className="patient-dashboard">
      <PatientHeader 
        user={user}
        patientData={patientData}
        onLogout={handleLogout}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onUserUpdate={handleUserUpdate}
      />
      
      <div className="patient-dashboard-container">
        <div className="patient-dashboard-content">
          <PatientWelcome user={user} />
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;