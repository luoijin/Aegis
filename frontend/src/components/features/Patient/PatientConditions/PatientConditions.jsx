// frontend/src/components/features/Patient/PatientConditions/PatientConditions.jsx
import React, { useState } from 'react';
import { Heart, AlertCircle, CheckCircle, Activity, History, ChevronDown, ChevronUp } from 'lucide-react';
import './PatientConditions.css';

export const PatientConditions = ({ conditions }) => {
  const [showResolved, setShowResolved] = useState(false);
  
  const activeConditions = conditions.filter(c => c.isActive !== false);
  const resolvedConditions = conditions.filter(c => c.isActive === false);

  const getSeverityStyle = (severity) => {
    switch(severity) {
      case 'severe':
        return { bg: '#FEE2E2', color: '#DC2626', text: 'Severe', icon: <AlertCircle size={12} /> };
      case 'moderate':
        return { bg: '#FEF3C7', color: '#D97706', text: 'Moderate', icon: <Activity size={12} /> };
      case 'mild':
        return { bg: '#D1FAE5', color: '#059669', text: 'Mild', icon: <Heart size={12} /> };
      default:
        return { bg: '#F1F5F9', color: '#64748B', text: 'Unknown', icon: <Heart size={12} /> };
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Date not specified';
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (conditions.length === 0) {
    return (
      <div className="patient-conditions-card">
        <div className="card-header">
          <Heart size={18} />
          <h3>Medical Conditions</h3>
        </div>
        <div className="empty-state">
          <Heart size={32} strokeWidth={1.5} />
          <p>No medical conditions recorded</p>
          <span>Your health conditions will appear here</span>
        </div>
      </div>
    );
  }

  return (
    <div className="patient-conditions-card">
      <div className="card-header">
        <Heart size={18} />
        <h3>Medical Conditions</h3>
        <span className="condition-count">{activeConditions.length} active</span>
      </div>

      {/* Active Conditions List */}
      <div className="conditions-list">
        {activeConditions.map((condition, index) => {
          const severityStyle = getSeverityStyle(condition.severity);
          return (
            <div key={condition._id || index} className="condition-item">
              <div className="condition-header">
                <div className="condition-name">{condition.name}</div>
                <div className="condition-badge" style={{ background: severityStyle.bg, color: severityStyle.color }}>
                  {severityStyle.icon}
                  {severityStyle.text}
                </div>
              </div>
              <div className="condition-details">
                <div className="detail-row">
                  <span className="detail-label">Diagnosed:</span>
                  <span className="detail-value">{formatDate(condition.diagnosedDate)}</span>
                </div>
                {condition.notes && (
                  <div className="detail-row">
                    <span className="detail-label">Notes:</span>
                    <span className="detail-value notes-text">{condition.notes}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Resolved Conditions Section */}
      {resolvedConditions.length > 0 && (
        <div className="resolved-section">
          <button 
            className="resolved-toggle" 
            onClick={() => setShowResolved(!showResolved)}
          >
            <History size={14} />
            <span>Resolved Conditions ({resolvedConditions.length})</span>
            {showResolved ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          {showResolved && (
            <div className="resolved-list">
              {resolvedConditions.map((condition, index) => {
                const severityStyle = getSeverityStyle(condition.severity);
                return (
                  <div key={condition._id || index} className="resolved-item">
                    <div className="condition-header">
                      <div className="condition-name resolved-name">{condition.name}</div>
                      <div className="resolved-badge">
                        <CheckCircle size={12} /> Resolved
                      </div>
                    </div>
                    <div className="condition-details">
                      <div className="detail-row">
                        <span className="detail-label">Diagnosed:</span>
                        <span className="detail-value">{formatDate(condition.diagnosedDate)}</span>
                      </div>
                      {condition.resolvedDate && (
                        <div className="detail-row">
                          <span className="detail-label">Resolved:</span>
                          <span className="detail-value">{formatDate(condition.resolvedDate)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};