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

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
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
  const [specializations, setSpecializations] = useState([
    'Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 
    'Dermatology', 'Psychiatry', 'Ophthalmology', 'ENT'
  ]);
  const [loading, setLoading] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [showHospitalModal, setShowHospitalModal] = useState(false);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showSpecializationModal, setShowSpecializationModal] = useState(false);
  const [editingHospital, setEditingHospital] = useState(null);
  const [editingPatient, setEditingPatient] = useState(null);
  const [user, setUser] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const [hospitalForm, setHospitalForm] = useState({
    name: '', address: '', city: '', pincode: '', phone: '', email: ''
  });
  
  const [doctorForm, setDoctorForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', 
    licenseNumber: '', specialization: '', hospitalId: '', password: ''
  });
  
  const [patientForm, setPatientForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', 
    bloodType: '', allergies: '', assignedDoctor: ''
  });
  
  const [newSpecialization, setNewSpecialization] = useState('');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
    fetchAllData();
  }, [initialTab]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [statsRes, hospitalsRes, doctorsRes, patientsRes] = await Promise.all([
        api.get('/admin/dashboard/stats'),
        api.get('/admin/hospitals'),
        api.get('/admin/doctors'),
        api.get('/admin/patients')
      ]);
      setStats(statsRes.data.stats);
      setRecentPatients(statsRes.data.recentPatients || []);
      setRecentDoctors(statsRes.data.recentDoctors || []);
      setHospitals(hospitalsRes.data);
      setDoctors(doctorsRes.data);
      setAllPatients(patientsRes.data);
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

  // Hospital CRUD
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
      fetchAllData();
    } catch (error) {
      setErrorMsg('Failed to save hospital');
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleDeleteHospital = async (id) => {
    if (window.confirm('Are you sure you want to delete this hospital?')) {
      try {
        await api.delete(`/admin/hospitals/${id}`);
        setSuccessMsg('Hospital deleted successfully');
        fetchAllData();
      } catch (error) {
        setErrorMsg('Failed to delete hospital');
      }
    }
  };

  // Doctor CRUD
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
        hospital: doctorForm.hospitalId
      });
      
      if (response.data) {
        setSuccessMsg(`Doctor ${doctorForm.firstName} ${doctorForm.lastName} created successfully!`);
        setShowDoctorModal(false);
        setDoctorForm({ 
          firstName: '', lastName: '', email: '', phone: '', 
          licenseNumber: '', specialization: '', hospitalId: '', password: '' 
        });
        fetchAllData();
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Failed to create doctor');
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleDeleteDoctor = async (doctorId, doctorName) => {
    if (window.confirm(`Are you sure you want to permanently delete Dr. ${doctorName}? This action cannot be undone.`)) {
      try {
        await api.delete(`/admin/doctors/${doctorId}`);
        setSuccessMsg(`Dr. ${doctorName} has been permanently deleted.`);
        fetchAllData();
      } catch (error) {
        setErrorMsg(error.response?.data?.message || 'Failed to delete doctor');
      }
    }
  };

  const handleToggleDoctorStatus = async (doctorId, currentStatus) => {
    try {
      await api.patch(`/admin/doctors/${doctorId}/status`, { isActive: !currentStatus });
      setSuccessMsg(`Doctor ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchAllData();
    } catch (error) {
      setErrorMsg('Failed to update doctor status');
    }
  };

  // Patient CRUD
  const handleSavePatient = async (e) => {
    e.preventDefault();
    setLoadingSubmit(true);
    try {
      if (editingPatient) {
        await api.put(`/admin/patients/${editingPatient._id}`, patientForm);
        setSuccessMsg('Patient updated successfully');
      } else {
        // First create user account
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
        // Then create patient record
        await api.post('/patients', {
          userId: userRes.data.user.id,
          bloodType: patientForm.bloodType,
          allergies: patientForm.allergies ? patientForm.allergies.split(',').map(a => a.trim()) : [],
          assignedDoctor: patientForm.assignedDoctor || null
        });
        setSuccessMsg('Patient created successfully');
      }
      setShowPatientModal(false);
      setEditingPatient(null);
      setPatientForm({ firstName: '', lastName: '', email: '', phone: '', bloodType: '', allergies: '', assignedDoctor: '' });
      fetchAllData();
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Failed to save patient');
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleDeletePatient = async (patientId, patientName) => {
    if (window.confirm(`Are you sure you want to permanently delete ${patientName}? This will also delete all their health records.`)) {
      try {
        await api.delete(`/admin/patients/${patientId}`);
        setSuccessMsg(`${patientName} has been permanently deleted.`);
        fetchAllData();
      } catch (error) {
        setErrorMsg(error.response?.data?.message || 'Failed to delete patient');
      }
    }
  };

  const handleAddSpecialization = async () => {
    if (!newSpecialization.trim()) return;
    setSpecializations([...specializations, newSpecialization]);
    setNewSpecialization('');
    setShowSpecializationModal(false);
    setSuccessMsg('Specialization added successfully');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    window.location.href = '/';
  };

  const statsCards = [
    { title: 'Total Patients', value: stats.totalPatients, icon: <Users size={24} />, color: '#3B82F6' },
    { title: 'Total Doctors', value: stats.totalDoctors, icon: <Stethoscope size={24} />, color: '#10B981' },
    { title: 'Total Hospitals', value: stats.totalHospitals, icon: <Building size={24} />, color: '#8B5CF6' },
    { title: 'Appointments', value: stats.totalAppointments, icon: <Calendar size={24} />, color: '#F59E0B' }
  ];

  const doctorDistribution = specializations.slice(0, 6).map(spec => ({
    name: spec,
    value: doctors.filter(d => d.specialization === spec).length || 5
  }));

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="dashboard-header-bar">
        <div className="header-logo">
          <Heart size={28} strokeWidth={1.5} />
          <span>AEGIS Admin</span>
        </div>
        <div className="header-user">
          <span className="user-name">Admin {user?.profile?.firstName || ''}</span>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        {/* Messages */}
        {successMsg && <div className="success-message"><CheckCircle size={16} /> {successMsg}</div>}
        {errorMsg && <div className="error-message"><AlertCircle size={16} /> {errorMsg}</div>}

        <div className="dashboard-welcome">
          <h1>Admin Dashboard</h1>
          <p>Manage hospitals, doctors, patients, and monitor system activity.</p>
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
            <h3>Doctor Distribution by Specialization</h3>
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
            Overview
          </button>
          <button className={`tab-btn ${activeTab === 'hospitals' ? 'active' : ''}`} onClick={() => setActiveTab('hospitals')}>
            Hospitals
          </button>
          <button className={`tab-btn ${activeTab === 'doctors' ? 'active' : ''}`} onClick={() => setActiveTab('doctors')}>
            Doctors
          </button>
          <button className={`tab-btn ${activeTab === 'patients' ? 'active' : ''}`} onClick={() => setActiveTab('patients')}>
            Patients
          </button>
          <button className={`tab-btn ${activeTab === 'specializations' ? 'active' : ''}`} onClick={() => setActiveTab('specializations')}>
            Specializations
          </button>
        </div>

        {/* Overview Tab */}
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
                  <div className="empty-state">No doctors yet. Create your first doctor.</div>
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

        {/* Hospitals Tab */}
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
                <div className="empty-state">No hospitals added yet. Click "Add Hospital" to get started.</div>
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
                        }} title="Edit">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDeleteHospital(hospital._id)} title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="hospital-details">
                      <p><span className="detail-label">Address:</span> {hospital.address}, {hospital.city}</p>
                      <p><Phone size={12} /> {hospital.phone}</p>
                      <p><Mail size={12} /> {hospital.email}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Doctors Tab */}
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
                <div className="empty-state">No doctors created yet. Click "Create Doctor" to get started.</div>
              ) : (
                <table className="doctors-table">
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
                    {doctors.map(doctor => (
                      <tr key={doctor._id}>
                        <td>Dr. {doctor.profile?.firstName} {doctor.profile?.lastName}</td>
                        <td>{doctor.email}</td>
                        <td>{doctor.specialization || 'N/A'}</td>
                        <td>{doctor.licenseNumber || 'N/A'}</td>
                        <td>
                          <span className={`status-badge ${doctor.isActive ? 'active' : 'inactive'}`}>
                            {doctor.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="action-buttons-cell">
                          <button 
                            className={`status-toggle ${doctor.isActive ? 'deactivate' : 'activate'}`}
                            onClick={() => handleToggleDoctorStatus(doctor._id, doctor.isActive)}
                          >
                            {doctor.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button 
                            className="delete-btn"
                            onClick={() => handleDeleteDoctor(doctor._id, `${doctor.profile?.firstName} ${doctor.profile?.lastName}`)}
                          >
                            <Trash2 size={16} /> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Patients Tab */}
        {activeTab === 'patients' && (
          <div className="patients-tab">
            <div className="tab-header">
              <h3><Users size={18} /> Patient Management</h3>
              <Button variant="primary" size="sm" onClick={() => {
                setEditingPatient(null);
                setPatientForm({ firstName: '', lastName: '', email: '', phone: '', bloodType: '', allergies: '', assignedDoctor: '' });
                setShowPatientModal(true);
              }}>
                <Plus size={16} /> Add Patient
              </Button>
            </div>
            <div className="patients-table-container">
              {allPatients.length === 0 ? (
                <div className="empty-state">No patients found.</div>
              ) : (
                <table className="doctors-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Blood Type</th>
                      <th>Assigned Doctor</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allPatients.map(patient => (
                      <tr key={patient._id}>
                        <td>{patient.user?.profile?.firstName} {patient.user?.profile?.lastName}</td>
                        <td>{patient.user?.email}</td>
                        <td>{patient.user?.profile?.phone || 'N/A'}</td>
                        <td>{patient.bloodType || 'N/A'}</td>
                        <td>{patient.assignedDoctor?.profile?.firstName ? `Dr. ${patient.assignedDoctor.profile.firstName} ${patient.assignedDoctor.profile.lastName}` : 'None'}</td>
                        <td className="action-buttons-cell">
                          <button 
                            className="edit-btn"
                            onClick={() => {
                              setEditingPatient(patient);
                              setPatientForm({
                                firstName: patient.user?.profile?.firstName || '',
                                lastName: patient.user?.profile?.lastName || '',
                                email: patient.user?.email || '',
                                phone: patient.user?.profile?.phone || '',
                                bloodType: patient.bloodType || '',
                                allergies: patient.allergies?.join(', ') || '',
                                assignedDoctor: patient.assignedDoctor?._id || ''
                              });
                              setShowPatientModal(true);
                            }}
                          >
                            <Edit size={16} /> Edit
                          </button>
                          <button 
                            className="delete-btn"
                            onClick={() => handleDeletePatient(patient._id, `${patient.user?.profile?.firstName} ${patient.user?.profile?.lastName}`)}
                          >
                            <Trash2 size={16} /> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Specializations Tab */}
        {activeTab === 'specializations' && (
          <div className="specializations-tab">
            <div className="tab-header">
              <h3><Award size={18} /> Specializations</h3>
              <Button variant="primary" size="sm" onClick={() => setShowSpecializationModal(true)}>
                <Plus size={16} /> Add Specialization
              </Button>
            </div>
            <div className="specializations-list">
              {specializations.map((spec, index) => (
                <div key={index} className="specialization-card">
                  <span className="spec-name">{spec}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Add/Edit Hospital Modal */}
      {showHospitalModal && (
        <div className="modal-overlay" onClick={() => setShowHospitalModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingHospital ? 'Edit Hospital' : 'Add New Hospital'}</h3>
              <button className="close-btn" onClick={() => setShowHospitalModal(false)}>×</button>
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
          <div className="modal-content doctor-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Doctor Account</h3>
              <button className="close-btn" onClick={() => setShowDoctorModal(false)}>×</button>
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
                <option value="">Select Specialization *</option>
                {specializations.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
              <select value={doctorForm.hospitalId} onChange={(e) => setDoctorForm({...doctorForm, hospitalId: e.target.value})}>
                <option value="">Select Hospital (Optional)</option>
                {hospitals.map(h => (
                  <option key={h._id} value={h._id}>{h.name}</option>
                ))}
              </select>
              <div className="info-note">
                <AlertCircle size={14} />
                <span>Doctor will use this email and password to log in.</span>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowDoctorModal(false)}>Cancel</button>
                <button type="submit" disabled={loadingSubmit}>{loadingSubmit ? 'Creating...' : 'Create Doctor'}</button>
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
              <button className="close-btn" onClick={() => setShowPatientModal(false)}>×</button>
            </div>
            <form onSubmit={handleSavePatient}>
              <div className="form-row">
                <input type="text" placeholder="First Name *" value={patientForm.firstName} onChange={(e) => setPatientForm({...patientForm, firstName: e.target.value})} required />
                <input type="text" placeholder="Last Name *" value={patientForm.lastName} onChange={(e) => setPatientForm({...patientForm, lastName: e.target.value})} required />
              </div>
              <input type="email" placeholder="Email *" value={patientForm.email} onChange={(e) => setPatientForm({...patientForm, email: e.target.value})} required />
              <input type="tel" placeholder="Phone" value={patientForm.phone} onChange={(e) => setPatientForm({...patientForm, phone: e.target.value})} />
              <select value={patientForm.bloodType} onChange={(e) => setPatientForm({...patientForm, bloodType: e.target.value})}>
                <option value="">Select Blood Type</option>
                <option value="A+">A+</option><option value="A-">A-</option>
                <option value="B+">B+</option><option value="B-">B-</option>
                <option value="O+">O+</option><option value="O-">O-</option>
                <option value="AB+">AB+</option><option value="AB-">AB-</option>
              </select>
              <input type="text" placeholder="Allergies (comma-separated)" value={patientForm.allergies} onChange={(e) => setPatientForm({...patientForm, allergies: e.target.value})} />
              <select value={patientForm.assignedDoctor} onChange={(e) => setPatientForm({...patientForm, assignedDoctor: e.target.value})}>
                <option value="">Assign Doctor (Optional)</option>
                {doctors.map(doc => (
                  <option key={doc._id} value={doc._id}>Dr. {doc.profile?.firstName} {doc.profile?.lastName} - {doc.specialization}</option>
                ))}
              </select>
              <div className="info-note">
                <AlertCircle size={14} />
                <span>Patient will receive temporary password: patient123</span>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowPatientModal(false)}>Cancel</button>
                <button type="submit" disabled={loadingSubmit}>{loadingSubmit ? 'Saving...' : (editingPatient ? 'Update' : 'Create')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Specialization Modal */}
      {showSpecializationModal && (
        <div className="modal-overlay" onClick={() => setShowSpecializationModal(false)}>
          <div className="modal-content small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Specialization</h3>
              <button className="close-btn" onClick={() => setShowSpecializationModal(false)}>×</button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleAddSpecialization(); }}>
              <input type="text" placeholder="Specialization Name" value={newSpecialization} onChange={(e) => setNewSpecialization(e.target.value)} required />
              <div className="modal-actions">
                <button type="button" onClick={() => setShowSpecializationModal(false)}>Cancel</button>
                <button type="submit">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;