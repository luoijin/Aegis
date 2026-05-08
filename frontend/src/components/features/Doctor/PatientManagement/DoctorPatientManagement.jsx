// frontend/src/components/features/Doctor/DoctorPatientManagement.jsx

import React, { useState, useEffect } from 'react';
import { Plus, Search, UserPlus, Trash2, X, WifiOff } from 'lucide-react';
import api from '../../../../services/api';
import Button from '../../../common/Button/Button';
import Input from '../../../common/Input/Input';
import './DoctorPatientManagement.css';

export const DoctorPatientManagement = ({ doctorId, onPatientChange }) => {
  const [patients, setPatients] = useState([]);
  const [allPatients, setAllPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    fetchPatients();
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

  const fetchPatients = async () => {
    try {
      const response = await api.get('/doctor/patients');
      setPatients(response.data);
      localStorage.setItem('cachedMyPatients', JSON.stringify(response.data));
    } catch (error) {
      console.error('Error fetching patients:', error);
      const cached = localStorage.getItem('cachedMyPatients');
      if (cached) {
        setPatients(JSON.parse(cached));
        if (!isOffline) console.warn('Using cached patient list');
      }
    }
  };

  const fetchAvailablePatients = async () => {
    try {
      const response = await api.get('/patients/all/for-selection');
      setAllPatients(response.data);
      localStorage.setItem('cachedAvailablePatients', JSON.stringify(response.data));
    } catch (error) {
      console.error('Error fetching available patients:', error);
      const cached = localStorage.getItem('cachedAvailablePatients');
      if (cached) setAllPatients(JSON.parse(cached));
    }
  };

  const addPatient = async (patientId) => {
    if (isOffline) {
      alert('You are offline. Cannot add patient.');
      return;
    }
    setLoading(true);
    try {
      await api.post(`/patients/${patientId}/assign-doctor`);
      await fetchPatients();
      setShowAddModal(false);
      if (onPatientChange) onPatientChange();
    } catch (error) {
      console.error('Error adding patient:', error);
      alert(error.response?.data?.message || 'Failed to add patient');
    } finally {
      setLoading(false);
    }
  };

  const removePatient = async (patientId) => {
    if (isOffline) {
      alert('You are offline. Cannot remove patient.');
      return;
    }
    setLoading(true);
    try {
      await api.delete(`/patients/${patientId}/remove-from-list`);
      await fetchPatients();
      setShowRemoveConfirm(null);
      if (onPatientChange) onPatientChange();
    } catch (error) {
      console.error('Error removing patient:', error);
      alert(error.response?.data?.message || 'Failed to remove patient');
    } finally {
      setLoading(false);
    }
  };

  const filteredAvailablePatients = allPatients.filter(patient => 
    !patients.some(p => p._id === patient._id) &&
    (patient.user?.profile?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     patient.user?.profile?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     patient.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="doctor-patient-management">
      {isOffline && (
        <div className="offline-banner">
          <WifiOff size={16} />
          <span>You are offline. Patient list is read‑only.</span>
        </div>
      )}

      <div className="management-header">
        <h3>My Patients ({patients.length})</h3>
        <Button size="sm" onClick={() => setShowAddModal(true)} disabled={isOffline}>
          <UserPlus size={16} /> Add Patient
        </Button>
      </div>

      <div className="patients-table-container">
        {patients.length === 0 ? (
          <div className="empty-state">
            <p>No patients assigned yet</p>
            <Button variant="outline" size="sm" onClick={() => setShowAddModal(true)} disabled={isOffline}>
              Add Your First Patient
            </Button>
          </div>
        ) : (
          <table className="patients-table">
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Email</th>
                <th>Blood Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map(patient => (
                <tr key={patient._id}>
                  <td>{patient.user?.profile?.firstName} {patient.user?.profile?.lastName}</td>
                  <td>{patient.user?.email}</td>
                  <td>{patient.bloodType || 'Not specified'}</td>
                  <td>
                    <button 
                      className="action-btn danger"
                      onClick={() => setShowRemoveConfirm(patient)}
                      disabled={isOffline}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Patient Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-container modal-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Patient</h3>
              <button className="modal-close" onClick={() => setShowAddModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="search-section">
                <Input
                  placeholder="Search patients by name or email..."
                  icon={<Search size={16} />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={isOffline}
                />
              </div>
              <div className="available-patients-list">
                {filteredAvailablePatients.length === 0 ? (
                  <div className="no-results">No available patients found</div>
                ) : (
                  filteredAvailablePatients.map(patient => (
                    <div key={patient._id} className="available-patient-item">
                      <div className="patient-info">
                        <div>
                          <div className="patient-name">
                            {patient.user?.profile?.firstName} {patient.user?.profile?.lastName}
                          </div>
                          <div className="patient-email">{patient.user?.email}</div>
                        </div>
                      </div>
                      <Button size="sm" onClick={() => addPatient(patient._id)} loading={loading} disabled={isOffline}>
                        Add to My List
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Remove Confirmation Modal */}
      {showRemoveConfirm && (
        <div className="modal-overlay" onClick={() => setShowRemoveConfirm(null)}>
          <div className="modal-container modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Remove Patient</h3>
              <button className="modal-close" onClick={() => setShowRemoveConfirm(null)}><X size={20} /></button>
            </div>
            <div className="modal-body confirm-modal-body">
              <p>Are you sure you want to remove <strong>{showRemoveConfirm.user?.profile?.firstName} {showRemoveConfirm.user?.profile?.lastName}</strong> from your patient list?</p>
              <div className="warning-text">This patient will no longer appear in your dashboard.</div>
              <div className="confirm-actions">
                <Button variant="outline" onClick={() => setShowRemoveConfirm(null)}>Cancel</Button>
                <Button variant="danger" onClick={() => removePatient(showRemoveConfirm._id)} loading={loading}>Remove</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};