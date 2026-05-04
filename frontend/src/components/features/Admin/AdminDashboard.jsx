// frontend/src/components/features/Admin/AdminDashboard.jsx
import React, { useState, useCallback } from 'react';
import { TrendingUp } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { useAdminData } from './hooks/useAdminData';
import AdminSidebar from './components/AdminSidebar/AdminSidebar';
import AdminHeader from './components/AdminHeader/AdminHeader';
import AdminStats from './components/AdminStats/AdminStats';
import OverviewTab from './components/OverviewTab/OverviewTab';
import HospitalsTab from './components/HospitalsTab/HospitalsTab';
import DoctorsTab from './components/DoctorsTab/DoctorsTab';
import PatientsTab from './components/PatientsTab/PatientsTab';
import SpecializationsTab from './components/SpecializationsTab/SpecializationsTab';
import AdminAnalytics from './components/AdminAnalytics/AdminAnalytics';
import HospitalModal from './components/modals/HospitalModal';
import EditHospitalModal from './components/modals/EditHospitalModal';
import DoctorModal from './components/modals/DoctorModal';
import EditDoctorModal from './components/modals/EditDoctorModal';
import PatientModal from './components/modals/PatientModal';
import SpecializationModal from './components/modals/SpecializationModal';
import ConfirmModal from '../../common/ConfirmModal/ConfirmModal';
import api from '../../../utils/api';
import './AdminDashboard.css';

const COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', 
  '#06B6D4', '#84CC16', '#F97316', '#6366F1', '#14B8A6', '#D946EF'
];

