import React, { useState } from 'react';
import { Plus, Edit, Award, Search, X, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '../../../../common/Button/Button';
import './SpecializationsTab.css';

const SpecializationsTab = ({ specializations, onAdd, onEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, inactive

  // Filter specializations
  const filteredSpecs = specializations.filter(spec => {
    const matchesSearch = spec.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (spec.description && spec.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' ? true :
                          filterStatus === 'active' ? spec.isActive === true :
                          spec.isActive === false;
    return matchesSearch && matchesStatus;
  });

  const getActiveCount = () => specializations.filter(s => s.isActive).length;
  const getInactiveCount = () => specializations.filter(s => !s.isActive).length;

  return (
    <div className="specializations-tab">
      {/* Stats Bar */}
      <div className="specializations-stats-bar">
        <div className="stats-container">
          <div className="stat-card-mini">
            <div className="stat-value">{specializations.length}</div>
            <div className="stat-label">Total Specializations</div>
          </div>
          <div className="stat-card-mini success">
            <div className="stat-value">{getActiveCount()}</div>
            <div className="stat-label">Active</div>
          </div>
          <div className="stat-card-mini warning">
            <div className="stat-value">{getInactiveCount()}</div>
            <div className="stat-label">Inactive</div>
          </div>
        </div>
        <Button variant="primary" size="sm" onClick={onAdd}>
          <Plus size={16} /> Add Specialization
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <div className="specializations-search-bar">
        <div className="search-input-wrapper">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search by name or description..." 
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

      {/* Specializations Grid */}
      <div className="specializations-grid">
        {filteredSpecs.length === 0 ? (
          <div className="empty-state">
            <Award size={48} />
            <p>No specializations found.</p>
            {searchTerm && <p className="hint">Try a different search term or clear the filter.</p>}
            {!searchTerm && filterStatus === 'all' && <p className="hint">Click "Add Specialization" to create one.</p>}
          </div>
        ) : (
          filteredSpecs.map(spec => (
            <div key={spec._id} className={`specialization-card ${!spec.isActive ? 'inactive' : ''}`}>
              <div className="specialization-content">
                <div className="specialization-header">
                  <div className="spec-icon">
                    <Award size={20} />
                  </div>
                  <div className="spec-info">
                    <h4>{spec.name}</h4>
                    {spec.description && <p className="spec-description">{spec.description}</p>}
                  </div>
                </div>
                <div className="specialization-meta">
                  <div className={`spec-status-badge ${spec.isActive ? 'active' : 'inactive'}`}>
                    <span className="status-dot"></span>
                    {spec.isActive ? 'Active' : 'Inactive'}
                  </div>
                  <button className="edit-spec-btn" onClick={() => onEdit(spec)}>
                    <Edit size={14} />
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SpecializationsTab;