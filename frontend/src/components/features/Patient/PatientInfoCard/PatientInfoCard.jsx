// frontend/src/components/features/Patient/PatientInfoCard/PatientInfoCard.jsx
import React, { useState, useEffect } from 'react';
import { User, Stethoscope, Droplet, Phone, Mail } from 'lucide-react';
import api from '../../../../services/api';
import './PatientInfoCard.css';

export const PatientInfoCard = ({ patient, doctor, user, onRefresh }) => {
  const [currentPatient, setCurrentPatient] = useState(patient);

  useEffect(() => {
    setCurrentPatient(patient);
  }, [patient]);

  // Refresh patient data to get latest blood type
  const refreshPatientData = async () => {
    try {
      const response = await api.get('/patient/profile');
      setCurrentPatient(response.data);
      if (onRefresh) onRefresh(response.data);
    } catch (error) {
      console.error('Error refreshing patient data:', error);
    }
  };

  // Poll for updates every 5 seconds (or use WebSocket for real-time)
  useEffect(() => {
    const interval = setInterval(refreshPatientData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="patient-info-card">
      <div className="card-header">
        <h3><User size={16} /> Your Information</h3>
      </div>
      
      <div className="info-grid">
        <div className="info-column">
          <div className="info-section-title">
            <User size={14} />
            <span>Personal Details</span>
          </div>
          
          <div className="info-item">
            <div className="info-icon">
              <User size={16} />
            </div>
            <div className="info-content">
              <span className="info-label">Full Name</span>
              <span className="info-value">{user?.profile?.firstName} {user?.profile?.lastName}</span>
            </div>
          </div>
          
          <div className="info-item">
            <div className="info-icon">
              <Mail size={16} />
            </div>
            <div className="info-content">
              <span className="info-label">Email Address</span>
              <span className="info-value">{user?.email}</span>
            </div>
          </div>
          
          <div className="info-item">
            <div className="info-icon">
              <Phone size={16} />
            </div>
            <div className="info-content">
              <span className="info-label">Phone Number</span>
              <span className="info-value">{user?.profile?.phone || 'Not provided'}</span>
            </div>
          </div>
          
          <div className="info-item">
            <div className="info-icon">
              <Droplet size={16} />
            </div>
            <div className="info-content">
              <span className="info-label">Blood Type</span>
              <span className="info-value blood-type">
                {currentPatient?.bloodType && currentPatient.bloodType !== '' 
                  ? currentPatient.bloodType 
                  : 'Not specified'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="info-column">
          <div className="info-section-title">
            <Stethoscope size={14} />
            <span>Primary Care Physician</span>
          </div>
          
          {doctor ? (
            <>
              <div className="info-item">
                <div className="info-icon">
                  <Stethoscope size={16} />
                </div>
                <div className="info-content">
                  <span className="info-label">Doctor Name</span>
                  <span className="info-value">Dr. {doctor?.profile?.firstName} {doctor?.profile?.lastName}</span>
                </div>
              </div>
              
              <div className="info-item">
                <div className="info-icon">
                  <span className="placeholder-icon"></span>
                </div>
                <div className="info-content">
                  <span className="info-label">Specialization</span>
                  <span className="info-value">{doctor?.specialization || 'General Medicine'}</span>
                </div>
              </div>
              
              <div className="info-item">
                <div className="info-icon">
                  <Mail size={16} />
                </div>
                <div className="info-content">
                  <span className="info-label">Email</span>
                  <span className="info-value">{doctor?.email}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="no-doctor">
              <Stethoscope size={32} />
              <p>No doctor assigned yet</p>
              <span>Your primary care physician will appear here</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};