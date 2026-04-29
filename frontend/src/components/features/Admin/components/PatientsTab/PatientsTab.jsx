import React, { useState } from 'react';
import { Plus, Edit, Trash2, Users, Search, X, User, Mail, Phone, Stethoscope } from 'lucide-react';
import Button from '../../../../common/Button/Button';
import './PatientsTab.css';

const PatientsTab = ({ patients, doctors, onAdd, onEdit, onDelete, onToggleStatus }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, inactive

  // Filter patients
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

  const getActiveCount = () => patients.filter(p => p.user?.isActive === true).length;
  const getInactiveCount = () => patients.filter(p => p.user?.isActive === false).length;
  const getAssignedCount = () => patients.filter(p => p.assignedDoctor).length;
  const getUnassignedCount = () => patients.filter(p => !p.assignedDoctor).length;

  return (
    <div className="patients-tab">
      {/* Stats Bar */}
      <div className="patients-stats-bar">
        <div className="stats-container">
          <div className="stat-card-mini">
            <div className="stat-value">{patients.length}</div>
            <div className="stat-label">Total Patients</div>
          </div>
          <div className="stat-card-mini success">
            <div className="stat-value">{getActiveCount()}</div>
            <div className="stat-label">Active</div>
          </div>
          <div className="stat-card-mini warning">
            <div className="stat-value">{getInactiveCount()}</div>
            <div className="stat-label">Inactive</div>
          </div>
          <div className="stat-card-mini info">
            <div className="stat-value">{getAssignedCount()}</div>
            <div className="stat-label">Has Doctor</div>
          </div>
          <div className="stat-card-mini secondary">
            <div className="stat-value">{getUnassignedCount()}</div>
            <div className="stat-label">No Doctor</div>
          </div>
        </div>
        <Button variant="primary" size="sm" onClick={onAdd}>
          <Plus size={16} /> Add Patient
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <div className="patients-search-bar">
        <div className="search-input-wrapper">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm('')}>
              <X size={14} />
            </button>
          )}
        </div>
        <div className="filter-buttons">
          <button 
            className={`filter-chip ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            All
          </button>
          <button 
            className={`filter-chip ${filterStatus === 'active' ? 'active' : ''}`}
            onClick={() => setFilterStatus('active')}
          >
            Active Only
          </button>
          <button 
            className={`filter-chip ${filterStatus === 'inactive' ? 'active' : ''}`}
            onClick={() => setFilterStatus('inactive')}
          >
            Inactive Only
          </button>
        </div>
      </div>

      {/* Patients Table */}
      <div className="patients-table-container">
        {filteredPatients.length === 0 ? (
          <div className="empty-state">
            <Users size={48} />
            <p>No patients found.</p>
            {searchTerm && <p className="hint">Try a different search term or clear the filter.</p>}
            {!searchTerm && filterStatus === 'all' && <p className="hint">Click "Add Patient" to create one.</p>}
          </div>
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
                  <td className="patient-info-cell">
                    <div className="patient-avatar">
                      {patient.user?.profile?.firstName?.[0]}{patient.user?.profile?.lastName?.[0]}
                    </div>
                    <div className="patient-details">
                      <div className="patient-name">
                        {patient.user?.profile?.firstName} {patient.user?.profile?.lastName}
                      </div>
                      <div className="patient-email">
                        <Mail size={12} /> {patient.user?.email}
                      </div>
                    </div>
                  </td>
                  <td className="contact-cell">
                    <div className="contact-phone">
                      <Phone size={12} /> {patient.user?.profile?.phone || 'No phone'}
                    </div>
                  </td>
                  <td className="doctor-cell">
                    {patient.assignedDoctor?.profile?.firstName ? (
                      <div className="assigned-doctor">
                        <Stethoscope size={12} />
                        <span>Dr. {patient.assignedDoctor.profile.firstName} {patient.assignedDoctor.profile.lastName}</span>
                      </div>
                    ) : (
                      <span className="unassigned-badge">Not assigned</span>
                    )}
                  </td>
                  <td className="status-cell">
                    <div className={`status-badge ${patient.user?.isActive === true ? 'active' : 'inactive'}`}>
                      <span className="status-dot"></span>
                      {patient.user?.isActive === true ? 'Active' : 'Inactive'}
                    </div>
                  </td>
                  <td className="action-buttons-cell">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PatientsTab;