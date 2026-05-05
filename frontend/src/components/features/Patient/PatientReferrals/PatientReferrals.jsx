// frontend/src/components/features/Patient/PatientReferrals/PatientReferrals.jsx
import React, { useState } from 'react';
import { Share2, Send, Stethoscope, XCircle } from 'lucide-react';
import './PatientReferrals.css';

export const PatientReferrals = ({ referrals }) => {
  const [selectedReferral, setSelectedReferral] = useState(null);

  if (!referrals || referrals.length === 0) {
    return (
      <div className="patient-referrals-card">
        <div className="card-header">
          <Share2 size={18} />
          <h3>Referrals</h3>
        </div>
        <div className="empty-state">
          <Share2 size={48} strokeWidth={1.5} />
          <p>No referrals found</p>
          <span>When your doctor refers you to another specialist, it will appear here</span>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const DetailsModal = () => {
    if (!selectedReferral) return null;
    
    return (
      <div className="referral-modal-overlay" onClick={() => setSelectedReferral(null)}>
        <div className="referral-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3><Share2 size={18} /> Referral Details</h3>
            <button className="close-btn" onClick={() => setSelectedReferral(null)}>
              <XCircle size={20} />
            </button>
          </div>
          <div className="modal-body">
            <div className="detail-row">
              <span className="detail-label">From Doctor:</span>
              <span className="detail-value">
                Dr. {selectedReferral.fromDoctor?.profile?.firstName} {selectedReferral.fromDoctor?.profile?.lastName}
              </span>
            </div>
    
            <div className="detail-row">
              <span className="detail-label">Date:</span>
              <span className="detail-value">{formatDate(selectedReferral.createdAt)}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Reason:</span>
              <span className="detail-value reason-text">{selectedReferral.reason}</span>
            </div>
            {selectedReferral.notes && (
              <div className="detail-row">
                <span className="detail-label">Notes:</span>
                <span className="detail-value notes-text">{selectedReferral.notes}</span>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button className="close-modal-btn" onClick={() => setSelectedReferral(null)}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="patient-referrals-card">
        <div className="card-header">
          <Share2 size={18} />
          <h3>Referrals</h3>
          <span className="referral-count">{referrals.length} total</span>
        </div>

        <div className="referrals-table-wrapper">
          <table className="referrals-table">
            <thead>
              <tr>
                <th>Doctors</th>
                <th>Reason</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {referrals.map(referral => {
                const fromDoctorName = referral.fromDoctor?.profile?.firstName && referral.fromDoctor?.profile?.lastName
                  ? `Dr. ${referral.fromDoctor.profile.firstName} ${referral.fromDoctor.profile.lastName}`
                  : 'Unknown';
                const toDoctorName = referral.toDoctor?.profile?.firstName && referral.toDoctor?.profile?.lastName
                  ? `Dr. ${referral.toDoctor.profile.firstName} ${referral.toDoctor.profile.lastName}`
                  : 'Unknown';
                
                return (
                  <tr key={referral._id} onClick={() => setSelectedReferral(referral)} style={{ cursor: 'pointer' }}>
                    <td className="doctor-cell">
                      <Stethoscope size={14} />
                      <span>{fromDoctorName}</span>
                    </td>
                    <td className="doctor-cell">
                      <Send size={14} />
                      <span>{toDoctorName}</span>
                    </td>
                    <td className="reason-cell" title={referral.reason}>
                      {referral.reason.length > 50 ? referral.reason.substring(0, 50) + '...' : referral.reason}
                    </td>
                    <td className="date-cell">
                      {formatDate(referral.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <DetailsModal />
    </>
  );
};