import React, { useState, useEffect } from 'react';
import { 
  Users, Activity, Building, FileText, Heart,
  Plus, Edit, Trash2, Search, UserPlus,
  Stethoscope, Mail, Phone, Calendar, TrendingUp,
  CheckCircle, AlertCircle, Hospital, Award, X,
  LayoutDashboard
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Button from '../../common/Button/Button';
import api from '../../../utils/api';
import './AdminDashboard.css';

const AdminDashboard = ({ initialTab = 'overview' }) => {
  // ============================================
  // STATE DECLARATIONS
  // ============================================
  const [activeTab, setActiveTab] = useState(initialTab);
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalHospitals: 0,
    totalAppointments: 0
  });
  const [recentPatients, setRecentPatients] = useState([]);
  const [recentDoctors, setRecentDoctors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [allPatients, setAllPatients] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  
  // Modal states
  const [showHospitalModal, setShowHospitalModal] = useState(false);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [showEditDoctorModal, setShowEditDoctorModal] = useState(false);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showSpecializationModal, setShowSpecializationModal] = useState(false);
  
  // Editing states
  const [editingHospital, setEditingHospital] = useState(null);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [editingPatient, setEditingPatient] = useState(null);
  const [editingSpecialization, setEditingSpecialization] = useState(null);
  
  const [user, setUser] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Form states
  const [hospitalForm, setHospitalForm] = useState({
    name: '', address: '', city: '', pincode: '', phone: '', email: ''
  });
  
  const [doctorForm, setDoctorForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', 
    licenseNumber: '', specialization: '', hospitalId: '', password: ''
  });
  
  const [editDoctorForm, setEditDoctorForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', 
    licenseNumber: '', specialization: '', hospitalId: '', isActive: true
  });
  
  const [patientForm, setPatientForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', 
    bloodType: '', allergies: '', assignedDoctor: ''
  });
  
  const [specializationForm, setSpecializationForm] = useState({
    name: '', description: '', isActive: true
  });

  // ============================================
  // FETCH DATA
  // ============================================
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
    fetchAllData();
  }, [activeTab]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [statsRes, hospitalsRes, doctorsRes, patientsRes, specializationsRes] = await Promise.all([
        api.get('/admin/dashboard/stats'),
        api.get('/admin/hospitals'),
        api.get('/admin/doctors'),
        api.get('/admin/patients'),
        api.get('/admin/specializations')
      ]);
      setStats(statsRes.data.stats);
      setRecentPatients(statsRes.data.recentPatients || []);
      setRecentDoctors(statsRes.data.recentDoctors || []);
      setHospitals(hospitalsRes.data);
      setDoctors(doctorsRes.data);
      setAllPatients(patientsRes.data);
      setSpecializations(specializationsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setErrorMsg('Failed to load data');
    } finally {
      setLoading(false);
      setTimeout(() => {
        setSuccessMsg('');
        setErrorMsg('');
      }, 3000);
    }
  };

  // ============================================
  // HOSPITAL CRUD
  // ============================================
  const handleAddHospital = async (e) => {
    e.preventDefault();
    setLoadingSubmit(true);
    try {
      if (editingHospital) {
        await api.put(`/admin/hospitals/${editingHospital._id}`, hospitalForm);
        setSuccessMsg('Hospital updated successfully');
      } else {
        await api.post('/admin/hospitals', hospitalForm);
        setSuccessMsg('Hospital added successfully');
      }
      setShowHospitalModal(false);
      setEditingHospital(null);
      setHospitalForm({ name: '', address: '', city: '', pincode: '', phone: '', email: '' });
      await fetchAllData();
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Failed to save hospital');
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleDeleteHospital = async (id) => {
    if (window.confirm('Are you sure you want to delete this hospital?')) {
      setLoadingSubmit(true);
      try {
        await api.delete(`/admin/hospitals/${id}`);
        setSuccessMsg('Hospital deleted successfully');
        await fetchAllData();
      } catch (error) {
        setErrorMsg(error.response?.data?.message || 'Failed to delete hospital');
      } finally {
        setLoadingSubmit(false);
      }
    }
  };

  // ============================================
  // DOCTOR CRUD
  // ============================================
  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    setLoadingSubmit(true);
    setErrorMsg('');
    
    if (!doctorForm.password || doctorForm.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      setLoadingSubmit(false);
      return;
    }
    
    try {
      const response = await api.post('/auth/create-doctor', {
        email: doctorForm.email,
        password: doctorForm.password,
        profile: {
          firstName: doctorForm.firstName,
          lastName: doctorForm.lastName,
          phone: doctorForm.phone
        },
        licenseNumber: doctorForm.licenseNumber,
        specialization: doctorForm.specialization,
        hospital: doctorForm.hospitalId || null
      });
      
      if (response.data) {
        setSuccessMsg(`Doctor ${doctorForm.firstName} ${doctorForm.lastName} created successfully!`);
        setShowDoctorModal(false);
        setDoctorForm({ 
          firstName: '', lastName: '', email: '', phone: '', 
          licenseNumber: '', specialization: '', hospitalId: '', password: '' 
        });
        await fetchAllData();
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Failed to create doctor');
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleUpdateDoctor = async (e) => {
    e.preventDefault();
    setLoadingSubmit(true);
    setErrorMsg('');
    
    try {
      const response = await api.put(`/admin/doctors/${editingDoctor._id}`, {
        firstName: editDoctorForm.firstName,
        lastName: editDoctorForm.lastName,
        phone: editDoctorForm.phone,
        licenseNumber: editDoctorForm.licenseNumber,
        specialization: editDoctorForm.specialization,
        hospital: editDoctorForm.hospitalId || null,
        isActive: editDoctorForm.isActive
      });
      
      if (response.data) {
        setSuccessMsg(`Dr. ${editDoctorForm.firstName} ${editDoctorForm.lastName} updated successfully!`);
        setShowEditDoctorModal(false);
        setEditingDoctor(null);
        await fetchAllData();
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Failed to update doctor');
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleDeleteDoctor = async (doctorId, doctorName) => {
    if (window.confirm(`Are you sure you want to permanently delete Dr. ${doctorName}? This action cannot be undone.`)) {
      setLoadingSubmit(true);
      try {
        await api.delete(`/admin/doctors/${doctorId}`);
        setSuccessMsg(`Dr. ${doctorName} has been permanently deleted.`);
        await fetchAllData();
      } catch (error) {
        setErrorMsg(error.response?.data?.message || 'Failed to delete doctor');
      } finally {
        setLoadingSubmit(false);
      }
    }
  };

  const handleToggleDoctorStatus = async (doctorId, currentStatus, doctorName) => {
    try {
      const response = await api.patch(`/admin/doctors/${doctorId}/status`, { isActive: !currentStatus });
      if (response.data) {
        setDoctors(prev => prev.map(doc => doc._id === doctorId ? { ...doc, isActive: !currentStatus } : doc));
        setSuccessMsg(`Dr. ${doctorName} has been ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Failed to update doctor status');
      setTimeout(() => setErrorMsg(''), 3000);
    }
  };

  // ============================================
  // PATIENT CRUD
  // ============================================
  const handleSavePatient = async (e) => {
    e.preventDefault();
    setLoadingSubmit(true);
    try {
      if (editingPatient) {
        // UPDATE existing patient - only update basic info and doctor assignment
        await api.put(`/admin/patients/${editingPatient._id}`, {
          firstName: patientForm.firstName,
          lastName: patientForm.lastName,
          email: patientForm.email,
          phone: patientForm.phone || '',
          assignedDoctor: patientForm.assignedDoctor || null
        });
        setSuccessMsg('Patient updated successfully');
      } else {
        // CREATE new patient - only basic info
        const userRes = await api.post('/auth/register', {
          email: patientForm.email,
          password: 'patient123',
          role: 'patient',
          profile: {
            firstName: patientForm.firstName,
            lastName: patientForm.lastName,
            phone: patientForm.phone || '1234567890'
          }
        });
        
        // Create patient record with optional doctor assignment
        await api.post('/patients', {
          userId: userRes.data.user.id,
          bloodType: '',  // Empty - to be filled by doctor
          allergies: [],  // Empty - to be filled by doctor
          assignedDoctor: patientForm.assignedDoctor || null
        });
        setSuccessMsg('Patient created successfully');
      }
      setShowPatientModal(false);
      setEditingPatient(null);
      setPatientForm({ firstName: '', lastName: '', email: '', phone: '', assignedDoctor: '' });
      await fetchAllData();
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Failed to save patient');
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleDeletePatient = async (patientId, patientName) => {
    if (window.confirm(`Are you sure you want to permanently delete ${patientName}? This will also delete all their health records.`)) {
      setLoadingSubmit(true);
      try {
        await api.delete(`/admin/patients/${patientId}`);
        setSuccessMsg(`${patientName} has been permanently deleted.`);
        await fetchAllData();
      } catch (error) {
        setErrorMsg(error.response?.data?.message || 'Failed to delete patient');
      } finally {
        setLoadingSubmit(false);
      }
    }
  };

  const handleTogglePatientStatus = async (patientId, currentStatus, patientName) => {
    try {
      const response = await api.patch(`/admin/patients/${patientId}/status`, { isActive: !currentStatus });
      if (response.data) {
        // Update local state immediately
        setAllPatients(prev => prev.map(patient => 
          patient._id === patientId 
            ? { ...patient, user: { ...patient.user, isActive: !currentStatus } }
            : patient
        ));
        setSuccessMsg(`${patientName} has been ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Failed to update patient status');
      setTimeout(() => setErrorMsg(''), 3000);
    }
  };

  // ============================================
  // SPECIALIZATION CRUD
  // ============================================
  const handleSaveSpecialization = async (e) => {
    e.preventDefault();
    setLoadingSubmit(true);
    try {
      if (editingSpecialization) {
        await api.put(`/admin/specializations/${editingSpecialization._id}`, specializationForm);
        setSuccessMsg('Specialization updated successfully');
      } else {
        await api.post('/admin/specializations', specializationForm);
        setSuccessMsg('Specialization added successfully');
      }
      setShowSpecializationModal(false);
      setEditingSpecialization(null);
      setSpecializationForm({ name: '', description: '', isActive: true });
      await fetchAllData();
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Failed to save specialization');
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleDeleteSpecialization = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) {
      setLoadingSubmit(true);
      try {
        await api.delete(`/admin/specializations/${id}`);
        setSuccessMsg(`Specialization "${name}" deleted successfully`);
        await fetchAllData();
      } catch (error) {
        setErrorMsg(error.response?.data?.message || 'Failed to delete specialization');
      } finally {
        setLoadingSubmit(false);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    window.location.href = '/';
  };

  // Filter patients based on search
  const filteredPatients = allPatients.filter(patient => 
    patient.user?.profile?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statsCards = [
    { title: 'Total Patients', value: stats.totalPatients, icon: <Users size={24} />, color: '#3B82F6' },
    { title: 'Total Doctors', value: stats.totalDoctors, icon: <Stethoscope size={24} />, color: '#10B981' },
    { title: 'Total Hospitals', value: stats.totalHospitals, icon: <Building size={24} />, color: '#8B5CF6' },
    { title: 'Appointments', value: stats.totalAppointments, icon: <Calendar size={24} />, color: '#F59E0B' }
  ];

  const doctorDistribution = specializations.slice(0, 6).map(spec => ({
    name: spec.name,
    value: doctors.filter(d => d.specialization === spec.name).length || 5
  }));

  return (
    <div className="admin-dashboard-container">
      {/* Messages */}
      {successMsg && <div className="success-message"><CheckCircle size={16} /> {successMsg}</div>}
      {errorMsg && <div className="error-message"><AlertCircle size={16} /> {errorMsg}</div>}

      <div className="dashboard-welcome">
        <h1>Dashboard Overview</h1>
        <p>Welcome back, {user?.profile?.firstName || 'Admin'}. Here's what's happening today.</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {statsCards.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-icon" style={{ background: `${stat.color}10`, color: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-info">
              <h3>{stat.title}</h3>
              <div className="stat-value">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
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

      {/* Navigation Tabs */}
      <div className="admin-tabs">
        <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
          <LayoutDashboard size={16} /> Overview
        </button>
        <button className={`tab-btn ${activeTab === 'hospitals' ? 'active' : ''}`} onClick={() => setActiveTab('hospitals')}>
          <Building size={16} /> Hospitals
        </button>
        <button className={`tab-btn ${activeTab === 'doctors' ? 'active' : ''}`} onClick={() => setActiveTab('doctors')}>
          <Stethoscope size={16} /> Doctors
        </button>
        <button className={`tab-btn ${activeTab === 'patients' ? 'active' : ''}`} onClick={() => setActiveTab('patients')}>
          <Users size={16} /> Patients
        </button>
        <button className={`tab-btn ${activeTab === 'specializations' ? 'active' : ''}`} onClick={() => setActiveTab('specializations')}>
          <Award size={16} /> Specializations
        </button>
      </div>

      {/* ============================================ */}
      {/* OVERVIEW TAB */}
      {/* ============================================ */}
      {activeTab === 'overview' && (
        <div className="overview-tab">
          <div className="recent-section">
            <h3><Users size={16} /> Recent Patients</h3>
            <div className="recent-list">
              {recentPatients.length === 0 ? (
                <div className="empty-state">No patients yet</div>
              ) : (
                recentPatients.map(patient => (
                  <div key={patient._id} className="recent-item">
                    <div className="recent-avatar">
                      {patient.user?.profile?.firstName?.[0]}{patient.user?.profile?.lastName?.[0]}
                    </div>
                    <div className="recent-info">
                      <div className="recent-name">
                        {patient.user?.profile?.firstName} {patient.user?.profile?.lastName}
                      </div>
                      <div className="recent-email">{patient.user?.email}</div>
                    </div>
                    <div className="recent-date">
                      {new Date(patient.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="recent-section">
            <h3><Stethoscope size={16} /> Recent Doctors</h3>
            <div className="recent-list">
              {recentDoctors.length === 0 ? (
                <div className="empty-state">No doctors yet.</div>
              ) : (
                recentDoctors.map(doctor => (
                  <div key={doctor._id} className="recent-item">
                    <div className="recent-avatar">
                      {doctor.profile?.firstName?.[0]}{doctor.profile?.lastName?.[0]}
                    </div>
                    <div className="recent-info">
                      <div className="recent-name">
                        Dr. {doctor.profile?.firstName} {doctor.profile?.lastName}
                      </div>
                      <div className="recent-email">{doctor.email}</div>
                    </div>
                    <div className="recent-date">
                      {new Date(doctor.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* HOSPITALS TAB */}
      {/* ============================================ */}
      {activeTab === 'hospitals' && (
        <div className="hospitals-tab">
          <div className="tab-header">
            <h3><Building size={18} /> Hospitals</h3>
            <Button variant="primary" size="sm" onClick={() => {
              setEditingHospital(null);
              setHospitalForm({ name: '', address: '', city: '', pincode: '', phone: '', email: '' });
              setShowHospitalModal(true);
            }}>
              <Plus size={16} /> Add Hospital
            </Button>
          </div>
          <div className="hospitals-grid">
            {hospitals.length === 0 ? (
              <div className="empty-state">No hospitals added yet.</div>
            ) : (
              hospitals.map(hospital => (
                <div key={hospital._id} className="hospital-card">
                  <div className="hospital-header">
                    <h4><Hospital size={16} /> {hospital.name}</h4>
                    <div className="hospital-actions">
                      <button onClick={() => {
                        setEditingHospital(hospital);
                        setHospitalForm(hospital);
                        setShowHospitalModal(true);
                      }}><Edit size={16} /></button>
                      <button onClick={() => handleDeleteHospital(hospital._id)}><Trash2 size={16} /></button>
                    </div>
                  </div>
                  <div className="hospital-details">
                    <p>{hospital.address}, {hospital.city}</p>
                    <p><Phone size={12} /> {hospital.phone}</p>
                    <p><Mail size={12} /> {hospital.email}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* DOCTORS TAB */}
      {/* ============================================ */}
      {activeTab === 'doctors' && (
        <div className="doctors-tab">
          <div className="tab-header">
            <h3><Stethoscope size={18} /> Doctors</h3>
            <Button variant="primary" size="sm" onClick={() => setShowDoctorModal(true)}>
              <UserPlus size={16} /> Create Doctor
            </Button>
          </div>
          <div className="doctors-table-container">
            {doctors.length === 0 ? (
              <div className="empty-state">No doctors created yet.</div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Specialization</th>
                    <th>License</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.map(doc => (
                    <tr key={doc._id}>
                      <td>Dr. {doc.profile?.firstName} {doc.profile?.lastName}</td>
                      <td>{doc.email}</td>
                      <td>{doc.specialization || 'N/A'}</td>
                      <td>{doc.licenseNumber || 'N/A'}</td>
                      <td><span className={`status-badge ${doc.isActive ? 'active' : 'inactive'}`}>{doc.isActive ? 'Active' : 'Inactive'}</span></td>
                      <td className="action-buttons-cell">
                        <button className="edit-btn" onClick={() => {
                          setEditingDoctor(doc);
                          setEditDoctorForm({
                            firstName: doc.profile?.firstName || '',
                            lastName: doc.profile?.lastName || '',
                            email: doc.email || '',
                            phone: doc.profile?.phone || '',
                            licenseNumber: doc.licenseNumber || '',
                            specialization: doc.specialization || '',
                            hospitalId: doc.hospital?._id || '',
                            isActive: doc.isActive
                          });
                          setShowEditDoctorModal(true);
                        }}><Edit size={14} /> Edit</button>
                        <button className={`status-toggle ${doc.isActive ? 'deactivate' : 'activate'}`} onClick={() => handleToggleDoctorStatus(doc._id, doc.isActive, `${doc.profile?.firstName} ${doc.profile?.lastName}`)}>{doc.isActive ? 'Deactivate' : 'Activate'}</button>
                        <button className="delete-btn" onClick={() => handleDeleteDoctor(doc._id, `${doc.profile?.firstName} ${doc.profile?.lastName}`)}><Trash2 size={14} /> Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* PATIENTS TAB */}
      {/* ============================================ */}
      {activeTab === 'patients' && (
        <div className="patients-tab">
          <div className="tab-header">
            <h3><Users size={18} /> Patient Management</h3>
            <div className="header-actions">
              <div className="search-bar">
                <Search size={16} />
                <input 
                  type="text" 
                  placeholder="Search patients..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="primary" size="sm" onClick={() => {
                setEditingPatient(null);
                setPatientForm({ firstName: '', lastName: '', email: '', phone: '', bloodType: '', allergies: '', assignedDoctor: '' });
                setShowPatientModal(true);
              }}>
                <Plus size={16} /> Add Patient
              </Button>
            </div>
          </div>
          <div className="patients-table-container">
            {filteredPatients.length === 0 ? (
              <div className="empty-state">No patients found.</div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Assigned Doctor</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map(patient => (
                    <tr key={patient._id}>
                      <td>{patient.user?.profile?.firstName} {patient.user?.profile?.lastName}</td>
                      <td>{patient.user?.email}</td>
                      <td>{patient.user?.profile?.phone || 'N/A'}</td>
                      <td>{patient.assignedDoctor?.profile?.firstName ? `Dr. ${patient.assignedDoctor.profile.firstName} ${patient.assignedDoctor.profile.lastName}` : 'None'}</td>
                      <td><span className={`status-badge ${patient.user?.isActive === true ? 'active' : 'inactive'}`}>{patient.user?.isActive === true ? 'Active' : 'Inactive'}</span></td>
                      <td className="action-buttons-cell">

                        <button className={`status-toggle ${patient.user?.isActive === true ? 'deactivate' : 'activate'}`} onClick={() => handleTogglePatientStatus(patient._id, patient.user?.isActive === true, `${patient.user?.profile?.firstName} ${patient.user?.profile?.lastName}`)}>{patient.user?.isActive === true ? 'Deactivate' : 'Activate'}</button>
                        <button className="edit-btn" onClick={() => {
                          setEditingPatient(patient);
                          setPatientForm({
                            firstName: patient.user?.profile?.firstName || '',
                            lastName: patient.user?.profile?.lastName || '',
                            email: patient.user?.email || '',
                            phone: patient.user?.profile?.phone || '',
                            assignedDoctor: patient.assignedDoctor?._id || ''
                          });
                          setShowPatientModal(true);
                        }}>
                          <Edit size={14} /> Edit
                        </button>
                        <button className="delete-btn" onClick={() => handleDeletePatient(patient._id, `${patient.user?.profile?.firstName} ${patient.user?.profile?.lastName}`)}><Trash2 size={14} /> Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* SPECIALIZATIONS TAB */}
      {/* ============================================ */}
      {activeTab === 'specializations' && (
        <div className="specializations-tab">
          <div className="tab-header">
            <h3><Award size={18} /> Medical Specializations</h3>
            <Button variant="primary" size="sm" onClick={() => {
              setEditingSpecialization(null);
              setSpecializationForm({ name: '', description: '', isActive: true });
              setShowSpecializationModal(true);
            }}>
              <Plus size={16} /> Add Specialization
            </Button>
          </div>
          <div className="specializations-grid">
            {specializations.length === 0 ? (
              <div className="empty-state">No specializations added yet.</div>
            ) : (
              specializations.map(spec => (
                <div key={spec._id} className="specialization-card">
                  <div className="specialization-header">
                    <h4>{spec.name}</h4>
                    <div className="specialization-actions">
                      <button className="edit-btn" onClick={() => {
                        setEditingSpecialization(spec);
                        setSpecializationForm({
                          name: spec.name,
                          description: spec.description || '',
                          isActive: spec.isActive
                        });
                        setShowSpecializationModal(true);
                      }}><Edit size={14} /></button>
                      <button className="delete-btn" onClick={() => handleDeleteSpecialization(spec._id, spec.name)}><Trash2 size={14} /></button>
                    </div>
                  </div>
                  {spec.description && <p className="specialization-desc">{spec.description}</p>}
                  <div className="specialization-status">
                    <span className={`status-badge ${spec.isActive ? 'active' : 'inactive'}`}>{spec.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* MODALS */}
      {/* ============================================ */}

      {/* Add/Edit Hospital Modal */}
      {showHospitalModal && (
        <div className="modal-overlay" onClick={() => setShowHospitalModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingHospital ? 'Edit Hospital' : 'Add New Hospital'}</h3>
              <button className="close-btn" onClick={() => setShowHospitalModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddHospital}>
              <input type="text" placeholder="Hospital Name *" value={hospitalForm.name} onChange={(e) => setHospitalForm({...hospitalForm, name: e.target.value})} required />
              <input type="text" placeholder="Address" value={hospitalForm.address} onChange={(e) => setHospitalForm({...hospitalForm, address: e.target.value})} />
              <input type="text" placeholder="City" value={hospitalForm.city} onChange={(e) => setHospitalForm({...hospitalForm, city: e.target.value})} />
              <input type="text" placeholder="Pincode" value={hospitalForm.pincode} onChange={(e) => setHospitalForm({...hospitalForm, pincode: e.target.value})} />
              <input type="tel" placeholder="Phone" value={hospitalForm.phone} onChange={(e) => setHospitalForm({...hospitalForm, phone: e.target.value})} />
              <input type="email" placeholder="Email" value={hospitalForm.email} onChange={(e) => setHospitalForm({...hospitalForm, email: e.target.value})} />
              <div className="modal-actions">
                <button type="button" onClick={() => setShowHospitalModal(false)}>Cancel</button>
                <button type="submit" disabled={loadingSubmit}>{loadingSubmit ? 'Saving...' : (editingHospital ? 'Update' : 'Add')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Doctor Modal */}
      {showDoctorModal && (
        <div className="modal-overlay" onClick={() => setShowDoctorModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Doctor Account</h3>
              <button className="close-btn" onClick={() => setShowDoctorModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateDoctor}>
              <div className="form-row">
                <input type="text" placeholder="First Name *" value={doctorForm.firstName} onChange={(e) => setDoctorForm({...doctorForm, firstName: e.target.value})} required />
                <input type="text" placeholder="Last Name *" value={doctorForm.lastName} onChange={(e) => setDoctorForm({...doctorForm, lastName: e.target.value})} required />
              </div>
              <input type="email" placeholder="Email *" value={doctorForm.email} onChange={(e) => setDoctorForm({...doctorForm, email: e.target.value})} required />
              <input type="password" placeholder="Password *" value={doctorForm.password} onChange={(e) => setDoctorForm({...doctorForm, password: e.target.value})} required />
              <input type="tel" placeholder="Phone" value={doctorForm.phone} onChange={(e) => setDoctorForm({...doctorForm, phone: e.target.value})} />
              <input type="text" placeholder="License Number" value={doctorForm.licenseNumber} onChange={(e) => setDoctorForm({...doctorForm, licenseNumber: e.target.value})} />
              <select value={doctorForm.specialization} onChange={(e) => setDoctorForm({...doctorForm, specialization: e.target.value})} required>
                <option value="">Select Specialization</option>
                {specializations.map(spec => <option key={spec._id} value={spec.name}>{spec.name}</option>)}
              </select>
              <select value={doctorForm.hospitalId} onChange={(e) => setDoctorForm({...doctorForm, hospitalId: e.target.value})}>
                <option value="">Select Hospital</option>
                {hospitals.map(h => <option key={h._id} value={h._id}>{h.name}</option>)}
              </select>
              <div className="info-note"><AlertCircle size={14} /> Doctor will use this email and password to log in.</div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowDoctorModal(false)}>Cancel</button>
                <button type="submit" disabled={loadingSubmit}>{loadingSubmit ? 'Creating...' : 'Create Doctor'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Doctor Modal */}
      {showEditDoctorModal && editingDoctor && (
        <div className="modal-overlay" onClick={() => setShowEditDoctorModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Doctor: Dr. {editingDoctor.profile?.firstName} {editingDoctor.profile?.lastName}</h3>
              <button className="close-btn" onClick={() => setShowEditDoctorModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleUpdateDoctor}>
              <div className="form-row">
                <input type="text" placeholder="First Name" value={editDoctorForm.firstName} onChange={(e) => setEditDoctorForm({...editDoctorForm, firstName: e.target.value})} required />
                <input type="text" placeholder="Last Name" value={editDoctorForm.lastName} onChange={(e) => setEditDoctorForm({...editDoctorForm, lastName: e.target.value})} required />
              </div>
              <input type="email" placeholder="Email" value={editDoctorForm.email} disabled className="disabled-input" />
              <input type="tel" placeholder="Phone" value={editDoctorForm.phone} onChange={(e) => setEditDoctorForm({...editDoctorForm, phone: e.target.value})} />
              <input type="text" placeholder="License Number" value={editDoctorForm.licenseNumber} onChange={(e) => setEditDoctorForm({...editDoctorForm, licenseNumber: e.target.value})} />
              <select value={editDoctorForm.specialization} onChange={(e) => setEditDoctorForm({...editDoctorForm, specialization: e.target.value})}>
                <option value="">Select Specialization</option>
                {specializations.map(spec => <option key={spec._id} value={spec.name}>{spec.name}</option>)}
              </select>
              <select value={editDoctorForm.hospitalId} onChange={(e) => setEditDoctorForm({...editDoctorForm, hospitalId: e.target.value})}>
                <option value="">Select Hospital</option>
                {hospitals.map(h => <option key={h._id} value={h._id}>{h.name}</option>)}
              </select>
              <label className="checkbox-label"><input type="checkbox" checked={editDoctorForm.isActive} onChange={(e) => setEditDoctorForm({...editDoctorForm, isActive: e.target.checked})} /> Active Account</label>
              <div className="info-note"><AlertCircle size={14} /> Email cannot be changed.</div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowEditDoctorModal(false)}>Cancel</button>
                <button type="submit" disabled={loadingSubmit}>{loadingSubmit ? 'Saving...' : 'Update Doctor'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Patient Modal */}
      {showPatientModal && (
        <div className="modal-overlay" onClick={() => setShowPatientModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingPatient ? 'Edit Patient' : 'Add New Patient'}</h3>
              <button className="close-btn" onClick={() => setShowPatientModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSavePatient}>
              <div className="form-row">
                <input 
                  type="text" 
                  placeholder="First Name *" 
                  value={patientForm.firstName} 
                  onChange={(e) => setPatientForm({...patientForm, firstName: e.target.value})} 
                  required 
                />
                <input 
                  type="text" 
                  placeholder="Last Name *" 
                  value={patientForm.lastName} 
                  onChange={(e) => setPatientForm({...patientForm, lastName: e.target.value})} 
                  required 
                />
              </div>
              <input 
                type="email" 
                placeholder="Email *" 
                value={patientForm.email} 
                onChange={(e) => setPatientForm({...patientForm, email: e.target.value})} 
                required 
              />
              {!editingPatient && (
                <div className="info-note">
                  <AlertCircle size={14} />
                  <span>Patient will receive a temporary password: patient123</span>
                </div>
              )}
              
              {/* Doctor Assignment - Only for admin */}
              <select 
                value={patientForm.assignedDoctor} 
                onChange={(e) => setPatientForm({...patientForm, assignedDoctor: e.target.value})}
              >
                <option value="">Assign Doctor (Optional)</option>
                {doctors.filter(d => d.isActive !== false).map(doc => (
                  <option key={doc._id} value={doc._id}>
                    Dr. {doc.profile?.firstName} {doc.profile?.lastName} - {doc.specialization || 'General'}
                  </option>
                ))}
              </select>
              
              <div className="modal-actions">
                <button type="button" onClick={() => setShowPatientModal(false)}>Cancel</button>
                <button type="submit" disabled={loadingSubmit}>
                  {loadingSubmit ? 'Saving...' : (editingPatient ? 'Update' : 'Create Patient')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Specialization Modal */}
      {showSpecializationModal && (
        <div className="modal-overlay" onClick={() => setShowSpecializationModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingSpecialization ? 'Edit Specialization' : 'Add New Specialization'}</h3>
              <button className="close-btn" onClick={() => setShowSpecializationModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveSpecialization}>
              <input type="text" placeholder="Specialization Name" value={specializationForm.name} onChange={(e) => setSpecializationForm({...specializationForm, name: e.target.value})} required />
              <textarea placeholder="Description (optional)" value={specializationForm.description} onChange={(e) => setSpecializationForm({...specializationForm, description: e.target.value})} rows="3" />
              {editingSpecialization && (<label className="checkbox-label"><input type="checkbox" checked={specializationForm.isActive} onChange={(e) => setSpecializationForm({...specializationForm, isActive: e.target.checked})} /> Active</label>)}
              <div className="modal-actions">
                <button type="button" onClick={() => setShowSpecializationModal(false)}>Cancel</button>
                <button type="submit" disabled={loadingSubmit}>{loadingSubmit ? 'Saving...' : (editingSpecialization ? 'Update' : 'Add')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;