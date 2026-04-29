import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAdminData } from './hooks/useAdminData';
import AdminSidebar from './components/AdminSidebar/AdminSidebar';
import AdminHeader from './components/AdminHeader/AdminHeader';
import AdminStats from './components/AdminStats/AdminStats';
import OverviewTab from './components/OverviewTab/OverviewTab';
import HospitalsTab from './components/HospitalsTab/HospitalsTab';
import DoctorsTab from './components/DoctorsTab/DoctorsTab';
import PatientsTab from './components/PatientsTab/PatientsTab';
import SpecializationsTab from './components/SpecializationsTab/SpecializationsTab';
import HospitalModal from './components/modals/HospitalModal';
import DoctorModal from './components/modals/DoctorModal';
import EditDoctorModal from './components/modals/EditDoctorModal';
import PatientModal from './components/modals/PatientModal';
import SpecializationModal from './components/modals/SpecializationModal';
import api from '../../../utils/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activePage, setActivePage] = useState('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [modalState, setModalState] = useState({
    hospital: false, doctor: false, editDoctor: false, patient: false, specialization: false
  });
  const [editingItem, setEditingItem] = useState(null);
  
  const {
    stats, recentPatients, recentDoctors, hospitals, doctors, allPatients, specializations,
    loading, error, success, setError, setSuccess, fetchAllData
  } = useAdminData();

  const openModal = (type, item = null) => {
    setEditingItem(item);
    setModalState(prev => ({ ...prev, [type]: true }));
  };
  
  const closeModal = (type) => {
    setEditingItem(null);
    setModalState(prev => ({ ...prev, [type]: false }));
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

  // ============================================
  // HOSPITAL CRUD HANDLERS
  // ============================================
  const handleDeleteHospital = async (id) => {
    if (window.confirm('Are you sure you want to delete this hospital?')) {
      try {
        await api.delete(`/admin/hospitals/${id}`);
        setSuccessMsg('Hospital deleted successfully');
        await fetchAllData();
      } catch (err) {
        setErrorMsg(err.response?.data?.message || 'Failed to delete hospital');
      }
    }
  };

  // ============================================
  // DOCTOR CRUD HANDLERS
  // ============================================
  const handleDeleteDoctor = async (doctorId, doctorName) => {
    if (window.confirm(`Are you sure you want to permanently delete Dr. ${doctorName}? This action cannot be undone.`)) {
      try {
        await api.delete(`/admin/doctors/${doctorId}`);
        setSuccessMsg(`Dr. ${doctorName} has been permanently deleted.`);
        await fetchAllData();
      } catch (err) {
        setErrorMsg(err.response?.data?.message || 'Failed to delete doctor');
      }
    }
  };

  const handleToggleDoctorStatus = async (doctorId, currentStatus, doctorName) => {
    try {
      const response = await api.patch(`/admin/doctors/${doctorId}/status`, { isActive: !currentStatus });
      if (response.data) {
        setSuccessMsg(`Dr. ${doctorName} has been ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        await fetchAllData();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update doctor status');
    }
  };

  // ============================================
  // PATIENT CRUD HANDLERS
  // ============================================
  const handleDeletePatient = async (patientId, patientName) => {
    if (window.confirm(`Are you sure you want to permanently delete ${patientName}? This will also delete all their health records.`)) {
      try {
        await api.delete(`/admin/patients/${patientId}`);
        setSuccessMsg(`${patientName} has been permanently deleted.`);
        await fetchAllData();
      } catch (err) {
        setErrorMsg(err.response?.data?.message || 'Failed to delete patient');
      }
    }
  };

  const handleTogglePatientStatus = async (patientId, currentStatus, patientName) => {
    try {
      const response = await api.patch(`/admin/patients/${patientId}/status`, { isActive: !currentStatus });
      if (response.data) {
        setSuccessMsg(`${patientName} has been ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        await fetchAllData();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update patient status');
    }
  };

  // ============================================
  // SPECIALIZATION CRUD HANDLERS
  // ============================================
  const handleSaveSpecialization = async () => {
    // This will refresh all data including doctors list
    await fetchAllData();
  };
  const handleDeleteSpecialization = async (id, name) => {
    try {
      await api.delete(`/admin/specializations/${id}`);
      setSuccessMsg(`Specialization "${name}" deleted successfully`);
      await fetchAllData(); // Refresh all data including doctors
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to delete specialization');
    }
  };

  // Helper to set messages
  const setSuccessMsg = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  const setErrorMsg = (msg) => {
    setError(msg);
    setTimeout(() => setError(''), 3000);
  };

  // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem('user') || '{}');

  const doctorDistribution = specializations.slice(0, 6).map(spec => ({
    name: spec.name,
    value: doctors.filter(d => d.specialization === spec.name).length || 5
  }));

  const pageTitles = {
    overview: 'Dashboard Overview',
    hospitals: 'Hospital Management',
    doctors: 'Doctor Management',
    patients: 'Patient Management',
    specializations: 'Specializations'
  };

  const renderContent = () => {
    switch(activePage) {
      case 'overview':
        return (
          <>
            <AdminStats stats={stats} />
            <div className="charts-row">
              <div className="chart-card">
                <h3><TrendingUp size={16} /> Doctor Distribution by Specialization</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={doctorDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="name" stroke="#64748B" fontSize={12} angle={-45} textAnchor="end" height={60} />
                    <YAxis stroke="#64748B" />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <OverviewTab recentPatients={recentPatients} recentDoctors={recentDoctors} />
          </>
        );
      case 'hospitals':
        return <HospitalsTab 
          hospitals={hospitals} 
          onAdd={() => openModal('hospital')} 
          onEdit={(h) => openModal('hospital', h)} 
          onDelete={handleDeleteHospital} 
        />;
      case 'doctors':
        return <DoctorsTab 
          doctors={doctors} 
          onAdd={() => openModal('doctor')} 
          onEdit={(d) => openModal('editDoctor', d)} 
          onDelete={handleDeleteDoctor} 
          onToggleStatus={handleToggleDoctorStatus} 
        />;
      case 'patients':
        return <PatientsTab 
          patients={allPatients} 
          doctors={doctors} 
          onAdd={() => openModal('patient')} 
          onEdit={(p) => openModal('patient', p)} 
          onDelete={handleDeletePatient} 
          onToggleStatus={handleTogglePatientStatus} 
        />;
      case 'specializations':
        return <SpecializationsTab 
          specializations={specializations} 
          onAdd={() => openModal('specialization')} 
          onEdit={(s) => openModal('specialization', s)} 
          onDelete={handleDeleteSpecialization} 
        />;
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
      />
      
      <main className={`admin-main-content ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {success && <div className="success-message">{success}</div>}
        {error && <div className="error-message">{error}</div>}
        {renderContent()}
      </main>

      {/* Modals */}
      <HospitalModal isOpen={modalState.hospital} onClose={() => closeModal('hospital')} editingHospital={editingItem} onSuccess={fetchAllData} />
      <DoctorModal isOpen={modalState.doctor} onClose={() => closeModal('doctor')} specializations={specializations} hospitals={hospitals} onSuccess={fetchAllData} />
      <EditDoctorModal isOpen={modalState.editDoctor} onClose={() => closeModal('editDoctor')} editingDoctor={editingItem} specializations={specializations} hospitals={hospitals} onSuccess={fetchAllData} />
      <PatientModal isOpen={modalState.patient} onClose={() => closeModal('patient')} editingPatient={editingItem} doctors={doctors} onSuccess={fetchAllData} />
      <SpecializationModal isOpen={modalState.specialization} onClose={() => closeModal('specialization')} editingSpecialization={editingItem} onSuccess={fetchAllData} />
    </div>
  );
};

export default AdminDashboard;