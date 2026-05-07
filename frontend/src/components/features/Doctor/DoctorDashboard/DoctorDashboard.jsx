// frontend/src/components/features/Doctor/DoctorDashboard/DoctorDashboard.jsx
import React, { useState, useEffect } from 'react';
import { DashboardHeader } from '../DashboardHeader/DashboardHeader';
import { DashboardSidebar } from '../DashboardSidebar/DashboardSidebar';
import { PatientInfoHeader } from '../PatientInfoHeader/PatientInfoHeader';
import { VitalsGrid } from '../VitalsGrid/VitalsGrid';
import { HealthChart } from '../HealthChart/HealthChart';
import { VitalsModal } from '../VitalsModal/VitalsModal';
import { AppointmentScheduler } from '../AppointmentScheduler/AppointmentScheduler';
import { PrescriptionManager } from '../PrescriptionManager/PrescriptionManager';
import { AnalyticsPanel } from '../AnalyticsPanel/AnalyticsPanel';
import { ConditionManager } from '../ConditionManager/ConditionManager';
import HealthHistory from '../HealthHistory/HealthHistory';
import ReferralSystem from '../ReferralSystem/ReferralSystem';
import PatientChartModal from '../PatientChart/PatientChartModal';
import AddPatientModal from '../PatientManagement/AddPatientModal';
import ConfirmModal from '../../../common/ConfirmModal/ConfirmModal';
import { Users, ChevronDown, Trash2, UserPlus } from 'lucide-react';
import { confirmDialog } from '../../../../utils/confirmDialog';
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
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
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

  const handlePatientSelectChange = (e) => {
    const patientId = e.target.value;
    if (!patientId) {
      setSelectedPatient(null);
      return;
    }
    const patient = patients.find(p => p._id === patientId);
    if (patient) {
      handleSelectPatient(patient);
    }
  };

  const handleRemovePatient = async (patientId, patientName) => {
    const confirmed = await confirmDialog(
      'Remove Patient',
      `Are you sure you want to remove ${patientName} from your list?`,
      'danger',
      'Yes, Remove',
      'Cancel'
    );
    if (confirmed) {
      try {
        await api.delete(`/patients/${patientId}/remove`);
        await fetchPatients();
        if (selectedPatient?._id === patientId) {
          setSelectedPatient(null);
          setHealthLogs([]);
        }
        // Show success message
        setSuccessMessage(`${patientName} has been removed from your list.`);
        setShowSuccessModal(true);
      } catch (error) {
        console.error('Error removing patient:', error);
      }
    }
  };

  const handleAddPatientSuccess = () => {
    setShowAddPatient(false);
    fetchPatients();
    // Show success message
    setSuccessMessage('Patient has been successfully added to your list!');
    setShowSuccessModal(true);
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

  const handleModalClose = async () => {
    setShowPatientChart(false);
    if (selectedPatient) {
      try {
        const response = await api.get(`/doctor/patients/${selectedPatient._id}`);
        const updatedPatient = response.data;
        setSelectedPatient(updatedPatient);
        setPatients(prevPatients =>
          prevPatients.map(p =>
            p._id === updatedPatient._id ? updatedPatient : p
          )
        );
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
    switch (activeTab) {
      case 'patients':
        return (
          <>
            {/* Mobile Patient Selector */}
            <div className="mobile-patient-selector">
              <div className="mobile-selector-header">
                <Users size={18} />
                <h3>Select Patient</h3>
                <button
                  className="mobile-add-patient-btn"
                  onClick={() => setShowAddPatient(true)}
                  title="Add Patient"
                >
                  <UserPlus size={18} />
                </button>
              </div>
              <div className="mobile-selector-dropdown">
                <select
                  value={selectedPatient?._id || ''}
                  onChange={handlePatientSelectChange}
                  className="mobile-patient-dropdown-full"
                >
                  <option value="">-- Choose a patient --</option>
                  {patients.map(patient => {
                    const fullName = `${patient.user?.profile?.firstName || ''} ${patient.user?.profile?.lastName || ''}`.trim();
                    return (
                      <option key={patient._id} value={patient._id}>
                        {fullName}
                      </option>
                    );
                  })}
                </select>
                <ChevronDown size={18} className="dropdown-icon" />
              </div>
            </div>

            {/* Selected Patient View */}
            {selectedPatient && (
              <>
                <div className="mobile-patient-bar">
                  <div className="mobile-patient-actions">
                    <button
                      className="mobile-delete-patient-btn"
                      onClick={() => handleRemovePatient(selectedPatient._id, `${selectedPatient.user?.profile?.firstName} ${selectedPatient.user?.profile?.lastName}`.trim())}
                    >
                      <Trash2 size={16} /> Remove
                    </button>
                  </div>
                </div>

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
          onClose={handleModalClose}
        />
      )}

      {showAddPatient && (
        <AddPatientModal
          onClose={() => setShowAddPatient(false)}
          onSuccess={handleAddPatientSuccess}
        />
      )}

      {/* Success Modal */}
      <ConfirmModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onConfirm={() => setShowSuccessModal(false)}
        title="Success"
        message={successMessage}
        type="success"
        confirmText="OK"
        cancelText=""
      />
    </div>
  );
};

export default DoctorDashboard;