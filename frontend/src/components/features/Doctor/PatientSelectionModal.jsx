import React, { useState, useEffect } from 'react';
import { Search, Check, Stethoscope, X, AlertCircle } from 'lucide-react';
import api from '../../../utils/api';
import './PatientSelectionModal.css';

const PatientSelectionModal = ({ onClose, onSuccess }) => {
  const [availablePatients, setAvailablePatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  useEffect(() => {
    fetchAvailablePatients();
  }, []);

  const fetchAvailablePatients = async () => {
    try {
      setLoading(true);
      const response = await api.get('/patients/all/for-selection');
      console.log('Fetched patients:', response.data);
      setAvailablePatients(response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
      setError('Failed to load patients: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setError('');
    setInfoMessage('');
  };

  const handleAddPatient = async () => {
    if (!selectedPatient) {
      setError('Please select a patient');
      return;
    }

    setSubmitting(true);
    setError('');
    setInfoMessage('');

    try {
      if (selectedPatient.assignedDoctor) {
        // Patient already has a doctor - send change request
        const response = await api.post(`/patients/${selectedPatient._id}/request-doctor-change`);
        setInfoMessage(`Request sent to patient. They will need to approve the change.`);
        setTimeout(() => {
          onSuccess(selectedPatient);
        }, 2000);
      } else {
        // No existing doctor - assign directly
        await api.post(`/patients/${selectedPatient._id}/assign-doctor`);
        onSuccess(selectedPatient);
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.response?.data?.message || 'Failed to add patient');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPatients = availablePatients.filter(patient => {
    const fullName = `${patient.user?.profile?.firstName} ${patient.user?.profile?.lastName}`.toLowerCase();
    const email = patient.user?.email?.toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || email?.includes(search);
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="patient-selection-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add Existing Patient</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="search-section">
            <div className="search-bar">
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Search by name or email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}
          {infoMessage && <div className="info-message">{infoMessage}</div>}

          {loading ? (
            <div className="loading-state">Loading patients...</div>
          ) : filteredPatients.length === 0 ? (
            <div className="empty-state">
              <AlertCircle size={32} />
              <p>No registered patients found.</p>
              <p className="hint">Patients need to register an account first.</p>
            </div>
          ) : (
            <div className="patients-list">
              {filteredPatients.map(patient => {
                const isSelected = selectedPatient?._id === patient._id;
                const hasAssignedDoctor = patient.assignedDoctor;
                
                return (
                  <div 
                    key={patient._id} 
                    className={`patient-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelectPatient(patient)}
                  >
                    <div className="patient-avatar">
                      {patient.user?.profile?.firstName?.[0]}{patient.user?.profile?.lastName?.[0]}
                    </div>
                    <div className="patient-info">
                      <div className="patient-name">
                        {patient.user?.profile?.firstName} {patient.user?.profile?.lastName}
                      </div>
                      <div className="patient-email">{patient.user?.email}</div>
                      <div className="patient-details">
                        <span className="blood-type">Blood: {patient.bloodType || 'Not specified'}</span>
                        {hasAssignedDoctor && (
                          <span className="doctor-assigned">
                            <Stethoscope size={12} />
                            Has primary doctor
                          </span>
                        )}
                        {!hasAssignedDoctor && (
                          <span className="no-doctor">
                            No primary doctor assigned
                          </span>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="selected-badge">
                        <Check size={18} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button 
            className={`add-btn ${!selectedPatient ? 'disabled' : ''}`}
            onClick={handleAddPatient}
            disabled={!selectedPatient || submitting}
          >
            {submitting ? 'Processing...' : (selectedPatient?.assignedDoctor ? 'Request Change' : 'Add to My Practice')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientSelectionModal;