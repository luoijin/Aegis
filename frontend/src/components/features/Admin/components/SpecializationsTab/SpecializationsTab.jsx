// frontend/src/components/features/Admin/components/SpecializationsTab/SpecializationsTab.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Award, CheckCircle, AlertCircle, Users, Trash2, Eye } from 'lucide-react';
import Button from '../../../../common/Button/Button';
import { SearchInput } from '../../../../common/SearchInput/SearchInput';
import SpecializationDetailsModal from './SpecializationDetailsModal';
import './SpecializationsTab.css';

const SpecializationsTab = ({ specializations, doctors, onAdd, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [specializationStats, setSpecializationStats] = useState({});
  const [selectedSpecialization, setSelectedSpecialization] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Calculate doctor count for each specialization
  useEffect(() => {
    const stats = {};
    specializations.forEach(spec => {
      const doctorCount = doctors.filter(doc => doc.specialization === spec.name && doc.isActive === true).length;
      stats[spec._id] = {
        count: doctorCount,
        isActive: doctorCount > 0
      };
    });
    setSpecializationStats(stats);
  }, [specializations, doctors]);

  const handleViewDetails = (spec) => {
    setSelectedSpecialization(spec);
    setShowDetailsModal(true);
  };

  const handleDeleteClick = (specId, specName) => {
    const stats = specializationStats[specId];
    if (stats && stats.count > 0) {
      alert(`Cannot delete "${specName}" because it has ${stats.count} doctor(s) assigned.`);
      return;
    }
    onDelete(specId, specName);
  };

  const filteredSpecs = specializations.filter(spec => {
    const matchesSearch = spec.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (spec.description && spec.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const doctorCount = specializationStats[spec._id]?.count || 0;
    const effectiveStatus = doctorCount > 0 ? 'active' : 'inactive';
    const matchesStatus = filterStatus === 'all' ? true :
                          filterStatus === 'active' ? effectiveStatus === 'active' :
                          effectiveStatus === 'inactive';
    return matchesSearch && matchesStatus;
  });

  const totalSpecializations = specializations.length;
  const activeSpecializations = specializations.filter(spec => (specializationStats[spec._id]?.count || 0) > 0).length;
  const inactiveSpecializations = specializations.filter(spec => (specializationStats[spec._id]?.count || 0) === 0).length;

  return (
    <>
      <div className="specializations-tab">
        <div className="tab-header">
          <div className="header-title">
            <Award size={18} />
            <h3>Specializations</h3>
            <span className="item-count">{totalSpecializations}</span>
          </div>
          <Button variant="primary" size="sm" onClick={onAdd}>
            <Plus size={16} /> Add Specialization
          </Button>
        </div>

        <div className="stats-row">
          <div className="stat-mini">
            <div className="stat-value">{totalSpecializations}</div>
            <div className="stat-label">Total</div>
          </div>
          <div className="stat-mini success">
            <div className="stat-value">{activeSpecializations}</div>
            <div className="stat-label">Active</div>
            <div className="stat-sub">Has Doctors</div>
          </div>
          <div className="stat-mini warning">
            <div className="stat-value">{inactiveSpecializations}</div>
            <div className="stat-label">Inactive</div>
            <div className="stat-sub">No Doctors</div>
          </div>
        </div>

        <div className="search-filter-row">
          <SearchInput 
            value={searchTerm} 
            onChange={setSearchTerm} 
            placeholder="Search by name or description..." 
          />
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
              <CheckCircle size={12} /> Active (Has Doctors)
            </button>
            <button 
              className={`filter-chip ${filterStatus === 'inactive' ? 'active' : ''}`} 
              onClick={() => setFilterStatus('inactive')}
            >
              <AlertCircle size={12} /> Inactive (No Doctors)
            </button>
          </div>
        </div>

        <div className="items-grid">
          {filteredSpecs.length === 0 ? (
            <div className="empty-state">
              <Award size={48} />
              <p>No specializations found</p>
            </div>
          ) : (
            filteredSpecs.map(spec => {
              const doctorCount = specializationStats[spec._id]?.count || 0;
              const isActive = doctorCount > 0;
              
              return (
                <div key={spec._id} className={`spec-card ${!isActive ? 'inactive' : 'active'}`}>
                  <div className="spec-card-content">
                    <div className="spec-card-header">
                      <div className="spec-icon">
                        <Award size={20} />
                      </div>
                      <div className="spec-info">
                        <div className="spec-title-row">
                          <h4>{spec.name}</h4>
                          <div className={`status-badge ${isActive ? 'active' : 'inactive'}`}>
                            <span className="status-dot"></span>
                            {isActive ? 'Active' : 'Inactive'}
                          </div>
                        </div>
                        {spec.description && (
                          <p className="spec-description">{spec.description}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="spec-card-stats">
                      <div className="doctor-count">
                        <Users size={14} />
                        <span>
                          <strong>{doctorCount}</strong> {doctorCount === 1 ? 'Doctor' : 'Doctors'}
                        </span>
                        {doctorCount > 0 && (
                          <span className="doctor-list-hint">assigned to this specialization</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="spec-card-footer">
                      <button 
                        className="view-btn" 
                        onClick={() => handleViewDetails(spec)}
                        title="View Details"
                      >
                        <Eye size={14} /> View
                      </button>
                      <button 
                        className="edit-btn" 
                        onClick={() => onEdit(spec)}
                        title="Edit Specialization"
                      >
                        <Edit size={14} /> Edit
                      </button>
                      <button 
                        className={`delete-btn ${doctorCount > 0 ? 'disabled' : ''}`} 
                        onClick={() => handleDeleteClick(spec._id, spec.name)}
                        disabled={doctorCount > 0}
                        title={doctorCount > 0 ? `Cannot delete - has ${doctorCount} doctor${doctorCount !== 1 ? 's' : ''} assigned` : 'Delete Specialization'}
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Specialization Details Modal */}
      {showDetailsModal && selectedSpecialization && (
        <SpecializationDetailsModal
          specialization={selectedSpecialization}
          doctors={doctors.filter(d => d.specialization === selectedSpecialization.name)}
          doctorCount={specializationStats[selectedSpecialization._id]?.count || 0}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedSpecialization(null);
          }}
        />
      )}
    </>
  );
};

export default SpecializationsTab;