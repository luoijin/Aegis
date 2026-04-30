import React, { useState } from 'react';
import { Stethoscope, Eye, FileText, X, AlertCircle, CheckCircle } from 'lucide-react';
import './HistoryTable.css';

export const HistoryTable = ({ healthLogs, getDoctorName }) => {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  if (healthLogs.length === 0) {
    return (
      <div className="no-data">
        <FileText size={40} />
        <p>No health records found</p>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch(status) {
      case 'critical':
        return (
          <span className="status-badge critical">
            <AlertCircle size={12} /> Critical
          </span>
        );
      case 'warning':
        return (
          <span className="status-badge warning">
            <AlertCircle size={12} /> Warning
          </span>
        );
      default:
        return (
          <span className="status-badge normal">
            <CheckCircle size={12} /> Normal
          </span>
        );
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleViewDetails = (record) => {
    setSelectedRecord(record);
    setShowDetailsModal(true);
  };

  const DetailsModal = () => {
    if (!showDetailsModal || !selectedRecord) return null;
    
    return (
      <div className="notes-modal-overlay" onClick={() => setShowDetailsModal(false)}>
        <div className="notes-modal" onClick={(e) => e.stopPropagation()}>
          <div className="notes-modal-header">
            <div className="notes-modal-title">
              <FileText size={20} />
              <h3>Vital Signs Record</h3>
            </div>
            <button className="notes-modal-close" onClick={() => setShowDetailsModal(false)}>
              <X size={20} />
            </button>
          </div>
          
          <div className="notes-modal-body">
            <div className="notes-info-row">
              <span className="notes-label">Date & Time:</span>
              <span className="notes-value">{formatDate(selectedRecord.createdAt)}</span>
            </div>
            
            <div className="notes-info-row">
              <span className="notes-label">Recorded By:</span>
              <span className="notes-value doctor-name">
                <Stethoscope size={14} />
                {getDoctorName(selectedRecord.recordedBy)}
              </span>
            </div>
            
            <div className="notes-info-row">
              <span className="notes-label">Status:</span>
              <span className="notes-value">{getStatusBadge(selectedRecord.status)}</span>
            </div>
            
            <div className="notes-divider"></div>
            
            <div className="notes-section">
              <label>Vital Signs</label>
              <div className="vitals-summary">
                <div className="vital-item">
                  <span className="vital-name">Heart Rate:</span>
                  <span className="vital-data">{selectedRecord.vitals?.heartRate || '--'} bpm</span>
                </div>
                <div className="vital-item">
                  <span className="vital-name">Blood Pressure:</span>
                  <span className="vital-data">
                    {selectedRecord.vitals?.bloodPressure?.systolic || '--'}/{selectedRecord.vitals?.bloodPressure?.diastolic || '--'} mmHg
                  </span>
                </div>
                <div className="vital-item">
                  <span className="vital-name">Temperature:</span>
                  <span className="vital-data">{selectedRecord.vitals?.temperature || '--'} °C</span>
                </div>
                <div className="vital-item">
                  <span className="vital-name">Oxygen Saturation:</span>
                  <span className="vital-data">{selectedRecord.vitals?.oxygenSaturation || '--'} %</span>
                </div>
                {selectedRecord.vitals?.respiratoryRate && (
                  <div className="vital-item">
                    <span className="vital-name">Respiratory Rate:</span>
                    <span className="vital-data">{selectedRecord.vitals.respiratoryRate} /min</span>
                  </div>
                )}
                {selectedRecord.vitals?.bloodGlucose && (
                  <div className="vital-item">
                    <span className="vital-name">Blood Glucose:</span>
                    <span className="vital-data">{selectedRecord.vitals.bloodGlucose} mg/dL</span>
                  </div>
                )}
                {selectedRecord.vitals?.weight && (
                  <div className="vital-item">
                    <span className="vital-name">Weight:</span>
                    <span className="vital-data">{selectedRecord.vitals.weight} kg</span>
                  </div>
                )}
                {selectedRecord.vitals?.height && (
                  <div className="vital-item">
                    <span className="vital-name">Height:</span>
                    <span className="vital-data">{selectedRecord.vitals.height} cm</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="notes-divider"></div>
            
            <div className="notes-section">
              <label>Clinical Notes</label>
              <div className="notes-content">
                {selectedRecord.notes ? (
                  <p>{selectedRecord.notes}</p>
                ) : (
                  <p className="no-notes">No notes provided for this record</p>
                )}
              </div>
            </div>
            
            {selectedRecord.symptoms && selectedRecord.symptoms.length > 0 && (
              <>
                <div className="notes-divider"></div>
                <div className="notes-section">
                  <label>Symptoms</label>
                  <div className="symptoms-list">
                    {selectedRecord.symptoms.map((symptom, idx) => (
                      <span key={idx} className="symptom-tag">{symptom}</span>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
          
          <div className="notes-modal-footer">
            <button className="close-notes-btn" onClick={() => setShowDetailsModal(false)}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="history-table-wrapper">
        <table className="history-table">
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Heart Rate</th>
              <th>Blood Pressure</th>
              <th>Temperature</th>
              <th>O₂ Sat</th>
              <th>Recorded By</th>
              <th>Status</th>
              <th>Notes</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {healthLogs.slice(0, 20).map(log => (
              <tr key={log._id} className={`status-row ${log.status || 'normal'}`}>
                <td className="date-cell">
                  <span className="date">{formatDate(log.createdAt)}</span>
                </td>
                <td className="vital-cell">
                  <span className="vital-value">{log.vitals?.heartRate || '--'}</span>
                  <span className="vital-unit">bpm</span>
                </td>
                <td className="vital-cell">
                  <span className="vital-value">
                    {log.vitals?.bloodPressure?.systolic || '--'}/{log.vitals?.bloodPressure?.diastolic || '--'}
                  </span>
                  <span className="vital-unit">mmHg</span>
                </td>
                <td className="vital-cell">
                  <span className="vital-value">{log.vitals?.temperature || '--'}</span>
                  <span className="vital-unit">°C</span>
                </td>
                <td className="vital-cell">
                  <span className="vital-value">{log.vitals?.oxygenSaturation || '--'}</span>
                  <span className="vital-unit">%</span>
                </td>
                <td className="doctor-cell">
                  <div className="doctor-info">
                    <Stethoscope size={14} />
                    <span>{getDoctorName(log.recordedBy)}</span>
                  </div>
                </td>
                <td className="status-cell">
                  {getStatusBadge(log.status)}
                </td>
                <td className="notes-cell" title={log.notes}>
                  {log.notes ? (log.notes.length > 30 ? log.notes.substring(0, 30) + '...' : log.notes) : '-'}
                </td>
                <td className="actions-cell">
                  <button 
                    className="view-notes-btn"
                    onClick={() => handleViewDetails(log)}
                    title="View full record details"
                  >
                    <Eye size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {healthLogs.length > 20 && (
          <div className="view-more">
            <button className="view-more-btn">
              View All {healthLogs.length} Records
            </button>
          </div>
        )}
      </div>
      
      <DetailsModal />
    </>
  );
};