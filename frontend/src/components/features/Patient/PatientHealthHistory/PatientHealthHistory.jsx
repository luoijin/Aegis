// frontend/src/components/features/Patient/PatientHealthHistory/PatientHealthHistory.jsx
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Eye, X, Clock, Activity, Thermometer, Droplet, AlertCircle, CheckCircle } from 'lucide-react';
import './PatientHealthHistory.css';

export const PatientHealthHistory = ({ healthLogs, showAll = false }) => {
  const [expanded, setExpanded] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  
  const displayLogs = showAll ? healthLogs : (expanded ? healthLogs : healthLogs.slice(0, 5));
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

    const getStatusBadge = (status) => {
    if (status === 'critical') return <span className="badge critical"><AlertCircle size={12} /> Critical</span>;
    if (status === 'warning') return <span className="badge warning"><AlertCircle size={12} /> Warning</span>;
    return <span className="badge normal"><CheckCircle size={12} /> Normal</span>;
    };

  if (healthLogs.length === 0) {
    return (
      <div className="health-history-card">
        <h3>Health History</h3>
        <div className="empty-state">No health records available</div>
      </div>
    );
  }

  return (
    <>
      <div className="health-history-card">
        <h3>Health History</h3>
        
        <div className="records-table-wrapper">
          <table className="records-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Heart Rate</th>
                <th>Blood Pressure</th>
                <th>Temperature</th>
                <th>O₂ Sat</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {displayLogs.map(log => (
                <tr key={log._id}>
                  <td>{formatDate(log.createdAt)}</td>
                  <td>{log.vitals?.heartRate || '--'} bpm</td>
                  <td>{log.vitals?.bloodPressure?.systolic || '--'}/{log.vitals?.bloodPressure?.diastolic || '--'}</td>
                  <td>{log.vitals?.temperature || '--'} °C</td>
                  <td>{log.vitals?.oxygenSaturation || '--'}%</td>
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
        
        {!showAll && healthLogs.length > 5 && (
          <button className="expand-btn" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            {expanded ? 'Show Less' : `View All (${healthLogs.length})`}
          </button>
        )}
      </div>

      {/* Record Details Modal */}
      {selectedRecord && (
        <div className="modal-overlay" onClick={() => setSelectedRecord(null)}>
          <div className="record-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Health Record Details</h3>
              <button className="close-btn" onClick={() => setSelectedRecord(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <Clock size={16} />
                <span>{formatDate(selectedRecord.createdAt)}</span>
              </div>
              <div className="detail-row">
                <Activity size={16} />
                <span>Heart Rate: {selectedRecord.vitals?.heartRate || '--'} bpm</span>
              </div>
              <div className="detail-row">
                <Activity size={16} />
                <span>Blood Pressure: {selectedRecord.vitals?.bloodPressure?.systolic || '--'}/{selectedRecord.vitals?.bloodPressure?.diastolic || '--'} mmHg</span>
              </div>
              <div className="detail-row">
                <Thermometer size={16} />
                <span>Temperature: {selectedRecord.vitals?.temperature || '--'} °C</span>
              </div>
              <div className="detail-row">
                <Droplet size={16} />
                <span>O₂ Saturation: {selectedRecord.vitals?.oxygenSaturation || '--'}%</span>
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