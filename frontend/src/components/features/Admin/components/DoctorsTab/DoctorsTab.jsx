import React, { useState } from 'react';
import { Plus, Edit, Trash2, Stethoscope, UserPlus, ChevronDown, ChevronRight, Search, Filter, X } from 'lucide-react';
import Button from '../../../../common/Button/Button';
import './DoctorsTab.css';

const DoctorsTab = ({ doctors, onAdd, onEdit, onDelete, onToggleStatus }) => {
  const [expandedSpecs, setExpandedSpecs] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, inactive

  // Group doctors by specialization
  const doctorsBySpecialization = doctors.reduce((acc, doctor) => {
    const spec = doctor.specialization || 'Unassigned';
    if (!acc[spec]) {
      acc[spec] = [];
    }
    acc[spec].push(doctor);
    return acc;
  }, {});

  // Filter doctors within each specialization
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

  // Sort specializations alphabetically
  const sortedSpecs = Object.keys(doctorsBySpecialization).sort();

  const toggleSpec = (spec) => {
    setExpandedSpecs(prev => ({ ...prev, [spec]: !prev[spec] }));
  };

  const expandAll = () => {
    const allExpanded = {};
    sortedSpecs.forEach(spec => { allExpanded[spec] = true; });
    setExpandedSpecs(allExpanded);
  };

  const collapseAll = () => {
    setExpandedSpecs({});
  };

  const getTotalDoctors = () => {
    return doctors.length;
  };

  const getActiveDoctors = () => {
    return doctors.filter(d => d.isActive === true).length;
  };

  const getInactiveDoctors = () => {
    return doctors.filter(d => d.isActive === false).length;
  };

  return (
    <div className="doctors-tab">
      {/* Header with Stats */}
      <div className="doctors-stats-bar">
        <div className="stats-container">
          <div className="stat-card-mini">
            <div className="stat-value">{getTotalDoctors()}</div>
            <div className="stat-label">Total Doctors</div>
          </div>
          <div className="stat-card-mini success">
            <div className="stat-value">{getActiveDoctors()}</div>
            <div className="stat-label">Active</div>
          </div>
          <div className="stat-card-mini warning">
            <div className="stat-value">{getInactiveDoctors()}</div>
            <div className="stat-label">Inactive</div>
          </div>
        </div>
        <Button variant="primary" size="sm" onClick={onAdd}>
          <UserPlus size={16} /> Create Doctor
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <div className="doctors-search-bar">
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
        <div className="expand-actions">
          <button className="expand-btn" onClick={expandAll}>
            Expand All
          </button>
          <button className="expand-btn" onClick={collapseAll}>
            Collapse All
          </button>
        </div>
      </div>
      
      <div className="doctors-by-specialization">
        {sortedSpecs.length === 0 ? (
          <div className="empty-state">
            <Stethoscope size={48} />
            <p>No doctors created yet.</p>
            <p className="hint">Click "Create Doctor" to add your first doctor.</p>
          </div>
        ) : (
          sortedSpecs.map(spec => {
            const filteredDoctors = filterDoctors(doctorsBySpecialization[spec]);
            if (filteredDoctors.length === 0) return null;
            
            return (
              <div key={spec} className="specialization-group">
                <div className="specialization-header" onClick={() => toggleSpec(spec)}>
                  <div className="spec-title">
                    {expandedSpecs[spec] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    <div className="spec-icon">
                      <Stethoscope size={16} />
                    </div>
                    <span className="spec-name">{spec}</span>
                    <span className="spec-count">{filteredDoctors.length}</span>
                    <div className="spec-stats">
                      <span className="spec-active">{filteredDoctors.filter(d => d.isActive).length} active</span>
                    </div>
                  </div>
                </div>
                
                {expandedSpecs[spec] && (
                  <div className="doctors-list">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Doctor</th>
                          <th>Contact</th>
                          <th>License</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredDoctors.map(doc => (
                          <tr key={doc._id} className={!doc.isActive ? 'inactive-row' : ''}>
                            <td className="doctor-info-cell">
                              <div className="doctor-avatar">
                                {doc.profile?.firstName?.[0]}{doc.profile?.lastName?.[0]}
                              </div>
                              <div className="doctor-name-details">
                                <div className="doctor-full-name">
                                  Dr. {doc.profile?.firstName} {doc.profile?.lastName}
                                </div>
                                <div className="doctor-specialty-badge">{doc.specialization || 'General'}</div>
                              </div>
                            </td>
                            <td className="contact-cell">
                              <div className="contact-email">{doc.email}</div>
                              <div className="contact-phone">{doc.profile?.phone || 'No phone'}</div>
                            </td>
                            <td>{doc.licenseNumber || 'N/A'}</td>
                            <td>
                              <div className={`status-badge ${doc.isActive ? 'active' : 'inactive'}`}>
                                <span className="status-dot"></span>
                                {doc.isActive ? 'Active' : 'Inactive'}
                              </div>
                            </td>
                            <td className="action-buttons-cell">
                              <button className="action-icon edit" onClick={() => onEdit(doc)} title="Edit Doctor">
                                <Edit size={14} />
                              </button>
                              <button 
                                className={`action-icon status ${doc.isActive ? 'deactivate' : 'activate'}`} 
                                onClick={() => onToggleStatus(doc._id, doc.isActive, `${doc.profile?.firstName} ${doc.profile?.lastName}`)}
                                title={doc.isActive ? 'Deactivate' : 'Activate'}
                              >
                                {doc.isActive ? '🔴' : '🟢'}
                              </button>
                              <button className="action-icon delete" onClick={() => onDelete(doc._id, `${doc.profile?.firstName} ${doc.profile?.lastName}`)} title="Delete Doctor">
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
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
  );
};

export default DoctorsTab;