// frontend/src/components/features/Admin/components/DoctorsTab/DoctorsTab.jsx
import React, { useState } from 'react';
import { Plus, Edit, Trash2, Stethoscope, UserPlus, ChevronDown, ChevronRight, CheckCircle, AlertCircle, Eye, Users, Building, Mail, Phone, Award } from 'lucide-react';
import Button from '../../../../common/Button/Button';
import { SearchInput } from '../../../../common/SearchInput/SearchInput';
import ConfirmModal from '../../../../common/ConfirmModal/ConfirmModal';
import DoctorDetailsModal from './DoctorDetailsModal';
import './DoctorsTab.css';

const DoctorsTab = ({ doctors, patients, onAdd, onEdit, onDelete, onToggleStatus }) => {
  const [expandedSpecs, setExpandedSpecs] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
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

  const doctorsBySpecialization = doctors.reduce((acc, doctor) => {
    const spec = doctor.specialization || 'Unassigned';
    if (!acc[spec]) acc[spec] = [];
    acc[spec].push(doctor);
    return acc;
  }, {});

  const filterDoctors = (doctorsList) => {
    return doctorsList.filter(doctor => {
      const matchesSearch = 
        doctor.profile?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.profile?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = 
        filterStatus === 'all' ? true :
        filterStatus === 'active' ? doctor.isActive === true :
        doctor.isActive === false;
      return matchesSearch && matchesStatus;
    });
  };

  const handleViewDetails = (doctor) => {
    setSelectedDoctor(doctor);
    setShowDetailsModal(true);
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

  const handleDeleteWithConfirm = (doctorId, doctorName) => {
    showConfirm(
      'Delete Doctor',
      `Are you sure you want to permanently delete Dr. ${doctorName}? This action cannot be undone.`,
      'danger',
      (data) => onDelete(data.id, data.name),
      { id: doctorId, name: doctorName }
    );
  };

  const handleToggleStatusWithConfirm = (doctorId, isActive, doctorName) => {
    const action = isActive ? 'deactivate' : 'activate';
    showConfirm(
      `${isActive ? 'Deactivate' : 'Activate'} Doctor`,
      `Are you sure you want to ${action} Dr. ${doctorName}?`,
      'warning',
      (data) => onToggleStatus(data.id, data.isActive, data.name),
      { id: doctorId, isActive, name: doctorName }
    );
  };

  const getHospitalName = (doctor) => {
    if (!doctor.hospital) return null;
    if (typeof doctor.hospital === 'object' && doctor.hospital !== null) {
      return doctor.hospital.name;
    }
    return null;
  };

  const sortedSpecs = Object.keys(doctorsBySpecialization).sort();
  const toggleSpec = (spec) => setExpandedSpecs(prev => ({ ...prev, [spec]: !prev[spec] }));
  const expandAll = () => { const all = {}; sortedSpecs.forEach(spec => { all[spec] = true; }); setExpandedSpecs(all); };
  const collapseAll = () => setExpandedSpecs({});

  const totalDoctors = doctors.length;
  const activeDoctors = doctors.filter(d => d.isActive === true).length;
  const inactiveDoctors = doctors.filter(d => d.isActive === false).length;

  return (
    <>
      <div className="doctors-tab">
        <div className="tab-header">
          <div className="header-title">
            <Stethoscope size={18} />
            <h3>Doctors</h3>
            <span className="item-count">{totalDoctors}</span>
          </div>
          <Button variant="primary" size="sm" onClick={onAdd}>
            <UserPlus size={16} /> Create Doctor
          </Button>
        </div>

        <div className="stats-row">
          <div className="stat-mini">
            <div className="stat-value">{totalDoctors}</div>
            <div className="stat-label">Total Doctors</div>
          </div>
          <div className="stat-mini success">
            <div className="stat-value">{activeDoctors}</div>
            <div className="stat-label">Active</div>
          </div>
          <div className="stat-mini warning">
            <div className="stat-value">{inactiveDoctors}</div>
            <div className="stat-label">Inactive</div>
          </div>
        </div>

        <div className="search-filter-row">
          <SearchInput 
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by name or email..."
          />
          <div className="filter-buttons">
            <button className={`filter-chip ${filterStatus === 'all' ? 'active' : ''}`} onClick={() => setFilterStatus('all')}>All</button>
            <button className={`filter-chip ${filterStatus === 'active' ? 'active' : ''}`} onClick={() => setFilterStatus('active')}><CheckCircle size={12} /> Active</button>
            <button className={`filter-chip ${filterStatus === 'inactive' ? 'active' : ''}`} onClick={() => setFilterStatus('inactive')}><AlertCircle size={12} /> Inactive</button>
          </div>
          <div className="expand-actions">
            <button className="expand-btn" onClick={expandAll}>Expand All</button>
            <button className="expand-btn" onClick={collapseAll}>Collapse All</button>
          </div>
        </div>

        <div className="specializations-container">
          {sortedSpecs.length === 0 ? (
            <div className="empty-state">
              <p>No doctors created yet.</p>
              <span>Click "Create Doctor" to add your first doctor.</span>
            </div>
          ) : (
            sortedSpecs.map(spec => {
              const filteredDoctors = filterDoctors(doctorsBySpecialization[spec]);
              if (filteredDoctors.length === 0) return null;
              
              return (
                <div key={spec} className="spec-group">
                  <div className="spec-header" onClick={() => toggleSpec(spec)}>
                    <div className="spec-title">
                      {expandedSpecs[spec] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      <span className="spec-name">{spec}</span>
                      <span className="spec-count">{filteredDoctors.length}</span>
                      <span className="spec-active">{filteredDoctors.filter(d => d.isActive).length} active</span>
                    </div>
                  </div>
                  
                  {expandedSpecs[spec] && (
                    <div className="doctors-table-wrapper">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Doctor Name</th>
                            <th>Contact</th>
                            <th>License</th>
                            <th>Hospital</th>
                            <th>Patients</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredDoctors.map(doc => {
                            const assignedPatients = patients?.filter(p => p.assignedDoctor?._id === doc._id) || [];
                            const hospitalName = getHospitalName(doc);
                            return (
                              <tr key={doc._id} className={!doc.isActive ? 'inactive-row' : ''}>
                                <td className="doctor-name-cell">
                                  <div className="doctor-name">
                                    Dr. {doc.profile?.firstName} {doc.profile?.lastName}
                                  </div>
                                  <div className="doctor-specialty">{doc.specialization || 'General'}</div>
                                 </td>
                                <td className="doctor-contact-cell">
                                  <div className="doctor-email"><Mail size={12} /> {doc.email}</div>
                                  <div className="doctor-phone"><Phone size={12} /> {doc.profile?.phone || 'No phone'}</div>
                                 </td>
                                 <td>{doc.licenseNumber || 'N/A'}</td>
                                 <td>
                                  {hospitalName ? (
                                    <div className="doctor-hospital"><Building size={12} /> {hospitalName}</div>
                                  ) : (
                                    <span className="unassigned-badge">Not assigned</span>
                                  )}
                                 </td>
                                 <td>
                                  <div className="doctor-patient-count">
                                    <Users size={10} /> {assignedPatients.length} patients
                                  </div>
                                 </td>
                                 <td>
                                  <div className={`status-badge ${doc.isActive ? 'active' : 'inactive'}`}>
                                    <span className="status-dot"></span>
                                    {doc.isActive ? 'Active' : 'Inactive'}
                                  </div>
                                 </td>
                                 <td>
                                  <div className="action-buttons">
                                    <button className="action-icon view" onClick={() => handleViewDetails(doc)} title="View Full Details">
                                      <Eye size={14} />
                                    </button>
                                    <button 
                                      className={`action-icon status ${doc.isActive ? 'deactivate' : 'activate'}`} 
                                      onClick={() => handleToggleStatusWithConfirm(doc._id, doc.isActive, `Dr. ${doc.profile?.firstName} ${doc.profile?.lastName}`)} 
                                      title={doc.isActive ? 'Deactivate' : 'Activate'}
                                    >
                                      {doc.isActive ? '🔴' : '🟢'}
                                    </button>
                                    <button className="action-icon edit" onClick={() => onEdit(doc)} title="Edit Doctor">
                                      <Edit size={14} />
                                    </button>
                                    <button className="action-icon delete" onClick={() => handleDeleteWithConfirm(doc._id, `${doc.profile?.firstName} ${doc.profile?.lastName}`)} title="Delete Doctor">
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                 </td>
                               </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Doctor Details Modal */}
      {showDetailsModal && selectedDoctor && (
        <DoctorDetailsModal
          doctor={selectedDoctor}
          patients={patients?.filter(p => p.assignedDoctor?._id === selectedDoctor._id) || []}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedDoctor(null);
          }}
        />
      )}

      {/* Confirm Modal */}
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
    </>
  );
};

export default DoctorsTab;