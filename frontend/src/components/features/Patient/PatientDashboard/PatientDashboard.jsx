// frontend/src/components/features/Patient/PatientDashboard/PatientDashboard.jsx

import React, { useState, useEffect } from 'react';
import { FileText, WifiOff } from 'lucide-react';
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
import PatientEHRModal from '../PatientEHR/PatientEHRModal';
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
  const [showEHR, setShowEHR] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsed = JSON.parse(userData);
      setUser(parsed);
    }
    fetchPatientData();

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to fetch all data with caching fallback
      const [patientRes, logsRes, prescriptionsRes, appointmentsRes, referralsRes] = await Promise.all([
        api.get('/patient/profile').catch(() => null),
        api.get('/patient/my-health-logs').catch(() => null),
        api.get('/patient/my-prescriptions').catch(() => null),
        api.get('/patient/my-appointments').catch(() => null),
        api.get('/patient/my-referrals').catch(() => null)
      ]);
      
      if (patientRes?.data) {
        setPatientData(patientRes.data);
        setDoctor(patientRes.data.assignedDoctor);
        localStorage.setItem('cachedPatientData', JSON.stringify(patientRes.data));
      } else {
        const cached = localStorage.getItem('cachedPatientData');
        if (cached) setPatientData(JSON.parse(cached));
      }

      if (logsRes?.data) {
        setHealthLogs(logsRes.data);
        localStorage.setItem('cachedHealthLogs', JSON.stringify(logsRes.data));
      } else {
        const cached = localStorage.getItem('cachedHealthLogs');
        if (cached) setHealthLogs(JSON.parse(cached));
      }

      if (prescriptionsRes?.data) {
        setPrescriptions(prescriptionsRes.data);
        localStorage.setItem('cachedPrescriptions', JSON.stringify(prescriptionsRes.data));
      } else {
        const cached = localStorage.getItem('cachedPrescriptions');
        if (cached) setPrescriptions(JSON.parse(cached));
      }

      if (appointmentsRes?.data) {
        setAppointments(appointmentsRes.data);
        localStorage.setItem('cachedAppointments', JSON.stringify(appointmentsRes.data));
      } else {
        const cached = localStorage.getItem('cachedAppointments');
        if (cached) setAppointments(JSON.parse(cached));
      }

      if (referralsRes?.data) {
        setReferrals(referralsRes.data);
        localStorage.setItem('cachedReferrals', JSON.stringify(referralsRes.data));
      } else {
        const cached = localStorage.getItem('cachedReferrals');
        if (cached) setReferrals(JSON.parse(cached));
      }

      if (!patientRes?.data && !logsRes?.data && !prescriptionsRes?.data && !appointmentsRes?.data && !referralsRes?.data) {
        setError('Unable to load data. Please check your connection.');
      }
    } catch (error) {
      console.error('Error fetching patient data:', error);
      setError('Failed to load patient data. Using cached data if available.');
    } finally {
      setLoading(false);
    }
  };

  const refreshPatientProfile = async () => {
    if (isOffline) return false;
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

  const chartData = healthLogs.slice().reverse().slice(0, 30).map(log => ({
    date: new Date(log.createdAt).toLocaleDateString(),
    heartRate: log.vitals?.heartRate || 0,
    systolic: log.vitals?.bloodPressure?.systolic || 0,
    diastolic: log.vitals?.bloodPressure?.diastolic || 0
  }));

  const renderContent = () => {
    if (error && !patientData && !healthLogs.length) {
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
        <div className="loading-spinner-static"></div>
        <p>Loading your health data...</p>
      </div>
    );
  }

  return (
    <>
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
          {isOffline && (
            <div className="offline-banner-dashboard">
              <WifiOff size={16} />
              <span>You are offline. Showing cached data.</span>
            </div>
          )}
          <div className="patient-dashboard-content">
            <div className="dashboard-header-actions">
              <PatientWelcome user={user} />
              <button className="view-ehr-btn" onClick={() => setShowEHR(true)} disabled={isOffline}>
                <FileText size={16} /> View My Health Record
              </button>
            </div>
            {renderContent()}
          </div>
        </div>
      </div>

      {showEHR && (
        <PatientEHRModal onClose={() => setShowEHR(false)} />
      )}
    </>
  );
};

export default PatientDashboard;