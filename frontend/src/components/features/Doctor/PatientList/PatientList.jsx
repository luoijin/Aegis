// frontend/src/components/features/Doctor/PatientList/PatientList.jsx

import React from 'react';
import { Search, ChevronRight } from 'lucide-react';
import './PatientList.css';

export const PatientList = ({ 
  patients, 
  selectedPatient, 
  onSelectPatient, 
  searchTerm, 
  onSearchChange, 
  loading,
  healthLogs 
}) => {
  return (
    <div className="patient-sidebar">
      <div className="sidebar-header">
        <h3>My Patients</h3>
        <div className="search-box">
          <Search size={16} />
          <input 
            type="text" 
            placeholder="Search patients..." 
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
      
      <div className="patients-list">
        {loading ? (
          <div className="loading-state">Loading patients...</div>
        ) : patients.length === 0 ? (
          <div className="empty-state">No patients found</div>
        ) : (
          patients.map(patient => {
            const firstName = patient.user?.profile?.firstName || '';
            const lastName = patient.user?.profile?.lastName || '';
            const fullName = `${firstName} ${lastName}`.trim() || 'Unknown Patient';
            
            return (
              <div 
                key={patient._id} 
                className={`patient-item ${selectedPatient?._id === patient._id ? 'active' : ''}`}
                onClick={() => onSelectPatient(patient)}
              >
                <div className="patient-name">{fullName}</div>
                <ChevronRight size={16} className="patient-chevron" />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};