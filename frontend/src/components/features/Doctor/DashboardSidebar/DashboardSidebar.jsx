// frontend/src/components/features/Doctor/DashboardSidebar/DashboardSidebar.jsx
import React, { useState } from 'react';
import { ChevronRight, UserPlus, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import AddPatientModal from '../PatientManagement/AddPatientModal'; // ← Change this line (remove curly braces)
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

  const handleRemovePatient = async (patientId, patientName, e) => {
    e.stopPropagation();
    const result = await Swal.fire({
      title: 'Remove Patient?',
      text: `Are you sure you want to remove ${patientName} from your list?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#64748B',
      confirmButtonText: 'Yes, remove',
      cancelButtonText: 'Cancel'
    });
    if (result.isConfirmed) {
      setRemoving(patientId);
      try {
        await api.delete(`/patients/${patientId}/remove`);
        Swal.fire('Removed!', `${patientName} has been removed from your list.`, 'success');
        if (onPatientAdd) onPatientAdd();
      } catch (error) {
        console.error('Error removing patient:', error);
        Swal.fire('Error', error.response?.data?.message || 'Failed to remove patient', 'error');
      } finally {
        setRemoving(null);
      }
    }
  };

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
          ) : patients.length === 0 ? (
            <div className="empty">No patients found</div>
          ) : (
            patients.map(patient => {
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
                      onClick={(e) => handleRemovePatient(patient._id, fullName, e)}
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