const AdminDashboard = () => {
  const [activePage, setActivePage] = useState('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Modal states
  const [hospitalModal, setHospitalModal] = useState({ isOpen: false, editingItem: null });
  const [doctorModal, setDoctorModal] = useState({ isOpen: false, editingItem: null });
  const [patientModal, setPatientModal] = useState({ isOpen: false, editingItem: null });
  const [specializationModal, setSpecializationModal] = useState({ isOpen: false, editingItem: null });
  
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : {};
  });

  // Confirm Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    confirmText: 'Confirm',
    onConfirmAction: null,
    actionData: null
  });

  const {
    stats, recentPatients, recentDoctors, hospitals, doctors, allPatients, specializations,
    loading, error, success, setError, setSuccess, fetchAllData
  } = useAdminData();

  // Refresh data function - can be called after any create/edit/delete
  const refreshData = useCallback(async () => {
    console.log('Refreshing admin data...');
    await fetchAllData();
  }, [fetchAllData]);

  // Modal open/close functions
  const openHospitalModal = (item = null) => {
    setHospitalModal({ isOpen: true, editingItem: item });
  };
  const closeHospitalModal = () => {
    setHospitalModal({ isOpen: false, editingItem: null });
    refreshData();
  };

  const openDoctorModal = (item = null) => {
    setDoctorModal({ isOpen: true, editingItem: item });
  };
  const closeDoctorModal = () => {
    setDoctorModal({ isOpen: false, editingItem: null });
    refreshData();
  };

  const openPatientModal = (item = null) => {
    setPatientModal({ isOpen: true, editingItem: item });
  };
  const closePatientModal = () => {
    setPatientModal({ isOpen: false, editingItem: null });
    refreshData();
  };

  const openSpecializationModal = (item = null) => {
    setSpecializationModal({ isOpen: true, editingItem: item });
  };
  const closeSpecializationModal = () => {
    setSpecializationModal({ isOpen: false, editingItem: null });
    refreshData();
  };

  const showConfirm = (title, message, type, onConfirm, actionData) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      type,
      confirmText: type === 'danger' ? 'Delete' : type === 'warning' ? 'Confirm' : 'OK',
      onConfirmAction: () => onConfirm(actionData),
      actionData
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    window.location.href = '/';
  };

  const handleSidebarToggle = (collapsed) => {
    setIsSidebarCollapsed(collapsed);
  };

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const setSuccessMsg = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };
  
  const setErrorMsg = (msg) => {
    setError(msg);
    setTimeout(() => setError(''), 3000);
  };

  // ============================================
  // HOSPITAL CRUD HANDLERS
  // ============================================
  const handleDeleteHospital = async (id) => {
    try {
      await api.delete(`/admin/hospitals/${id}`);
      setSuccessMsg('Hospital deleted successfully');
      await refreshData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to delete hospital');
    }
  };

  const confirmDeleteHospital = (id, name) => {
    showConfirm(
      'Delete Hospital',
      `Are you sure you want to permanently delete ${name}? This action cannot be undone.`,
      'danger',
      (data) => handleDeleteHospital(data.id),
      { id }
    );
  };

  // ============================================
  // DOCTOR CRUD HANDLERS
  // ============================================
  const handleDeleteDoctor = async (doctorId, doctorName) => {
    try {
      await api.delete(`/admin/doctors/${doctorId}`);
      setSuccessMsg(`Dr. ${doctorName} has been permanently deleted.`);
      await refreshData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to delete doctor');
    }
  };

  const confirmDeleteDoctor = (doctorId, doctorName) => {
    showConfirm(
      'Delete Doctor',
      `Are you sure you want to permanently delete Dr. ${doctorName}? This action cannot be undone.`,
      'danger',
      (data) => handleDeleteDoctor(data.id, data.name),
      { id: doctorId, name: doctorName }
    );
  };

  const handleToggleDoctorStatus = async (doctorId, currentStatus, doctorName) => {
    try {
      await api.patch(`/admin/doctors/${doctorId}/status`, { isActive: !currentStatus });
      setSuccessMsg(`Dr. ${doctorName} has been ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      await refreshData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update doctor status');
    }
  };

  const confirmToggleDoctorStatus = (doctorId, currentStatus, doctorName) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    showConfirm(
      `${currentStatus ? 'Deactivate' : 'Activate'} Doctor`,
      `Are you sure you want to ${action} Dr. ${doctorName}?`,
      'warning',
      (data) => handleToggleDoctorStatus(data.id, data.currentStatus, data.name),
      { id: doctorId, currentStatus, name: doctorName }
    );
  };

  // ============================================
  // PATIENT CRUD HANDLERS
  // ============================================
  const handleDeletePatient = async (patientId, patientName) => {
    try {
      await api.delete(`/admin/patients/${patientId}`);
      setSuccessMsg(`${patientName} has been permanently deleted.`);
      await refreshData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to delete patient');
    }
  };

  const confirmDeletePatient = (patientId, patientName) => {
    showConfirm(
      'Delete Patient',
      `Are you sure you want to permanently delete ${patientName}? This will also delete all their health records.`,
      'danger',
      (data) => handleDeletePatient(data.id, data.name),
      { id: patientId, name: patientName }
    );
  };

  const handleTogglePatientStatus = async (patientId, currentStatus, patientName) => {
    try {
      await api.patch(`/admin/patients/${patientId}/status`, { isActive: !currentStatus });
      setSuccessMsg(`${patientName} has been ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      await refreshData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update patient status');
    }
  };

  const confirmTogglePatientStatus = (patientId, currentStatus, patientName) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    showConfirm(
      `${currentStatus ? 'Deactivate' : 'Activate'} Patient`,
      `Are you sure you want to ${action} ${patientName}?`,
      'warning',
      (data) => handleTogglePatientStatus(data.id, data.currentStatus, data.name),
      { id: patientId, currentStatus, name: patientName }
    );
  };

  // ============================================
  // SPECIALIZATION CRUD HANDLERS
  // ============================================
  const handleDeleteSpecialization = async (id, name) => {
    try {
      await api.delete(`/admin/specializations/${id}`);
      setSuccessMsg(`Specialization "${name}" deleted successfully`);
      await refreshData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to delete specialization');
    }
  };

  const confirmDeleteSpecialization = (id, name) => {
    showConfirm(
      'Delete Specialization',
      `Are you sure you want to permanently delete "${name}"? This may affect doctors with this specialization.`,
      'danger',
      (data) => handleDeleteSpecialization(data.id, data.name),
      { id, name }
    );
  };

  const userData = user;

  const doctorDistribution = specializations.slice(0, 6).map(spec => ({
    name: spec.name,
    value: doctors.filter(d => d.specialization === spec.name).length || 0
  }));

  const pageTitles = {
    overview: 'Dashboard Overview',
    hospitals: 'Hospital Management',
    doctors: 'Doctor Management',
    patients: 'Patient Management',
    specializations: 'Specializations',
    analytics: 'Analytics Dashboard'
  };

  const renderContent = () => {
    switch(activePage) {
      case 'overview':
        return (
          <>
            <AdminStats stats={stats} />
            <div className="charts-row">
              <div className="chart-card">
                <div className="chart-header">
                  <div className="chart-title">
                    <TrendingUp size={18} />
                    <h3>Doctor Distribution by Specialization</h3>
                  </div>
                  <div className="chart-stats">
                    <span className="stat-badge">Total Specializations: {doctorDistribution.length}</span>
                    <span className="stat-badge">Total Doctors: {doctors.length}</span>
                  </div>
                </div>
                {doctorDistribution.length === 0 ? (
                  <div className="no-data">No doctor data available</div>
                ) : (
                  <div className="donut-chart-container">
                    <ResponsiveContainer width="100%" height={380}>
                      <PieChart>
                        <Pie
                          data={doctorDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={130}
                          paddingAngle={3}
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          labelLine={{ stroke: '#94A3B8', strokeWidth: 1 }}
                        >
                          {doctorDistribution.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={COLORS[index % COLORS.length]} 
                              stroke="white"
                              strokeWidth={2}
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #E2E8F0', 
                            borderRadius: '8px',
                            padding: '8px 12px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                          formatter={(value, name) => [`${value} doctors`, name]}
                        />
                        <Legend 
                          verticalAlign="bottom" 
                          align="center" 
                          layout="horizontal"
                          wrapperStyle={{ paddingTop: '20px' }}
                          formatter={(value) => <span style={{ fontSize: '12px', color: '#475569' }}>{value}</span>}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    
                    <div className="donut-center-text">
                      <div className="center-value">{doctors.length}</div>
                      <div className="center-label">Total Doctors</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <OverviewTab recentPatients={recentPatients} recentDoctors={recentDoctors} />
          </>
        );
      case 'hospitals':
        return <HospitalsTab 
          hospitals={hospitals} 
          onAdd={() => openHospitalModal()} 
          onEdit={(h) => openHospitalModal(h)} 
          onDelete={confirmDeleteHospital} 
        />;
      case 'doctors':
        return <DoctorsTab 
          doctors={doctors} 
          patients={allPatients}
          onAdd={() => openDoctorModal()} 
          onEdit={(d) => openDoctorModal(d)} 
          onDelete={confirmDeleteDoctor} 
          onToggleStatus={confirmToggleDoctorStatus} 
        />;
      case 'patients':
        return <PatientsTab 
          patients={allPatients} 
          doctors={doctors} 
          onAdd={() => openPatientModal()} 
          onEdit={(p) => openPatientModal(p)} 
          onDelete={confirmDeletePatient} 
          onToggleStatus={confirmTogglePatientStatus} 
        />;
      case 'specializations':
        return <SpecializationsTab 
          specializations={specializations} 
          doctors={doctors}
          onAdd={() => openSpecializationModal()} 
          onEdit={(s) => openSpecializationModal(s)} 
          onDelete={confirmDeleteSpecialization} 
        />;
      case 'analytics':
        return <AdminAnalytics />;
      default:
        return null;
    }
  };

  return (
    <div className="admin-dashboard-container">
      <AdminSidebar 
        activePage={activePage} 
        onPageChange={setActivePage} 
        onLogout={handleLogout}
        onToggle={handleSidebarToggle}
        isCollapsed={isSidebarCollapsed}
      />
      <AdminHeader 
        user={userData} 
        pageTitle={pageTitles[activePage]} 
        isSidebarCollapsed={isSidebarCollapsed}
        onLogout={handleLogout}
        onUserUpdate={handleUserUpdate}
      />
      
      <main className={`admin-main-content ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {success && <div className="success-message">{success}</div>}
        {error && <div className="error-message">{error}</div>}
        {renderContent()}
      </main>

      {/* Hospital Modals */}
      <HospitalModal 
        isOpen={hospitalModal.isOpen && !hospitalModal.editingItem} 
        onClose={closeHospitalModal} 
        onSuccess={refreshData} 
      />
      <EditHospitalModal 
        isOpen={hospitalModal.isOpen && hospitalModal.editingItem} 
        onClose={closeHospitalModal} 
        editingHospital={hospitalModal.editingItem}
        onSuccess={refreshData} 
      />

      {/* Doctor Modals */}
      <DoctorModal 
        isOpen={doctorModal.isOpen && !doctorModal.editingItem} 
        onClose={closeDoctorModal} 
        specializations={specializations} 
        hospitals={hospitals} 
        onSuccess={refreshData} 
      />
      <EditDoctorModal 
        isOpen={doctorModal.isOpen && doctorModal.editingItem} 
        onClose={closeDoctorModal} 
        editingDoctor={doctorModal.editingItem}
        specializations={specializations} 
        hospitals={hospitals} 
        onSuccess={refreshData} 
      />

      {/* Patient Modal */}
      <PatientModal 
        isOpen={patientModal.isOpen} 
        onClose={closePatientModal} 
        editingPatient={patientModal.editingItem}
        doctors={doctors} 
        onSuccess={refreshData} 
      />

      {/* Specialization Modal */}
      <SpecializationModal 
        isOpen={specializationModal.isOpen} 
        onClose={closeSpecializationModal} 
        editingSpecialization={specializationModal.editingItem}
        onSuccess={refreshData} 
      />

      {/* Global Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={() => {
          if (confirmModal.onConfirmAction) confirmModal.onConfirmAction();
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        confirmText={confirmModal.confirmText}
        cancelText="Cancel"
      />
    </div>
  );
};

export default AdminDashboard;