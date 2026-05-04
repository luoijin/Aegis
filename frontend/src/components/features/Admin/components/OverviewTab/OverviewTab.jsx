// frontend/src/components/features/Admin/components/OverviewTab/OverviewTab.jsx
import React from 'react';
import { Users, Stethoscope, Mail, CheckCircle, XCircle, User, Phone, Award } from 'lucide-react';
import './OverviewTab.css';

const OverviewTab = ({ recentPatients, recentDoctors }) => {
  // Calculate stats
  const totalPatients = recentPatients?.length || 0;
  const activePatients = recentPatients?.filter(p => p.user?.isActive === true).length || 0;
  const inactivePatients = recentPatients?.filter(p => p.user?.isActive === false).length || 0;
  
  const totalDoctors = recentDoctors?.length || 0;
  const activeDoctors = recentDoctors?.filter(d => d.isActive === true).length || 0;
  const inactiveDoctors = recentDoctors?.filter(d => d.isActive === false).length || 0;

  return (
    <div className="overview-tab">

      {/* Two-Column Layout for Recent Patients and Recent Doctors */}
      <div className="two-column-layout">
        {/* Recent Patients Column */}
        <div className="recent-section">
          <div className="section-header">
            <Users size={18} />
            <h3>Recent Patients</h3>
            <span className="section-count">Latest {totalPatients}</span>
          </div>
          <div className="list-wrapper">
            {recentPatients.length === 0 ? (
              <div className="empty-message">No patients found</div>
            ) : (
              <div className="patient-cards">
                {recentPatients.map(patient => (
                  <div key={patient._id} className="patient-card">
                    <div className="card-header">
                      <div className="patient-name">
                        {patient.user?.profile?.firstName} {patient.user?.profile?.lastName}
                      </div>
       
                    </div>
                    <div className="card-details">
                      <div className="detail-row">
                        <Mail size={14} />
                        <span>{patient.user?.email}</span>
                      </div>
                      {patient.user?.profile?.phone && (
                        <div className="detail-row">
                          <Phone size={14} />
                          <span>{patient.user?.profile?.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Doctors Column */}
        <div className="recent-section">
          <div className="section-header">
            <Stethoscope size={18} />
            <h3>Recent Doctors</h3>
            <span className="section-count">Latest {totalDoctors}</span>
          </div>
          <div className="list-wrapper">
            {recentDoctors.length === 0 ? (
              <div className="empty-message">No doctors found</div>
            ) : (
              <div className="doctor-cards">
                {recentDoctors.map(doctor => (
                  <div key={doctor._id} className="doctor-card">
                    <div className="card-header">
                      <div className="doctor-name">
                        Dr. {doctor.profile?.firstName} {doctor.profile?.lastName}
                      </div>
                
                    </div>
                    <div className="card-details">
                      <div className="detail-row">
                        <Mail size={14} />
                        <span>{doctor.email}</span>
                      </div>
                      {doctor.specialization && (
                        <div className="detail-row">
                          <Award size={14} />
                          <span>{doctor.specialization}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;