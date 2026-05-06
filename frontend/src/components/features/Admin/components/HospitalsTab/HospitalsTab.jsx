// frontend/src/components/features/Admin/components/HospitalsTab/HospitalsTab.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Building, Phone, Mail, MapPin, Users, Stethoscope, Eye, Hospital, Activity } from 'lucide-react';
import Button from '../../../../common/Button/Button';
import { SearchInput } from '../../../../common/SearchInput/SearchInput';
import HospitalDetailsModal from './HospitalDetailsModal';
import api from '../../../../../services/api';
import './HospitalsTab.css';

const HospitalsTab = ({ hospitals, onAdd, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [hospitalsWithStats, setHospitalsWithStats] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchHospitalsWithStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/hospitals/stats');
      setHospitalsWithStats(response.data);
    } catch (error) {
      console.error('Error fetching hospital stats:', error);
      setHospitalsWithStats(hospitals.map(h => ({ ...h, doctorCount: 0 })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitalsWithStats();
  }, [hospitals]);

  const filteredHospitals = (hospitalsWithStats || []).filter(hospital =>
    hospital.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hospital.address?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hospital.address?.street?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = async (hospital) => {
    try {
      const response = await api.get(`/admin/hospitals/${hospital._id}/doctors`);
      setSelectedHospital(response.data);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error fetching hospital details:', error);
      setSelectedHospital({ ...hospital, doctors: [], doctorCount: 0 });
      setShowDetailsModal(true);
    }
  };

  const formatAddress = (hospital) => {
    if (typeof hospital.address === 'string') {
      return hospital.address;
    }
    const street = hospital.address?.street || '';
    const city = hospital.address?.city || '';
    const province = hospital.address?.province || '';
    const parts = [street, city, province].filter(p => p);
    return parts.join(', ') || 'Address not specified';
  };

  const totalHospitals = hospitalsWithStats.length;
  const totalDoctorsAcrossHospitals = hospitalsWithStats.reduce((sum, h) => sum + (h.doctorCount || 0), 0);

  const statsCards = [
    {
      label: 'Total Hospitals',
      value: totalHospitals,
      icon: <Building size={20} />,
      color: '#3B82F6',
      bgColor: 'white'
    },
    {
      label: 'Total Doctors',
      value: totalDoctorsAcrossHospitals,
      icon: <Stethoscope size={20} />,
      color: '#3B82F6',
      bgColor: 'white'
    }
  ];

  return (
    <>
      <div className="hospitals-tab">
        <div className="tab-header">
          <div className="header-title">
            <Building size={18} />
            <h3>Hospitals</h3>
            <span className="item-count">{totalHospitals}</span>
          </div>
          <Button variant="primary" size="sm" onClick={onAdd}>
            <Plus size={16} /> Add Hospital
          </Button>
        </div>

        {/* Stats Row with Icons */}
        <div className="stats-row">
          {statsCards.map((card, index) => (
            <div key={index} className="stat-mini">
              <div className="stat-icon" style={{ background: card.bgColor, color: card.color }}>
                {card.icon}
              </div>
              <div className="stat-info">
                <div className="stat-value">{card.value}</div>
                <div className="stat-label">{card.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="search-bar">
          <SearchInput 
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by name, city or address..."
          />
        </div>

        {loading ? (
          <div className="loading-state">Loading hospital data...</div>
        ) : (
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
                      <button 
                        className="action-icon view" 
                        onClick={() => handleViewDetails(hospital)}
                        title="View Hospital Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button className="action-icon edit" onClick={() => onEdit(hospital)} title="Edit">
                        <Edit size={16} />
                      </button>
                      <button className="action-icon delete" onClick={() => onDelete(hospital._id, hospital.name)} title="Delete">
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
                    <div className="detail-row doctors-info">
                      <Users size={14} />
                      <span>
                        <strong>{hospital.doctorCount || 0}</strong> {hospital.doctorCount === 1 ? 'Doctor' : 'Doctors'} assigned
                      </span>
                      {hospital.doctorCount > 0 && (
                        <button 
                          className="view-doctors-btn"
                          onClick={() => handleViewDetails(hospital)}
                        >
                          View Doctors
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Hospital Details Modal */}
      {showDetailsModal && selectedHospital && (
        <HospitalDetailsModal
          hospital={selectedHospital}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedHospital(null);
          }}
          onRefresh={fetchHospitalsWithStats}
        />
      )}
    </>
  );
};

export default HospitalsTab;