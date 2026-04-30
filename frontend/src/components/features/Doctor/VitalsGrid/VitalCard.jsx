import React from 'react';
import './VitalCard.css';

export const VitalCard = ({ icon, label, value, unit }) => {
  return (
    <div className="vital-card">
      {icon}
      <div>
        <div className="vital-label">{label}</div>
        <div className="vital-value">{value} <span>{unit}</span></div>
      </div>
    </div>
  );
};