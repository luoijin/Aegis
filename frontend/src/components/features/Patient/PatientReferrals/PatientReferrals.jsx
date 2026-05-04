// frontend/src/components/features/Patient/PatientReferrals/PatientReferrals.jsx
import React from 'react';
import { Share2, User, Stethoscope, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import './PatientReferrals.css';

export const PatientReferrals = ({ referrals }) => {
  if (!referrals || referrals.length === 0) {
    return (
      <div className="referrals-card">
        <div className="card-header">
          <h3><Share2 size={16} /> Referrals</h3>
        </div>
        <div className="empty-state">
          <Share2 size={48} />
          <p>No referrals found</p>
          <span>Your referrals will appear here</span>
        </div>
      </div>
    );
  }

  const getStatusConfig = (status) => {
    switch(status) {
      case 'accepted':
        return { icon: <CheckCircle size={14} />, class: 'accepted', label: 'Accepted' };
      case 'denied':
        return { icon: <XCircle size={14} />, class: 'denied', label: 'Declined' };
      default:
        return { icon: <Clock size={14} />, class: 'pending', label: 'Pending' };
    }
  };

  const getPriorityConfig = (priority) => {
    switch(priority) {
      case 'urgent':
        return { icon: <AlertCircle size={12} />, class: 'urgent', label: 'Urgent' };
      case 'emergency':
        return { icon: <AlertCircle size={12} />, class: 'emergency', label: 'Emergency' };
      default:
        return { icon: null, class: 'normal', label: 'Normal' };
    }
  };

  return (
    <div className="referrals-card">
      <div className="card-header">
        <h3><Share2 size={16} /> Referrals</h3>
      </div>
      
      <div className="referrals-list">
        {referrals.map(ref => {
          const statusConfig = getStatusConfig(ref.status);
          const priorityConfig = getPriorityConfig(ref.priority);
          
          return (
            <div key={ref._id} className="referral-item">
              <div className="referral-header">
                <div className="referral-doctors">
                  <div className="doctor-from">
                    <User size={14} />
                    <span>Dr. {ref.fromDoctor?.profile?.firstName} {ref.fromDoctor?.profile?.lastName}</span>
                  </div>
                  <div className="doctor-arrow">→</div>
                  <div className="doctor-to">
                    <Stethoscope size={14} />
                    <span>Dr. {ref.toDoctor?.profile?.firstName} {ref.toDoctor?.profile?.lastName}</span>
                  </div>
                </div>
                <div className="referral-badges">
                  {priorityConfig.icon && (
                    <span className={`priority-badge ${priorityConfig.class}`}>
                      {priorityConfig.icon}
                      {priorityConfig.label}
                    </span>
                  )}
                  <span className={`status-badge ${statusConfig.class}`}>
                    {statusConfig.icon}
                    {statusConfig.label}
                  </span>
                </div>
              </div>
              
              <div className="referral-body">
                <div className="referral-reason">
                  <strong>Reason:</strong> {ref.reason}
                </div>
                {ref.notes && (
                  <div className="referral-notes">
                    <strong>Notes:</strong> {ref.notes}
                  </div>
                )}
                <div className="referral-date">
                  <Clock size={12} />
                  {new Date(ref.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};