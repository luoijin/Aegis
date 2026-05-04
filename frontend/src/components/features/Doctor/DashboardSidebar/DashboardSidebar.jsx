// frontend/src/components/features/Doctor/DashboardSidebar/DashboardSidebar.jsx
import React from 'react';
import { ChevronRight } from 'lucide-react';
import './DashboardSidebar.css';

export const DashboardSidebar = ({ 
  patients, 
  selectedPatient, 
  onSelectPatient, 
  searchTerm, 
  onSearchChange, 
  loading 
}) => {
  return (
<<<<<<< Updated upstream
    <aside className="dashboard-sidebar">
      <div className="sidebar-header">
        <h3>My Patients</h3>
        <input 
          type="text" 
          className="patient-search"
          placeholder="Search patients..." 
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
=======
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
              
              return (
                <div 
                  key={patient._id} 
                  className={`sidebar-patient-item ${selectedPatient?._id === patient._id ? 'active' : ''}`}
                  onClick={() => onSelectPatient(patient)}
                >
                  <span className="patient-name">{fullName}</span>
                  <ChevronRight size={16} className="patient-chevron" />
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* Add Patient Modal */}
      {showAddPatient && (
        <AddPatientModal
          onClose={() => setShowAddPatient(false)}
          onSuccess={() => {
            setShowAddPatient(false);
            if (onPatientAdd) onPatientAdd();  // This should refresh the patient list
          }}
>>>>>>> Stashed changes
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
            
            return (
              <div 
                key={patient._id} 
                className={`sidebar-patient-item ${selectedPatient?._id === patient._id ? 'active' : ''}`}
                onClick={() => onSelectPatient(patient)}
              >
                <span className="patient-name">{fullName}</span>
                <ChevronRight size={16} className="patient-chevron" />
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};