import React, { useState } from 'react';
import { Plus, Edit, Trash2, Users, Mail, Phone, Stethoscope, CheckCircle, AlertCircle, Eye } from 'lucide-react';
import Button from '../../../../common/Button/Button';
import { SearchInput } from '../../../../common/SearchInput/SearchInput';
import PatientEHRModal from '../../../Doctor/PatientChart/PatientChartModal';
import './PatientsTab.css';

const PatientsTab = ({ patients, doctors, onAdd, onEdit, onDelete, onToggleStatus }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showEHRModal, setShowEHRModal] = useState(false);

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = 
      patient.user?.profile?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.user?.profile?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' ? true :
                          filterStatus === 'active' ? patient.user?.isActive === true :
                          patient.user?.isActive === false;
    return matchesSearch && matchesStatus;
  });

  const handleViewEHR = (patient) => {
    setSelectedPatient(patient);
    setShowEHRModal(true);
  };

  const totalPatients = patients.length;
  const activePatients = patients.filter(p => p.user?.isActive === true).length;
  const inactivePatients = patients.filter(p => p.user?.isActive === false).length;
  const assignedCount = patients.filter(p => p.assignedDoctor).length;
  const unassignedCount = patients.filter(p => !p.assignedDoctor).length;

  return (
    <>
      <div className="patients-tab">
        {/* Header */}
        <div className="tab-header">
          <div className="header-title">
            <Users size={18} />
            <h3>Patients</h3>
            <span className="item-count">{totalPatients}</span>
          </div>
          <Button variant="primary" size="sm" onClick={onAdd}>
            <Plus size={16} /> Add Patient
          </Button>
        </div>

        {/* Stats */}
        <div className="stats-row">
          <div className="stat-mini"><div className="stat-value">{totalPatients}</div><div className="stat-label">Total</div></div>
          <div className="stat-mini success"><div className="stat-value">{activePatients}</div><div className="stat-label">Active</div></div>
          <div className="stat-mini warning"><div className="stat-value">{inactivePatients}</div><div className="stat-label">Inactive</div></div>
          <div className="stat-mini info"><div className="stat-value">{assignedCount}</div><div className="stat-label">Has Doctor</div></div>
          <div className="stat-mini secondary"><div className="stat-value">{unassignedCount}</div><div className="stat-label">No Doctor</div></div>
        </div>

        {/* Search & Filter */}
        <div className="search-filter-row">
          <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Search by name or email..." />
          <div className="filter-buttons">
            <button className={`filter-chip ${filterStatus === 'all' ? 'active' : ''}`} onClick={() => setFilterStatus('all')}>All</button>
            <button className={`filter-chip ${filterStatus === 'active' ? 'active' : ''}`} onClick={() => setFilterStatus('active')}><CheckCircle size={12} /> Active</button>
            <button className={`filter-chip ${filterStatus === 'inactive' ? 'active' : ''}`} onClick={() => setFilterStatus('inactive')}><AlertCircle size={12} /> Inactive</button>
          </div>
        </div>

        {/* Table Wrapper */}
        <div className="table-wrapper">
          {filteredPatients.length === 0 ? (
            <div className="empty-state"><Users size={48} /><p>No patients found</p></div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Contact</th>
                  <th>Assigned Doctor</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map(patient => (
                  <tr key={patient._id} className={!patient.user?.isActive ? 'inactive-row' : ''}>
                    <td className="patient-cell" data-label="Patient">
                      <div>
                        <div className="patient-name">{patient.user?.profile?.firstName} {patient.user?.profile?.lastName}</div>
                        <div className="patient-email"><Mail size={12} /> {patient.user?.email}</div>
                      </div>
                    </td>
                    <td className="contact-cell" data-label="Contact">
                      <div className="contact-phone"><Phone size={12} /> {patient.user?.profile?.phone || 'No phone'}</div>
                    </td>
                    <td className="doctor-cell" data-label="Assigned Doctor">
                      {patient.assignedDoctor?.profile?.firstName ? 
                        <div className="assigned-doctor"><Stethoscope size={12} /> Dr. {patient.assignedDoctor.profile.firstName} {patient.assignedDoctor.profile.lastName}</div> : 
                        <span className="unassigned-badge">Not assigned</span>
                      }
                    </td>
                    <td className="status-cell" data-label="Status">
                      <div className={`status-badge ${patient.user?.isActive === true ? 'active' : 'inactive'}`}>
                        <span className="status-dot"></span>
                        {patient.user?.isActive === true ? 'Active' : 'Inactive'}
                      </div>
                    </td>
                    <td className="actions-cell" data-label="Actions">
                      <div className="action-buttons">
                        <button className="action-icon view" onClick={() => handleViewEHR(patient)} title="View Electronic Health Record">
                          <Eye size={14} />
                        </button>
                        <button 
                          className={`action-icon status ${patient.user?.isActive === true ? 'deactivate' : 'activate'}`} 
                          onClick={() => onToggleStatus(patient._id, patient.user?.isActive === true, `${patient.user?.profile?.firstName} ${patient.user?.profile?.lastName}`)} 
                          title={patient.user?.isActive === true ? 'Deactivate' : 'Activate'}
                        >
                          {patient.user?.isActive === true ? '🔴' : '🟢'}
                        </button>
                        <button className="action-icon edit" onClick={() => onEdit(patient)} title="Edit Patient">
                          <Edit size={14} />
                        </button>
                        <button className="action-icon delete" onClick={() => onDelete(patient._id, `${patient.user?.profile?.firstName} ${patient.user?.profile?.lastName}`)} title="Delete Patient">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* EHR Modal */}
      {showEHRModal && selectedPatient && (
        <PatientEHRModal
          patient={selectedPatient}
          onClose={() => {
            setShowEHRModal(false);
            setSelectedPatient(null);
          }}
        />
      )}
    </>
  );
};

export default PatientsTab;