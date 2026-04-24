import React from 'react';
import './StatsCard.css';

const StatsCard = ({ label, value, trend, isGood }) => {
  const trendColor = isGood ? 'success' : (label.includes('Critical') ? 'danger' : 'primary');
  
  return (
    <div className="stat-card">
      <span className="stat-label">{label}</span>
      <span className={`stat-value text-${trendColor}`}>{value}</span>
      <div className={`stat-trend text-${trendColor}`}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
          <polyline points="17 6 23 6 23 12"></polyline>
        </svg>
        {trend}
      </div>
    </div>
  );
};

export default StatsCard;