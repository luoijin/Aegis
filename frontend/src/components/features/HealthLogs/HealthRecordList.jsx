import React, { useEffect, useState } from 'react';
import { Button } from '../../common/Button/Button';
import api from '../../../utils/api';
import HealthLogForm from './HealthLogForm';
import './HealthRecordList.css';

const HealthRecordList = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [healthLogs, setHealthLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await api.get('/patients');
      setPatients(response.data);
      if (response.data.length > 0) {
        setSelectedPatient(response.data[0]);
        fetchHealthLogs(response.data[0]._id);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHealthLogs = async (patientId) => {
    try {
      const response = await api.get(`/health-logs?patientId=${patientId}`);
      setHealthLogs(response.data);
    } catch (error) {
      console.error('Error fetching health logs:', error);
    }
  };

  const handlePatientChange = (patient) => {
    setSelectedPatient(patient);
    fetchHealthLogs(patient._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this health record?')) {
      try {
        await api.delete(`/health-logs/${id}`);
        fetchHealthLogs(selectedPatient._id);
      } catch (error) {
        console.error('Error deleting health record:', error);
      }
    }
  };

  const getVitalStatus = (value, normalRange) => {
    if (value >= normalRange.min && value <= normalRange.max) return 'normal';
    if (value < normalRange.min) return 'low';
    return 'high';
  };

  const getStatusColor = (status) => {
    const colors = {
      normal: 'var(--success)',
      low: 'var(--warning)',
      high: 'var(--danger)'
    };
    return colors[status] || 'var(--secondary)';
  };

  return (
    <div className="health-records-container">
      <div className="records-header">
        <h2>Health Records</h2>
        {selectedPatient && (
          <Button onClick={() => setShowForm(true)} variant="primary">
            + Record Vitals
          </Button>
        )}
      </div>

      <div className="patient-selector">
        <h3>Select Patient</h3>
        <div className="patient-tabs">
          {patients.map(patient => (
            <button
              key={patient._id}
              className={`patient-tab ${selectedPatient?._id === patient._id ? 'active' : ''}`}
              onClick={() => handlePatientChange(patient)}
            >
              {patient.user?.profile?.firstName} {patient.user?.profile?.lastName}
            </button>
          ))}
        </div>
      </div>

      {selectedPatient && (
        <>
          <div className="patient-summary">
            <div className="summary-card">
              <span className="summary-label">Blood Type</span>
              <span className="summary-value">{selectedPatient.bloodType || 'N/A'}</span>
            </div>
            <div className="summary-card">
              <span className="summary-label">Total Records</span>
              <span className="summary-value">{healthLogs.length}</span>
            </div>
            <div className="summary-card">
              <span className="summary-label">Last Checkup</span>
              <span className="summary-value">
                {healthLogs[0] ? new Date(healthLogs[0].createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>

          <div className="records-list">
            {healthLogs.length === 0 ? (
              <div className="empty-state">
                <p>No health records found</p>
                <Button onClick={() => setShowForm(true)} variant="primary">
                  Record First Vitals
                </Button>
              </div>
            ) : (
              healthLogs.map(log => (
                <div key={log._id} className="record-card fade-in">
                  <div className="record-header">
                    <div className="record-date">
                      {new Date(log.createdAt).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="record-actions">
                      <button 
                        className="icon-btn view"
                        onClick={() => setSelectedLog(log)}
                      >
                        👁️
                      </button>
                      <button 
                        className="icon-btn delete"
                        onClick={() => handleDelete(log._id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <div className="vitals-grid">
                    {log.vitals.heartRate && (
                      <div className="vital-card">
                        <span className="vital-icon">❤️</span>
                        <div>
                          <div className="vital-label">Heart Rate</div>
                          <div className="vital-value">{log.vitals.heartRate} bpm</div>
                        </div>
                      </div>
                    )}
                    {log.vitals.bloodPressure?.systolic && (
                      <div className="vital-card">
                        <span className="vital-icon">💓</span>
                        <div>
                          <div className="vital-label">Blood Pressure</div>
                          <div className="vital-value">
                            {log.vitals.bloodPressure.systolic}/{log.vitals.bloodPressure.diastolic}
                          </div>
                        </div>
                      </div>
                    )}
                    {log.vitals.temperature && (
                      <div className="vital-card">
                        <span className="vital-icon">🌡️</span>
                        <div>
                          <div className="vital-label">Temperature</div>
                          <div className="vital-value">{log.vitals.temperature}°C</div>
                        </div>
                      </div>
                    )}
                    {log.vitals.oxygenSaturation && (
                      <div className="vital-card">
                        <span className="vital-icon">🫁</span>
                        <div>
                          <div className="vital-label">Oxygen Saturation</div>
                          <div className="vital-value">{log.vitals.oxygenSaturation}%</div>
                        </div>
                      </div>
                    )}
                    {log.vitals.bloodGlucose && (
                      <div className="vital-card">
                        <span className="vital-icon">🩸</span>
                        <div>
                          <div className="vital-label">Blood Glucose</div>
                          <div className="vital-value">{log.vitals.bloodGlucose} mg/dL</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {log.symptoms?.length > 0 && (
                    <div className="symptoms-section">
                      <strong>Symptoms:</strong>
                      <div className="symptoms-tags">
                        {log.symptoms.map((symptom, idx) => (
                          <span key={idx} className="symptom-tag">{symptom}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {log.notes && (
                    <div className="notes-section">
                      <strong>Notes:</strong>
                      <p>{log.notes}</p>
                    </div>
                  )}

                  <div className={`record-status status-${log.status}`}>
                    Status: {log.status.toUpperCase()}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Modal for Health Log Form */}
      {showForm && selectedPatient && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <HealthLogForm
              patientId={selectedPatient._id}
              onSuccess={() => {
                setShowForm(false);
                fetchHealthLogs(selectedPatient._id);
              }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      {/* Modal for Viewing Details */}
      {selectedLog && (
        <div className="modal-overlay" onClick={() => setSelectedLog(null)}>
          <div className="modal-content details" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Health Record Details</h3>
              <button className="close-btn" onClick={() => setSelectedLog(null)}>×</button>
            </div>
            <div className="details-content">
              <p><strong>Date:</strong> {new Date(selectedLog.createdAt).toLocaleString()}</p>
              <p><strong>Recorded By:</strong> {selectedLog.recordedBy?.email || 'Doctor'}</p>
              <hr />
              <h4>Vital Signs</h4>
              {selectedLog.vitals.heartRate && <p>Heart Rate: {selectedLog.vitals.heartRate} bpm</p>}
              {selectedLog.vitals.bloodPressure?.systolic && (
                <p>Blood Pressure: {selectedLog.vitals.bloodPressure.systolic}/{selectedLog.vitals.bloodPressure.diastolic}</p>
              )}
              {selectedLog.vitals.temperature && <p>Temperature: {selectedLog.vitals.temperature}°C</p>}
              {selectedLog.vitals.respiratoryRate && <p>Respiratory Rate: {selectedLog.vitals.respiratoryRate} breaths/min</p>}
              {selectedLog.vitals.oxygenSaturation && <p>Oxygen Saturation: {selectedLog.vitals.oxygenSaturation}%</p>}
              {selectedLog.vitals.bloodGlucose && <p>Blood Glucose: {selectedLog.vitals.bloodGlucose} mg/dL</p>}
              {selectedLog.vitals.weight && <p>Weight: {selectedLog.vitals.weight} kg</p>}
              {selectedLog.vitals.height && <p>Height: {selectedLog.vitals.height} cm</p>}
              
              {selectedLog.symptoms?.length > 0 && (
                <>
                  <h4>Symptoms</h4>
                  <p>{selectedLog.symptoms.join(', ')}</p>
                </>
              )}
              
              {selectedLog.medications?.length > 0 && (
                <>
                  <h4>Medications</h4>
                  {selectedLog.medications.map((med, idx) => (
                    <p key={idx}>{med.name} - {med.dosage} ({med.time})</p>
                  ))}
                </>
              )}
              
              {selectedLog.notes && (
                <>
                  <h4>Notes</h4>
                  <p>{selectedLog.notes}</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthRecordList;