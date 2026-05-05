// frontend/src/components/features/Doctor/DashboardSidebar/DashboardSidebar.jsx
import React, { useState } from 'react';
import { ChevronRight, UserPlus, Trash2 } from 'lucide-react';
import AddPatientModal from '../PatientManagement/AddPatientModal';
import ConfirmModal from '../../../common/ConfirmModal/ConfirmModal';
import { confirmDialog } from '../../../../utils/confirmDialog'; // ← ADD THIS IMPORT
import api from '../../../../services/api';
import './DashboardSidebar.css';

export const DashboardSidebar = ({ 
  patients, 
  selectedPatient, 
  onSelectPatient,
  searchTerm, 
  onSearchChange, 
  loading,
  onPatientAdd 
}) => {
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [removing, setRemoving] = useState(null);

  // REMOVE the old showConfirm and confirmModal state - use confirmDialog instead
  // DELETE these lines:
  // const [confirmModal, setConfirmModal] = useState({...});
  // const showConfirm = (patientId, patientName) => {...};

  const handleRemovePatient = async (patientId, patientName) => {
    const confirmed = await confirmDialog(
      'Remove Patient',
      `Are you sure you want to remove ${patientName} from your list?`,
      'danger',
      'Yes, Remove',
      'Cancel'
    );
    
    if (confirmed) {
      setRemoving(patientId);
      try {
        await api.delete(`/patients/${patientId}/remove`);
        if (onPatientAdd) onPatientAdd();
      } catch (error) {
        console.error('Error removing patient:', error);
      } finally {
        setRemoving(null);
      }
    }
  };

  const filteredPatients = patients.filter(patient => {
    const firstName = patient.user?.profile?.firstName || '';
    const lastName = patient.user?.profile?.lastName || '';
    const fullName = `${firstName} ${lastName}`.toLowerCase();
    const email = (patient.user?.email || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || email.includes(search);
  });

  return (
    <>
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-header-top">
            <h3>My Patients</h3>
            <button 
              className="add-patient-sidebar-btn" 
              onClick={() => setShowAddPatient(true)}
              title="Add Patient to My List"
            >
              <UserPlus size={16} />
            </button>
          </div>
          <input 
            type="text" 
            className="patient-search"
            placeholder="Search patients..." 
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="sidebar-patients-list">
          {loading ? (
            <div className="loading">Loading...</div>
          ) : filteredPatients.length === 0 ? (
            <div className="empty">No patients found</div>
          ) : (
            filteredPatients.map(patient => {
              const firstName = patient.user?.profile?.firstName || '';
              const lastName = patient.user?.profile?.lastName || '';
              const fullName = `${firstName} ${lastName}`.trim() || 'Unknown Patient';
              const isRemoving = removing === patient._id;
              
              return (
                <div 
                  key={patient._id} 
                  className={`sidebar-patient-item ${selectedPatient?._id === patient._id ? 'active' : ''}`}
                  onClick={() => onSelectPatient(patient)}
                >
                  <span className="patient-name">{fullName}</span>
                  <div className="patient-actions">
                    <button 
                      className="remove-patient-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemovePatient(patient._id, fullName); // ← Call directly
                      }}
                      disabled={isRemoving}
                      title="Remove from my list"
                    >
                      <Trash2 size={14} />
                    </button>
                    <ChevronRight size={16} className="patient-chevron" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {showAddPatient && (
        <AddPatientModal
          onClose={() => setShowAddPatient(false)}
          onSuccess={() => {
            setShowAddPatient(false);
            if (onPatientAdd) onPatientAdd();
          }}
        />
      )}

    </>
  );
};