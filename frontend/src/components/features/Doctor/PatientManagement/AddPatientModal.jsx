// frontend/src/components/features/Doctor/PatientManagement/AddPatientModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Search, UserPlus } from 'lucide-react';
import api from '../../../../services/api';
import '../../../../styles/doctor-modal.css';

export const AddPatientModal = ({ onClose, onSuccess }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [availablePatients, setAvailablePatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAvailablePatients();
  }, []);

  const fetchAvailablePatients = async () => {
    setLoading(true);
    try {
      const response = await api.get('/patients/all/for-selection');
      setAvailablePatients(response.data);
    } catch (error) {
      console.error('Error fetching available patients:', error);
      setError('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPatient = async (patientId) => {
    setAdding(true);
    try {
      await api.post(`/patients/${patientId}/assign-doctor`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Error adding patient:', error);
      alert(error.response?.data?.message || 'Failed to add patient');
    } finally {
      setAdding(false);
    }
  };

  const filteredPatients = availablePatients.filter(patient =>
    !patient.assignedDoctor && (
      patient.user?.profile?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.user?.profile?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="doctor-modal-overlay" onClick={onClose}>
      <div className="doctor-modal-container doctor-modal-md" onClick={(e) => e.stopPropagation()}>
        <div className="doctor-modal-header">
          <h3>Add Patient to My List</h3>
          <button className="doctor-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="doctor-modal-form">
          {error && <div className="doctor-error-message">{error}</div>}

          <div className="doctor-form-group">
            <div className="search-input-wrapper">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search patients by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <div className="patients-list-modal">
            {loading ? (
              <div className="loading-state">Loading patients...</div>
            ) : filteredPatients.length === 0 ? (
              <div className="empty-state">
                <p>No available patients found</p>
                <span>All patients may already be assigned to a doctor</span>
              </div>
            ) : (
              filteredPatients.map(patient => {
                const name = `${patient.user?.profile?.firstName || ''} ${patient.user?.profile?.lastName || ''}`.trim();
                return (
                  <div key={patient._id} className="patient-item">
                    <div className="patient-info">
                      <div className="patient-details">
                        <div className="patient-name">{name || 'Unknown Patient'}</div>
                        <div className="patient-email">{patient.user?.email}</div>
                      </div>
                    </div>
                    <button 
                      className="add-patient-btn"
                      onClick={() => handleAddPatient(patient._id)}
                      disabled={adding}
                    >
                      <UserPlus size={16} /> Add
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};