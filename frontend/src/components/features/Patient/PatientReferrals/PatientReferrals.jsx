import React from 'react';
import { Share2 } from 'lucide-react';
import './PatientReferrals.css';

export const PatientReferrals = ({ referrals }) => {
  if (!referrals || referrals.length === 0) {
    return (
      <div className="referrals-card">
        <h3>Referrals</h3>
        <div className="empty-state">
          <Share2 size={48} />
          <p>No referrals found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="referrals-card">
      <h3>Referrals</h3>
      <div className="referrals-list">
        {referrals.map(ref => (
          <div key={ref._id} className="referral-item">
            <div>Referred to: Dr. {ref.toDoctor?.profile?.firstName}</div>
            <div>Status: {ref.status}</div>
            <div>Reason: {ref.reason}</div>
          </div>
        ))}
      </div>
    </div>
  );
};