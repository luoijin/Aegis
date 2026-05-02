// frontend/src/components/features/Patient/PatientInfoCard/PatientInfoCard.jsx
import React from 'react';
import { User, Stethoscope, Droplet, Phone, Mail, Calendar, Heart } from 'lucide-react';
import './PatientInfoCard.css';

export const PatientInfoCard = ({ patient, doctor, user }) => {
  return (
    <div className="patient-info-card">
      <div className="info-card-header">
        <h3>Your Information</h3>
      </div>
      
      <div className="info-grid">
        <div className="info-column">
          <div className="info-item">
            <User size={16} />
            <div>
              <span className="info-label">Full Name</span>
              <span className="info-value">{user?.profile?.firstName} {user?.profile?.lastName}</span>
            </div>
          </div>
          <div className="info-item">
            <Mail size={16} />
            <div>
              <span className="info-label">Email Address</span>
              <span className="info-value">{user?.email}</span>
            </div>
          </div>
          <div className="info-item">
            <Phone size={16} />
            <div>
              <span className="info-label">Phone Number</span>
              <span className="info-value">{user?.profile?.phone || 'Not provided'}</span>
            </div>
          </div>
          <div className="info-item">
            <Droplet size={16} />
            <div>
              <span className="info-label">Blood Type</span>
              <span className="info-value">{patient?.bloodType || 'Not specified'}</span>
            </div>
          </div>
        </div>
        
        <div className="info-column">
          <div className="info-item">
            <Stethoscope size={16} />
            <div>
              <span className="info-label">Primary Care Physician</span>
              <span className="info-value">
                {doctor ? `Dr. ${doctor?.profile?.firstName} ${doctor?.profile?.lastName}` : 'Not assigned'}
              </span>
            </div>
          </div>
          {doctor && (
            <>
              <div className="info-item">
                <div className="info-icon-placeholder"></div>
                <div>
                  <span className="info-label">Specialization</span>
                  <span className="info-value">{doctor?.specialization || 'General Medicine'}</span>
                </div>
              </div>
              <div className="info-item">
                <div className="info-icon-placeholder"></div>
                <div>
                  <span className="info-label">Doctor's Email</span>
                  <span className="info-value">{doctor?.email}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};