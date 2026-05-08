// frontend/src/components/features/Doctor/ReferralSystem/ReferralCard.jsx

import React from 'react';
import { CheckCircle, XCircle, Clock, User, Stethoscope, AlertCircle } from 'lucide-react';
import './ReferralCard.css';

export const ReferralCard = ({ referral, onRespond, isOffline = false }) => {
  const getPriorityConfig = (priority) => {
    switch(priority) {
      case 'emergency':
        return { icon: <AlertCircle size={16} />, class: 'priority-emergency', label: 'EMERGENCY' };
      case 'urgent':
        return { icon: <AlertCircle size={16} />, class: 'priority-urgent', label: 'URGENT' };
      default:
        return { icon: null, class: 'priority-normal', label: 'Normal' };
    }
  };

  const getStatusConfig = (status) => {
    switch(status) {
      case 'accepted':
        return { icon: <CheckCircle size={18} />, class: 'status-accepted', label: 'Accepted' };
      case 'denied':
        return { icon: <XCircle size={18} />, class: 'status-denied', label: 'Declined' };
      default:
        return { icon: <Clock size={18} />, class: 'status-pending', label: 'Pending' };
    }
  };

  const priority = getPriorityConfig(referral.priority);
  const status = getStatusConfig(referral.status);

  const handleAccept = () => {
    if (!isOffline) onRespond(referral._id, 'accepted');
  };
  const handleDecline = () => {
    if (!isOffline) onRespond(referral._id, 'denied');
  };

  return (
    <div className="referral-card">
      <div className="referral-card-header">
        <div className="patient-info">
          <User size={18} />
          <span className="patient-name">
            {referral.patient?.user?.profile?.firstName} {referral.patient?.user?.profile?.lastName}
          </span>
          <span className={`priority-badge ${priority.class}`}>
            {priority.icon}
            {priority.label}
          </span>
        </div>
        <div className={`status-badge ${status.class}`}>
          {status.icon}
          {status.label}
        </div>
      </div>

      <div className="referral-card-body">
        <div className="doctor-info">
          <Stethoscope size={16} />
          <span>
            <strong>From:</strong> Dr. {referral.fromDoctor?.profile?.firstName} {referral.fromDoctor?.profile?.lastName}
          </span>
        </div>
        <div className="reason">
          <strong>Reason:</strong> {referral.reason}
        </div>
        {referral.notes && (
          <div className="notes">
            <strong>Notes:</strong> {referral.notes}
          </div>
        )}
        <div className="date">
          {new Date(referral.createdAt).toLocaleString()}
        </div>
      </div>

      {referral.status === 'pending' && (
        <div className="referral-card-actions">
          <button className="accept-btn" onClick={handleAccept} disabled={isOffline}>
            <CheckCircle size={16} /> Accept
          </button>
          <button className="decline-btn" onClick={handleDecline} disabled={isOffline}>
            <XCircle size={16} /> Decline
          </button>
        </div>
      )}
    </div>
  );
};