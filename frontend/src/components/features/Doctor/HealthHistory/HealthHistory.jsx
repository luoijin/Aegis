import React, { useState } from 'react';
import { HistoryTable } from './HistoryTable';
import './HealthHistory.css';

export const HealthHistory = ({ healthLogs }) => {
  const [filter, setFilter] = useState('all');

  // Get unique doctor names from health logs
  const getDoctorName = (recordedBy) => {
    if (!recordedBy) return 'Unknown';
    return `Dr. ${recordedBy.profile?.firstName || ''} ${recordedBy.profile?.lastName || ''}`.trim() || 'Unknown';
  };

  const filteredLogs = filter === 'all' 
    ? healthLogs 
    : healthLogs.filter(log => {
        const status = log.status || 'normal';
        if (filter === 'critical') return status === 'critical';
        if (filter === 'warning') return status === 'warning';
        if (filter === 'normal') return status === 'normal';
        return true;
      });

  const stats = {
    total: healthLogs.length,
    critical: healthLogs.filter(l => l.status === 'critical').length,
    warning: healthLogs.filter(l => l.status === 'warning').length,
    normal: healthLogs.filter(l => l.status === 'normal').length
  };

  return (
    <div className="health-history-container">
      <div className="history-header">
        <h3>Health History</h3>
        <div className="history-filters">
          <button 
            className={`filter-badge ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({stats.total})
          </button>
          <button 
            className={`filter-badge critical ${filter === 'critical' ? 'active' : ''}`}
            onClick={() => setFilter('critical')}
          >
            Critical ({stats.critical})
          </button>
          <button 
            className={`filter-badge warning ${filter === 'warning' ? 'active' : ''}`}
            onClick={() => setFilter('warning')}
          >
            Warning ({stats.warning})
          </button>
          <button 
            className={`filter-badge normal ${filter === 'normal' ? 'active' : ''}`}
            onClick={() => setFilter('normal')}
          >
            Normal ({stats.normal})
          </button>
        </div>
      </div>

      <HistoryTable healthLogs={filteredLogs} getDoctorName={getDoctorName} />
    </div>
  );
};