// frontend/src/components/features/Admin/components/SpecializationsTab/SpecializationsTab.jsx
import React, { useState } from 'react';
import { Plus, Edit, Award, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '../../../../common/Button/Button';
import { SearchInput } from '../../../../common/SearchInput/SearchInput';
import './SpecializationsTab.css';

const SpecializationsTab = ({ specializations, onAdd, onEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredSpecs = specializations.filter(spec => {
    const matchesSearch = spec.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (spec.description && spec.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' ? true :
                          filterStatus === 'active' ? spec.isActive === true :
                          spec.isActive === false;
    return matchesSearch && matchesStatus;
  });

  const activeCount = specializations.filter(s => s.isActive).length;
  const inactiveCount = specializations.filter(s => !s.isActive).length;

  return (
    <div className="specializations-tab">
      <div className="tab-header">
        <div className="header-title">
          <Award size={18} />
          <h3>Specializations</h3>
          <span className="item-count">{specializations.length}</span>
        </div>
        <Button variant="primary" size="sm" onClick={onAdd}>
          <Plus size={16} /> Add Specialization
        </Button>
      </div>

      <div className="stats-row">
        <div className="stat-mini"><div className="stat-value">{specializations.length}</div><div className="stat-label">Total</div></div>
        <div className="stat-mini success"><div className="stat-value">{activeCount}</div><div className="stat-label">Active</div></div>
        <div className="stat-mini warning"><div className="stat-value">{inactiveCount}</div><div className="stat-label">Inactive</div></div>
      </div>

      <div className="search-filter-row">
        <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Search by name or description..." />
        <div className="filter-buttons">
          <button className={`filter-chip ${filterStatus === 'all' ? 'active' : ''}`} onClick={() => setFilterStatus('all')}>All</button>
          <button className={`filter-chip ${filterStatus === 'active' ? 'active' : ''}`} onClick={() => setFilterStatus('active')}><CheckCircle size={12} /> Active</button>
          <button className={`filter-chip ${filterStatus === 'inactive' ? 'active' : ''}`} onClick={() => setFilterStatus('inactive')}><AlertCircle size={12} /> Inactive</button>
        </div>
      </div>

      <div className="items-grid">
        {filteredSpecs.length === 0 ? (
          <div className="empty-state"><Award size={48} /><p>No specializations found</p></div>
        ) : (
          filteredSpecs.map(spec => (
            <div key={spec._id} className={`spec-card ${!spec.isActive ? 'inactive' : ''}`}>
              <div className="spec-card-content">
                <div className="spec-card-header">
                  <div className="spec-icon"><Award size={20} /></div>
                  <div className="spec-info"><h4>{spec.name}</h4>{spec.description && <p className="spec-description">{spec.description}</p>}</div>
                </div>
                <div className="spec-card-footer">
                  <div className={`status-badge ${spec.isActive ? 'active' : 'inactive'}`}><span className="status-dot"></span>{spec.isActive ? 'Active' : 'Inactive'}</div>
                  <button className="edit-btn" onClick={() => onEdit(spec)}><Edit size={14} /> Edit</button>
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