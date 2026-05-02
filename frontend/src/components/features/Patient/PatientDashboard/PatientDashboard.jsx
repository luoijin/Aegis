// frontend/src/components/features/Patient/PatientDashboard/PatientDashboard.jsx
import React, { useState, useEffect } from 'react';
import { PatientHeader } from '../PatientHeader/PatientHeader';
import { PatientWelcome } from '../PatientWelcome/PatientWelcome';
import { PatientInfoCard } from '../PatientInfoCard/PatientInfoCard';
import { PatientVitals } from '../PatientVitals/PatientVitals';
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

  // ✅ Add this function to refresh only patient and user data
  const refreshPatientProfile = async () => {
    try {
      const [patientRes, userRes] = await Promise.all([
        api.get('/patient/profile'),
        api.get('/auth/profile')
      ]);
      
      setPatientData(patientRes.data);
      setDoctor(patientRes.data.assignedDoctor);
      
      // Update user data in state and localStorage
      const updatedUser = userRes.data;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return true;
    } catch (error) {
      console.error('Error refreshing profile:', error);
      return false;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  // ✅ Update user and refresh data
  const handleUserUpdate = async (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    // Refresh patient data to update overview
    await refreshPatientProfile();
  };

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
            <PatientVitals latestVitals={healthLogs[0]?.vitals} />
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