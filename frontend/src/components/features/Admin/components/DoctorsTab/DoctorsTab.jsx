// frontend/src/components/features/Admin/components/DoctorsTab/DoctorsTab.jsx
import React, { useState } from 'react';
import { Plus, Edit, Trash2, Stethoscope, UserPlus, CheckCircle, AlertCircle, Eye, Users, Building, Mail, Phone, Award, Activity } from 'lucide-react';
import Button from '../../../../common/Button/Button';
import { SearchInput } from '../../../../common/SearchInput/SearchInput';
import DoctorDetailsModal from './DoctorDetailsModal';
import './DoctorsTab.css';

const DoctorsTab = ({ doctors, patients, onAdd, onEdit, onDelete, onToggleStatus }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = 
      doctor.profile?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.profile?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = 
      filterStatus === 'all' ? true :
      filterStatus === 'active' ? doctor.isActive === true :
      doctor.isActive === false;
    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = (doctor) => {
    setSelectedDoctor(doctor);
    setShowDetailsModal(true);
  };

  const getHospitalName = (doctor) => {
    if (!doctor.hospital) return null;
    if (typeof doctor.hospital === 'object' && doctor.hospital !== null) {
      return doctor.hospital.name;
    }
    return null;
  };

  const totalDoctors = doctors.length;
  const activeDoctors = doctors.filter(d => d.isActive === true).length;
  const inactiveDoctors = doctors.filter(d => d.isActive === false).length;

  const statsCards = [
    {
      label: 'Total Doctors',
      value: totalDoctors,
      icon: <Stethoscope size={20} />,
      color: '#3B82F6',
      bgColor: 'white'
    },
    {
      label: 'Active',
      value: activeDoctors,
      icon: <CheckCircle size={20} />,
      color: '#3B82F6',
      bgColor: 'white'
    },
    {
      label: 'Inactive',
      value: inactiveDoctors,
      icon: <AlertCircle size={20} />,
      color: '#3B82F6',
      bgColor: 'white'
    }
  ];

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

        <div className="search-filter-row">
          <SearchInput 
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by name, email, or specialization..."
          />
          <div className="filter-buttons">
            <button className={`filter-chip ${filterStatus === 'all' ? 'active' : ''}`} onClick={() => setFilterStatus('all')}>All</button>
            <button className={`filter-chip ${filterStatus === 'active' ? 'active' : ''}`} onClick={() => setFilterStatus('active')}><CheckCircle size={12} /> Active</button>
            <button className={`filter-chip ${filterStatus === 'inactive' ? 'active' : ''}`} onClick={() => setFilterStatus('inactive')}><AlertCircle size={12} /> Inactive</button>
          </div>
        </div>

        <div className="doctors-table-wrapper">
          {filteredDoctors.length === 0 ? (
            <div className="empty-state">
              <Stethoscope size={48} />
              <p>No doctors found</p>
              {searchTerm && <span>Try a different search term</span>}
              {!searchTerm && <span>Click "Create Doctor" to add your first doctor</span>}
            </div>
          ) : (
            <table className="doctors-table">
              <thead>
                <tr>
                  <th>Doctor Name</th>
                  <th>Contact</th>
                  <th>Specialization</th>
                  <th>License</th>
                  <th>Hospital</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDoctors.map(doc => {
                  const assignedPatients = patients?.filter(p => p.assignedDoctor?._id === doc._id) || [];
                  const hospitalName = getHospitalName(doc);
                  const fullName = `Dr. ${doc.profile?.firstName || ''} ${doc.profile?.lastName || ''}`.trim();
                  
                  return (
                    <tr key={doc._id} className={!doc.isActive ? 'inactive-row' : ''}>
                      <td className="doctor-name-cell" data-label="Doctor Name">
                        <div className="doctor-name">{fullName || 'Unknown Doctor'}</div>
                      </td>
                      <td className="doctor-contact-cell" data-label="Contact">
                        <div className="doctor-email"><Mail size={12} /> {doc.email}</div>
                        <div className="doctor-phone"><Phone size={12} /> {doc.profile?.phone || 'No phone'}</div>
                      </td>
                      <td className="specialty-cell" data-label="Specialization">
                        <span className="specialty-badge">{doc.specialization || 'General'}</span>
                      </td>
                      <td className="license-cell" data-label="License">
                        {doc.licenseNumber || 'N/A'}
                      </td>
                      <td className="hospital-cell" data-label="Hospital">
                        {hospitalName ? (
                          <div className="doctor-hospital"><Building size={12} /> {hospitalName}</div>
                        ) : (
                          <span className="unassigned-badge">Not assigned</span>
                        )}
                      </td>
                      <td className="status-cell" data-label="Status">
                        <div className={`status-badge ${doc.isActive ? 'active' : 'inactive'}`}>
                          <span className="status-dot"></span>
                          {doc.isActive ? 'Active' : 'Inactive'}
                        </div>
                      </td>
                      <td className="actions-cell" data-label="Actions">
                        <div className="action-buttons">
                          <button className="action-icon view" onClick={() => handleViewDetails(doc)} title="View Full Details">
                            <Eye size={14} />
                          </button>
                          <button 
                            className={`action-icon status ${doc.isActive ? 'deactivate' : 'activate'}`} 
                            onClick={() => onToggleStatus(doc._id, doc.isActive, fullName)} 
                            title={doc.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {doc.isActive ? '🔴' : '🟢'}
                          </button>
                          <button className="action-icon edit" onClick={() => onEdit(doc)} title="Edit Doctor">
                            <Edit size={14} />
                          </button>
                          <button className="action-icon delete" onClick={() => onDelete(doc._id, fullName)} title="Delete Doctor">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

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
    </>
  );
};

export default DoctorsTab;