// frontend/src/components/features/Doctor/PatientManagement/AddPatientModal.jsx

import React, { useState, useEffect } from 'react';
import { X, Search, UserPlus, Mail, Phone, AlertCircle, WifiOff } from 'lucide-react';
import api from '../../../../services/api';
import './AddPatientModal.css';

const AddPatientModal = ({ onClose, onSuccess }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [availablePatients, setAvailablePatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    fetchAvailablePatients();
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const fetchAvailablePatients = async () => {
    try {
      setLoading(true);
      const response = await api.get('/patient/available');
      setAvailablePatients(response.data);
      localStorage.setItem('cachedAddPatientList', JSON.stringify(response.data));
    } catch (error) {
      console.error('Error fetching available patients:', error);
      const cached = localStorage.getItem('cachedAddPatientList');
      if (cached) {
        setAvailablePatients(JSON.parse(cached));
        setError('Using cached patient list (offline)');
        setTimeout(() => setError(''), 3000);
      } else {
        setError('Failed to load available patients');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddPatient = async (patientId, patientName) => {
    if (isOffline) {
      setError('You are offline. Cannot add patient.');
      setTimeout(() => setError(''), 3000);
      return;
    }
    setAdding(true);
    setError('');
    setSuccessMessage('');
    
    try {
      await api.post(`/patients/${patientId}/assign`);
      setSuccessMessage(`${patientName} has been added to your list!`);
      setAvailablePatients(prev => prev.filter(p => p._id !== patientId));
      setTimeout(() => setSuccessMessage(''), 3000);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error adding patient:', error);
      setError(error.response?.data?.message || 'Failed to add patient');
      setTimeout(() => setError(''), 3000);
    } finally {
      setAdding(false);
    }
  };

  const filteredPatients = availablePatients.filter(patient => {
    const firstName = patient.user?.profile?.firstName || '';
    const lastName = patient.user?.profile?.lastName || '';
    const fullName = `${firstName} ${lastName}`.toLowerCase();
    const email = (patient.user?.email || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || email.includes(search);
  });

  return (
    <div className="add-patient-modal-overlay" onClick={onClose}>
      <div className="add-patient-modal" onClick={(e) => e.stopPropagation()}>
        {isOffline && (
          <div className="offline-banner-modal">
            <WifiOff size={14} />
            <span>Offline – cannot add patients</span>
          </div>
        )}

        <div className="modal-header">
          <h3><UserPlus size={18} /> Add Patient to My List</h3>
          <button className="close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="modal-body">
          {error && (
            <div className="error-message">
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}
          {successMessage && (
            <div className="success-message">
              <UserPlus size={14} />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="search-container">
            <div className="search-input-wrapper">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
                disabled={isOffline}
              />
            </div>
          </div>

          <div className="patients-list">
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading available patients...</p>
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="empty-state">
                <UserPlus size={48} strokeWidth={1.5} />
                <p>No available patients found</p>
                {searchTerm && <span>Try a different search term</span>}
                {!searchTerm && <span>All patients are already in your list</span>}
              </div>
            ) : (
              <div className="patients-grid">
                {filteredPatients.map(patient => {
                  const firstName = patient.user?.profile?.firstName || '';
                  const lastName = patient.user?.profile?.lastName || '';
                  const fullName = `${firstName} ${lastName}`.trim() || 'Unknown Patient';
                  const email = patient.user?.email || 'No email';
                  const phone = patient.user?.profile?.phone || 'No phone';
                  
                  return (
                    <div key={patient._id} className="patient-card">
                      <div className="patient-card-content">
                        <div className="patient-card-header">
                          <div className="patient-name">{fullName}</div>
                        </div>
                        <div className="patient-contact-info">
                          <div className="contact-item">
                            <Mail size={14} />
                            <span className="contact-email">{email}</span>
                          </div>
                          <div className="contact-item">
                            <Phone size={14} />
                            <span>{phone}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        className="add-patient-btn"
                        onClick={() => handleAddPatient(patient._id, fullName)}
                        disabled={adding || isOffline}
                      >
                        <UserPlus size={14} />
                        Add Patient
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPatientModal;