// frontend/src/components/features/Patient/PatientConditions/PatientConditions.jsx
import React from 'react';
import { Activity, AlertCircle, CheckCircle } from 'lucide-react';
import './PatientConditions.css';

export const PatientConditions = ({ conditions }) => {
  const activeConditions = conditions.filter(c => c.isActive !== false);
  
  if (activeConditions.length === 0) {
    return (
      <div className="patient-conditions-card">
        <div className="card-header">
          <h3><Activity size={16} /> Medical Conditions</h3>
        </div>
        <div className="no-conditions">
          <Activity size={32} />
          <p>No active medical conditions</p>
        </div>
      </div>
    );
  }

  const getSeverityStyle = (severity) => {
    switch(severity) {
      case 'mild': return { bg: '#D1FAE5', color: '#065F46', text: 'Mild' };
      case 'moderate': return { bg: '#FEF3C7', color: '#92400E', text: 'Moderate' };
      case 'severe': return { bg: '#FEE2E2', color: '#991B1B', text: 'Severe' };
      default: return { bg: '#F1F5F9', color: '#475569', text: 'Unknown' };
    }
  };

  return (
    <div className="patient-conditions-card">
      <div className="card-header">
        <h3>Medical Conditions</h3>
      </div>
      
      <div className="conditions-list">
        {activeConditions.map(condition => {
          const style = getSeverityStyle(condition.severity);
          return (
            <div key={condition._id} className="condition-item">
              <div className="condition-name">{condition.name}</div>
              <div className="condition-meta">
                <span className="severity-badge" style={{ background: style.bg, color: style.color }}>
                  {style.text}
                </span>
                <span className="diagnosed-date">
                  Diagnosed: {new Date(condition.diagnosedDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};