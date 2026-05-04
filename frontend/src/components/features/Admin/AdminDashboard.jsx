// frontend/src/components/features/Admin/AdminDashboard.jsx
// frontend/src/components/features/Admin/AdminDashboard.jsx
import React, { useState } from 'react';
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
import DoctorModal from './components/modals/DoctorModal';
import EditDoctorModal from './components/modals/EditDoctorModal';
import PatientModal from './components/modals/PatientModal';
import SpecializationModal from './components/modals/SpecializationModal';
import api from '../../../utils/api';
import './AdminDashboard.css';

const COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
  '#6366F1', // Indigo
  '#14B8A6', // Teal
  '#D946EF', // Fuchsia
];

const AdminDashboard = () => {
  const [activePage, setActivePage] = useState('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [modalState, setModalState] = useState({
    hospital: false, doctor: false, editDoctor: false, patient: false, specialization: false
  });
  const [editingItem, setEditingItem] = useState(null);
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : {};
  });

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

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
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
      await api.patch(`/admin/doctors/${doctorId}/status`, { isActive: !currentStatus });
      setSuccessMsg(`Dr. ${doctorName} has been ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      await fetchAllData();
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
      await api.patch(`/admin/patients/${patientId}/status`, { isActive: !currentStatus });
      setSuccessMsg(`${patientName} has been ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      await fetchAllData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update patient status');
    }
  };

  // ============================================
  // SPECIALIZATION CRUD HANDLERS
  // ============================================
  const handleSaveSpecialization = async () => {
    await fetchAllData();
  };
  const handleDeleteSpecialization = async (id, name) => {
    try {
      await api.delete(`/admin/specializations/${id}`);
      setSuccessMsg(`Specialization "${name}" deleted successfully`);
      await fetchAllData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to delete specialization');
    }
  };

  // Get user data from localStorage
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
              {/* Doctor Distribution Section - Donut Chart */}
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
                    
                    {/* Center Text */}
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