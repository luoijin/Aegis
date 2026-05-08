// frontend/src/components/features/Doctor/HealthHistory/HealthHistory.jsx

import React, { useState } from 'react';
import { FileText, Eye, X, Clock, Activity, Thermometer, Droplet, AlertCircle, CheckCircle, Stethoscope } from 'lucide-react';
import './HealthHistory.css';

export const HealthHistory = ({ healthLogs }) => {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [filter, setFilter] = useState('all');

  if (!healthLogs || healthLogs.length === 0) {
    return (
      <div className="health-history-card">
        <div className="card-header">
          <h3><FileText size={16} /> Health History</h3>
        </div>
        <div className="empty-state">
          <FileText size={48} />
          <p>No health records available</p>
          <span>Patient health records will appear here</span>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getDoctorName = (recordedBy) => {
    if (!recordedBy) return 'Unknown';
    const firstName = recordedBy.profile?.firstName || '';
    const lastName = recordedBy.profile?.lastName || '';
    if (firstName || lastName) {
      return `Dr. ${firstName} ${lastName}`.trim();
    }
    return recordedBy.email?.split('@')[0] || 'Unknown';
  };

  const getStatusBadge = (status) => {
    if (status === 'critical') return <span className="badge critical"><AlertCircle size={12} /> Critical</span>;
    if (status === 'warning') return <span className="badge warning"><AlertCircle size={12} /> Warning</span>;
    return <span className="badge normal"><CheckCircle size={12} /> Normal</span>;
  };

  const filteredLogs = filter === 'all' 
    ? healthLogs 
    : healthLogs.filter(log => log.status === filter);

  const stats = {
    total: healthLogs.length,
    critical: healthLogs.filter(l => l.status === 'critical').length,
    warning: healthLogs.filter(l => l.status === 'warning').length,
    normal: healthLogs.filter(l => l.status === 'normal').length
  };

  return (
    <>
      <div className="health-history-card">
        <div className="card-header">
          <h3><FileText size={16} /> Health History</h3>
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({stats.total})
            </button>
            <button 
              className={`filter-btn critical ${filter === 'critical' ? 'active' : ''}`}
              onClick={() => setFilter('critical')}
            >
              Critical ({stats.critical})
            </button>
            <button 
              className={`filter-btn warning ${filter === 'warning' ? 'active' : ''}`}
              onClick={() => setFilter('warning')}
            >
              Warning ({stats.warning})
            </button>
            <button 
              className={`filter-btn normal ${filter === 'normal' ? 'active' : ''}`}
              onClick={() => setFilter('normal')}
            >
              Normal ({stats.normal})
            </button>
          </div>
        </div>

        <div className="records-table-wrapper">
          <table className="records-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Heart Rate</th>
                <th>Blood Pressure</th>
                <th>Temperature</th>
                <th>O₂ Sat</th>
                <th>Recorded By</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(log => (
                <tr key={log._id}>
                  <td>{formatDate(log.createdAt)}</td>
                  <td>{log.vitals?.heartRate || '--'} bpm</td>
                  <td>{log.vitals?.bloodPressure?.systolic || '--'}/{log.vitals?.bloodPressure?.diastolic || '--'}</td>
                  <td>{log.vitals?.temperature || '--'} °C</td>
                  <td>{log.vitals?.oxygenSaturation || '--'}%</td>
                  <td className="recorded-by-cell">{getDoctorName(log.recordedBy)}</td>
                  <td>{getStatusBadge(log.status)}</td>
                  <td>
                    <button className="view-details-btn" onClick={() => setSelectedRecord(log)}>
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedRecord && (
        <div className="modal-overlay" onClick={() => setSelectedRecord(null)}>
          <div className="record-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><FileText size={18} /> Health Record Details</h3>
              <button className="close-btn" onClick={() => setSelectedRecord(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <Clock size={16} />
                <strong>Date & Time:</strong>
                <span>{formatDate(selectedRecord.createdAt)}</span>
              </div>
              <div className="detail-row">
                <Stethoscope size={16} />
                <strong>Recorded By:</strong>
                <span>{getDoctorName(selectedRecord.recordedBy)}</span>
              </div>
              <div className="detail-row">
                <Activity size={16} />
                <strong>Heart Rate:</strong>
                <span>{selectedRecord.vitals?.heartRate || '--'} bpm</span>
              </div>
              <div className="detail-row">
                <Activity size={16} />
                <strong>Blood Pressure:</strong>
                <span>{selectedRecord.vitals?.bloodPressure?.systolic || '--'}/{selectedRecord.vitals?.bloodPressure?.diastolic || '--'} mmHg</span>
              </div>
              <div className="detail-row">
                <Thermometer size={16} />
                <strong>Temperature:</strong>
                <span>{selectedRecord.vitals?.temperature || '--'} °C</span>
              </div>
              <div className="detail-row">
                <Droplet size={16} />
                <strong>O₂ Saturation:</strong>
                <span>{selectedRecord.vitals?.oxygenSaturation || '--'}%</span>
              </div>
              {selectedRecord.notes && (
                <div className="notes-section">
                  <strong>Notes:</strong>
                  <p>{selectedRecord.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HealthHistory;