// frontend/src/components/features/Patient/PatientHealthHistory/PatientHealthHistory.jsx

import React, { useState } from 'react';
import { Activity, Eye, X, Calendar, Heart, Thermometer, Droplet, AlertCircle, CheckCircle, FileText, Stethoscope } from 'lucide-react';
import './PatientHealthHistory.css';

export const PatientHealthHistory = ({ healthLogs, showAll = false }) => {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [filter, setFilter] = useState('all');

  if (!healthLogs || healthLogs.length === 0) {
    return (
      <div className="patient-health-history-card">
        <div className="card-header">
          <Activity size={18} />
          <h3>Health History</h3>
        </div>
        <div className="empty-state">
          <Activity size={48} strokeWidth={1.5} />
          <p>No health records available</p>
          <span>Your health records will appear here</span>
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
    if (firstName || lastName) return `Dr. ${firstName} ${lastName}`.trim();
    return recordedBy.email?.split('@')[0] || 'Unknown';
  };

  const getStatusBadge = (status) => {
    if (status === 'critical') return <span className="badge critical"><AlertCircle size={12} /> Critical</span>;
    if (status === 'warning') return <span className="badge warning"><AlertCircle size={12} /> Warning</span>;
    return <span className="badge normal"><CheckCircle size={12} /> Normal</span>;
  };

  const filteredLogs = filter === 'all' ? healthLogs : healthLogs.filter(log => log.status === filter);
  const displayedLogs = showAll ? filteredLogs : filteredLogs.slice(0, 5);

  const stats = {
    total: healthLogs.length,
    critical: healthLogs.filter(l => l.status === 'critical').length,
    warning: healthLogs.filter(l => l.status === 'warning').length,
    normal: healthLogs.filter(l => l.status === 'normal').length
  };

  return (
    <div className="patient-health-history-card">
      <div className="card-header">
        <h3>Health History</h3>
        <div className="filter-buttons">
          <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All ({stats.total})</button>
          <button className={`filter-btn critical ${filter === 'critical' ? 'active' : ''}`} onClick={() => setFilter('critical')}>Critical ({stats.critical})</button>
          <button className={`filter-btn warning ${filter === 'warning' ? 'active' : ''}`} onClick={() => setFilter('warning')}>Warning ({stats.warning})</button>
          <button className={`filter-btn normal ${filter === 'normal' ? 'active' : ''}`} onClick={() => setFilter('normal')}>Normal ({stats.normal})</button>
        </div>
      </div>

      <div className="health-table-wrapper">
        <table className="health-table">
          <thead>
            <tr><th>Date & Time</th><th>Heart Rate</th><th>Blood Pressure</th><th>Temperature</th><th>O₂ Sat</th><th>Recorded By</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {displayedLogs.map(log => (
              <tr key={log._id} className={`log-row ${log.status || 'normal'}`}>
                <td className="date-cell">{formatDate(log.createdAt)}</td>
                <td className="vital-cell">{log.vitals?.heartRate || '--'} <span className="unit">bpm</span></td>
                <td className="vital-cell">{log.vitals?.bloodPressure?.systolic || '--'}/{log.vitals?.bloodPressure?.diastolic || '--'} <span className="unit">mmHg</span></td>
                <td className="vital-cell">{log.vitals?.temperature || '--'} <span className="unit">°C</span></td>
                <td className="vital-cell">{log.vitals?.oxygenSaturation || '--'} <span className="unit">%</span></td>
                <td className="recorded-by-cell"><Stethoscope size={12} /><span>{getDoctorName(log.recordedBy)}</span></td>
                <td className="status-cell">{getStatusBadge(log.status)}</td>
                <td className="actions-cell">
                  <button className="view-details-btn" onClick={() => setSelectedRecord(log)}><Eye size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!showAll && healthLogs.length > 5 && (
        <div className="view-more">
          <button className="view-more-btn">View All {healthLogs.length} Records</button>
        </div>
      )}

      {selectedRecord && (
        <div className="modal-overlay" onClick={() => setSelectedRecord(null)}>
          <div className="record-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3><FileText size={18} /> Health Record Details</h3><button className="close-btn" onClick={() => setSelectedRecord(null)}><X size={20} /></button></div>
            <div className="modal-body">
              <div className="detail-row"><Calendar size={16} /><strong>Date & Time:</strong><span>{formatDate(selectedRecord.createdAt)}</span></div>
              <div className="detail-row"><Stethoscope size={16} /><strong>Recorded By:</strong><span className="doctor-name">{getDoctorName(selectedRecord.recordedBy)}</span></div>
              <div className="detail-row"><Heart size={16} /><strong>Status:</strong>{getStatusBadge(selectedRecord.status)}</div>
              <div className="divider"></div>
              <div className="vitals-section"><label>Vital Signs</label>
                <div className="vitals-grid">
                  <div className="vital-item"><span className="vital-name">Heart Rate:</span><span className="vital-value">{selectedRecord.vitals?.heartRate || '--'} <span className="unit">bpm</span></span></div>
                  <div className="vital-item"><span className="vital-name">Blood Pressure:</span><span className="vital-value">{selectedRecord.vitals?.bloodPressure?.systolic || '--'}/{selectedRecord.vitals?.bloodPressure?.diastolic || '--'} <span className="unit">mmHg</span></span></div>
                  <div className="vital-item"><span className="vital-name">Temperature:</span><span className="vital-value">{selectedRecord.vitals?.temperature || '--'} <span className="unit">°C</span></span></div>
                  <div className="vital-item"><span className="vital-name">O₂ Saturation:</span><span className="vital-value">{selectedRecord.vitals?.oxygenSaturation || '--'} <span className="unit">%</span></span></div>
                  {selectedRecord.vitals?.respiratoryRate && <div className="vital-item"><span className="vital-name">Respiratory Rate:</span><span className="vital-value">{selectedRecord.vitals.respiratoryRate} <span className="unit">/min</span></span></div>}
                </div>
              </div>
              {selectedRecord.notes && (
                <><div className="divider"></div><div className="notes-section"><label>Clinical Notes</label><p className="notes-text">{selectedRecord.notes}</p></div></>
              )}
            </div>
            <div className="modal-footer"><button className="close-modal-btn" onClick={() => setSelectedRecord(null)}>Close</button></div>
          </div>
        </div>
      )}
    </div>
  );
};