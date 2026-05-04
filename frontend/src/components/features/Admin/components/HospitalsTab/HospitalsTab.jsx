// frontend/src/components/features/Admin/components/HospitalsTab/HospitalsTab.jsx
import React, { useState } from 'react';
import { Plus, Edit, Trash2, Building, Phone, Mail, MapPin } from 'lucide-react';
import Button from '../../../../common/Button/Button';
import { SearchInput } from '../../../../common/SearchInput/SearchInput';
import './HospitalsTab.css';

const HospitalsTab = ({ hospitals, onAdd, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHospitals = hospitals.filter(hospital =>
    hospital.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hospital.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hospital.address?.street?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hospital.address?.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper function to format address display
  const formatAddress = (hospital) => {
    if (typeof hospital.address === 'string') {
      return `${hospital.address}, ${hospital.city || ''}`;
    }
    const street = hospital.address?.street || '';
    const city = hospital.address?.city || hospital.city || '';
    const state = hospital.address?.state || '';
    const parts = [street, city, state].filter(p => p);
    return parts.join(', ') || 'Address not specified';
  };

  return (
    <div className="hospitals-tab">
      <div className="tab-header">
        <div className="header-title">
          <Building size={18} />
          <h3>Hospitals</h3>
          <span className="item-count">{hospitals.length}</span>
        </div>
        <Button variant="primary" size="sm" onClick={onAdd}>
          <Plus size={16} /> Add Hospital
        </Button>
      </div>

      <div className="search-bar">
        <SearchInput 
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by name, city or address..."
        />
      </div>

      <div className="items-grid">
        {filteredHospitals.length === 0 ? (
          <div className="empty-state">
            <Building size={48} />
            <p>No hospitals found</p>
            {searchTerm && <span>Try a different search term</span>}
            {!searchTerm && <span>Click "Add Hospital" to create one</span>}
          </div>
        ) : (
          filteredHospitals.map(hospital => (
            <div key={hospital._id} className="item-card">
              <div className="card-header">
                <div className="item-icon">
                  <Building size={20} />
                </div>
                <div className="item-name">{hospital.name}</div>
                <div className="card-actions">
                  <button className="action-icon edit" onClick={() => onEdit(hospital)} title="Edit">
                    <Edit size={16} />
                  </button>
                  <button className="action-icon delete" onClick={() => onDelete(hospital._id)} title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="card-body">
                <div className="detail-row">
                  <MapPin size={14} />
                  <span>{formatAddress(hospital)}</span>
                </div>
                {hospital.phone && (
                  <div className="detail-row">
                    <Phone size={14} />
                    <span>{hospital.phone}</span>
                  </div>
                )}
                {hospital.email && (
                  <div className="detail-row">
                    <Mail size={14} />
                    <span>{hospital.email}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HospitalsTab;