// frontend/src/components/features/Doctor/DoctorDashboard/DoctorDashboard.jsx
import React, { useState, useEffect } from 'react';
import { DashboardHeader } from '../DashboardHeader/DashboardHeader';
import { DashboardSidebar } from '../DashboardSidebar/DashboardSidebar';
import { PatientInfoHeader } from '../PatientInfoHeader/PatientInfoHeader';
import { VitalsGrid } from '../VitalsGrid/VitalsGrid';
import { HealthChart } from '../HealthChart/HealthChart';
import { HealthHistory } from '../HealthHistory/HealthHistory';
import { VitalsModal } from '../VitalsModal/VitalsModal';
import { ReferralSystem } from '../ReferralSystem/ReferralSystem';
import { AppointmentScheduler } from '../AppointmentScheduler/AppointmentScheduler';
import { PrescriptionManager } from '../PrescriptionManager/PrescriptionManager';
import { AnalyticsPanel } from '../AnalyticsPanel/AnalyticsPanel';
import { ConditionManager } from '../ConditionManager/ConditionManager';
import PatientChartModal from '../PatientChart/PatientChartModal'; // ✅ Correct path
import api from '../../../../services/api';
import './DoctorDashboard.css';

const DoctorDashboard = () => {
  const [user, setUser] = useState(null);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [healthLogs, setHealthLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showVitalsForm, setShowVitalsForm] = useState(false);
  const [showPatientChart, setShowPatientChart] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('patients');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    }
    fetchPatients();
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/auth/profile');
      const freshUser = response.data;
      setUser(freshUser);
      localStorage.setItem('user', JSON.stringify(freshUser));
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await api.get('/doctor/patients');
      setPatients(response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHealthLogs = async (patientId) => {
    try {
      const response = await api.get(`/doctor/patients/${patientId}/health-logs`);
      setHealthLogs(response.data);
    } catch (error) {
      console.error('Error fetching health logs:', error);
      setHealthLogs([]);
    }
  };

  const handleSelectPatient = async (patient) => {
    setSelectedPatient(patient);
    await fetchHealthLogs(patient._id);
  };

  const handleVitalsRecorded = async () => {
    if (selectedPatient) {
      await fetchHealthLogs(selectedPatient._id);
      try {
        const updatedPatient = await api.get(`/doctor/patients/${selectedPatient._id}`);
        setSelectedPatient(updatedPatient.data);
        const patientsRes = await api.get('/doctor/patients');
        setPatients(patientsRes.data);
      } catch (error) {
        console.error('Error refreshing patient data after vitals:', error);
      }
    }
    setShowVitalsForm(false);
  };

  const handlePatientUpdate = async () => {
    if (selectedPatient) {
      try {
        const response = await api.get(`/doctor/patients/${selectedPatient._id}`);
        const updatedPatient = response.data;
        setSelectedPatient(updatedPatient);
        const patientsRes = await api.get('/doctor/patients');
        setPatients(patientsRes.data);
        await fetchHealthLogs(selectedPatient._id);
      } catch (error) {
        console.error('Error refreshing patient data:', error);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const filteredPatients = patients.filter(p =>
    p.user?.profile?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.user?.profile?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const chartData = [...healthLogs]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 30)
    .reverse()
    .map(log => ({
      date: new Date(log.createdAt).toLocaleDateString(),
      heartRate: log.vitals?.heartRate || 0,
    }));

  const latestVitals = healthLogs[0]?.vitals;

  const renderContent = () => {
    switch(activeTab) {
      case 'patients':
        return (
          <>
            {selectedPatient ? (
              <>
                <PatientInfoHeader 
                  patient={selectedPatient}
                  onRecordVitals={() => setShowVitalsForm(true)}
                  onViewChart={() => setShowPatientChart(true)}
                  onPatientUpdate={handlePatientUpdate}
                />
                
                <div className="patient-dashboard-grid">
                  <div className="vitals-column">
                    <VitalsGrid latestVitals={latestVitals} />
                    <HealthChart chartData={chartData} />
                  </div>
                  <div className="conditions-column">
                    <ConditionManager 
                      patient={selectedPatient} 
                      onUpdate={handlePatientUpdate}
                    />
                  </div>
                </div>
                
                <HealthHistory healthLogs={healthLogs} />
              </>
            ) : (
              <div className="no-selection">
                <div className="no-selection-content">
                  <h2>Select a Patient</h2>
                  <p>Choose a patient from the list to view their health records</p>
                </div>
              </div>
            )}
          </>
        );
      
      case 'appointments':
        return <AppointmentScheduler doctorId={user?._id} patients={patients} />;
      case 'referrals':
        return <ReferralSystem doctorId={user?._id} patients={patients} />;
      case 'prescriptions':
        return <PrescriptionManager doctorId={user?._id} patients={patients} />;
      case 'analytics':
        return <AnalyticsPanel doctorId={user?._id} />;
      default:
        return null;
    }
  };

  return (
    <div className="doctor-dashboard">
      <DashboardHeader 
        user={user} 
        onLogout={handleLogout}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onUserUpdate={(updatedUser) => {
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }}
      />

      <div className="dashboard-body">
        {activeTab === 'patients' && (
          <DashboardSidebar
            patients={filteredPatients}
            selectedPatient={selectedPatient}
            onSelectPatient={handleSelectPatient}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            loading={loading}
            healthLogs={healthLogs}
            onPatientAdd={fetchPatients}
          />
        )}

        <main className={`main-content-area ${activeTab !== 'patients' ? 'full-width' : ''}`}>
          {renderContent()}
        </main>
      </div>

      {showVitalsForm && selectedPatient && (
        <VitalsModal
          patient={selectedPatient}
          onClose={() => setShowVitalsForm(false)}
          onSuccess={handleVitalsRecorded}
        />
      )}

      {showPatientChart && selectedPatient && (
        <PatientChartModal
          patient={selectedPatient}
          onClose={() => setShowPatientChart(false)}
        />
      )}
    </div>
  );
};

export default DoctorDashboard;