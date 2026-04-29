import React from 'react';
import { Users, Stethoscope } from 'lucide-react';
import './OverviewTab.css';

const OverviewTab = ({ recentPatients, recentDoctors }) => {
  return (
    <div className="overview-tab">
      <div className="recent-section">
        <h3><Users size={16} /> Recent Patients</h3>
        <div className="recent-list">
          {recentPatients.length === 0 ? (
            <div className="empty-state">No patients yet</div>
          ) : (
            recentPatients.map(patient => (
              <div key={patient._id} className="recent-item">
                <div className="recent-avatar">
                  {patient.user?.profile?.firstName?.[0]}{patient.user?.profile?.lastName?.[0]}
                </div>
                <div className="recent-info">
                  <div className="recent-name">
                    {patient.user?.profile?.firstName} {patient.user?.profile?.lastName}
                  </div>
                  <div className="recent-email">{patient.user?.email}</div>
                </div>
                <div className="recent-date">
                  {new Date(patient.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="recent-section">
        <h3><Stethoscope size={16} /> Recent Doctors</h3>
        <div className="recent-list">
          {recentDoctors.length === 0 ? (
            <div className="empty-state">No doctors yet.</div>
          ) : (
            recentDoctors.map(doctor => (
              <div key={doctor._id} className="recent-item">
                <div className="recent-avatar">
                  {doctor.profile?.firstName?.[0]}{doctor.profile?.lastName?.[0]}
                </div>
                <div className="recent-info">
                  <div className="recent-name">
                    Dr. {doctor.profile?.firstName} {doctor.profile?.lastName}
                  </div>
                  <div className="recent-email">{doctor.email}</div>
                </div>
                <div className="recent-date">
                  {new Date(doctor.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;