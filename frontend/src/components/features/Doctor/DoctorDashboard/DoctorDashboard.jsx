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
import api from '../../../../services/api';
import './DoctorDashboard.css';

const DoctorDashboard = () => {
  const [user, setUser] = useState(null);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [healthLogs, setHealthLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showVitalsForm, setShowVitalsForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('patients');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    }
    fetchPatients();
    
    // Also fetch fresh user data to ensure specialization
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

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const handleSelectPatient = async (patient) => {
    setSelectedPatient(patient);
    try {
      const logsRes = await api.get(`/health-logs?patientId=${patient._id}`);
      setHealthLogs(logsRes.data);
    } catch (error) {
      console.error('Error fetching health logs:', error);
    }
  };

  const handleVitalsRecorded = async () => {
    if (selectedPatient) {
      const logsRes = await api.get(`/health-logs?patientId=${selectedPatient._id}`);
      setHealthLogs(logsRes.data);
    }
    setShowVitalsForm(false);
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

  const chartData = healthLogs.slice().reverse().slice(0, 30).map(log => ({
    date: new Date(log.createdAt).toLocaleDateString(),
    heartRate: log.vitals?.heartRate || 0
  }));

  const latestVitals = healthLogs[0]?.vitals;

  // Render content based on active tab
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
                  onPatientUpdate={async () => {
                    // Refresh patient data after blood type update
                    if (selectedPatient) {
                      try {
                        const response = await api.get(`/doctor/patients/${selectedPatient._id}`);
                        const updatedPatient = response.data;
                        setSelectedPatient(updatedPatient);
                        
                        // Also refresh the patients list
                        const patientsRes = await api.get('/doctor/patients');
                        setPatients(patientsRes.data);
                      } catch (error) {
                        console.error('Error refreshing patient data:', error);
                      }
                    }
                  }}
                />
                
                {/* Two column layout for vitals and conditions */}
                <div className="patient-dashboard-grid">
                  {/* Left Column - Vitals Section */}
                  <div className="vitals-column">
                    <VitalsGrid latestVitals={latestVitals} />
                    <HealthChart chartData={chartData} />
                  </div>
                  
                  {/* Right Column - Conditions Section */}
                  <div className="conditions-column">
                    <ConditionManager 
                      patient={selectedPatient} 
                      onUpdate={async () => {
                        // Refetch the selected patient data
                        if (selectedPatient) {
                          try {
                            const response = await api.get(`/doctor/patients/${selectedPatient._id}`);
                            const updatedPatient = response.data;
                            setSelectedPatient(updatedPatient);
                            
                            // Also refresh health logs if needed
                            const logsRes = await api.get(`/health-logs?patientId=${selectedPatient._id}`);
                            setHealthLogs(logsRes.data);
                          } catch (error) {
                            console.error('Error refreshing patient data:', error);
                          }
                        }
                      }} 
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
        onUserUpdate={handleUserUpdate} 
      />

      <div className="dashboard-body">
        {/* Only show sidebar on patients tab */}
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
    </div>
  );
};

export default DoctorDashboard;