import React, { useState, useEffect } from 'react';
import { 
  X, Heart, Activity, Thermometer, Droplet, Calendar, 
  Stethoscope, FileText, Mail, Phone, User, AlertCircle,
  Clock, CheckCircle, AlertTriangle
} from 'lucide-react';
import api from '../../../utils/api';
import Button from '../../common/Button/Button';
import './PatientDetailsModal.css';

const PatientDetailsModal = ({ patient, onClose, onRefresh }) => {
  const [healthLogs, setHealthLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showVitalsForm, setShowVitalsForm] = useState(false);
  const [vitals, setVitals] = useState({
    heartRate: '',
    systolicBP: '',
    diastolicBP: '',
    temperature: '',
    oxygenSaturation: '',
    notes: ''
  });

  useEffect(() => {
    if (patient && patient._id) {
      fetchHealthLogs();
    }
  }, [patient]);

  const fetchHealthLogs = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/health-logs?patientId=${patient._id}`);
      setHealthLogs(response.data);
    } catch (error) {
      console.error('Error fetching health logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordVitals = async (e) => {
    e.preventDefault();
    try {
      await api.post('/health-logs', {
        patient: patient._id,
        vitals: {
          heartRate: parseInt(vitals.heartRate),
          bloodPressure: {
            systolic: parseInt(vitals.systolicBP),
            diastolic: parseInt(vitals.diastolicBP)
          },
          temperature: vitals.temperature ? parseFloat(vitals.temperature) : null,
          oxygenSaturation: vitals.oxygenSaturation ? parseInt(vitals.oxygenSaturation) : null
        },
        notes: vitals.notes
      });
      
      setShowVitalsForm(false);
      setVitals({ heartRate: '', systolicBP: '', diastolicBP: '', temperature: '', oxygenSaturation: '', notes: '' });
      fetchHealthLogs();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error recording vitals:', error);
      alert('Failed to record vitals');
    }
  };

  const latestVitals = healthLogs[0]?.vitals || null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="patient-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            <User size={20} /> 
            Patient Details: {patient.user?.profile?.firstName} {patient.user?.profile?.lastName}
          </h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {/* Patient Information */}
          <div className="info-section">
            <h4><User size={16} /> Patient Information</h4>
            <div className="info-grid">
              <div><Mail size={14} /> {patient.user?.email}</div>
              <div><Phone size={14} /> {patient.user?.profile?.phone || 'Not provided'}</div>
              <div><Droplet size={14} /> Blood Type: {patient.bloodType || 'Not specified'}</div>
              <div><AlertCircle size={14} /> Allergies: {patient.allergies?.length > 0 ? patient.allergies.join(', ') : 'None'}</div>
            </div>
          </div>

          {/* Assigned Doctor */}
          {patient.assignedDoctor && (
            <div className="info-section">
              <h4><Stethoscope size={16} /> Primary Care Physician</h4>
              <div className="doctor-info">
                <div className="doctor-name">
                  Dr. {patient.assignedDoctor?.profile?.firstName} {patient.assignedDoctor?.profile?.lastName}
                </div>
                <div className="doctor-email">{patient.assignedDoctor?.email}</div>
              </div>
            </div>
          )}

          {/* Latest Vitals Summary */}
          <div className="info-section">
            <h4><Activity size={16} /> Latest Vitals</h4>
            {latestVitals ? (
              <div className="vitals-summary">
                <div className="vital-item">
                  <Heart size={20} />
                  <span>Heart Rate: {latestVitals.heartRate || '--'} bpm</span>
                </div>
                <div className="vital-item">
                  <Activity size={20} />
                  <span>BP: {latestVitals.bloodPressure?.systolic || '--'}/{latestVitals.bloodPressure?.diastolic || '--'} mmHg</span>
                </div>
                <div className="vital-item">
                  <Thermometer size={20} />
                  <span>Temperature: {latestVitals.temperature || '--'} °C</span>
                </div>
                <div className="vital-item">
                  <Droplet size={20} />
                  <span>O2: {latestVitals.oxygenSaturation || '--'}%</span>
                </div>
              </div>
            ) : (
              <p className="no-data">No vitals recorded yet</p>
            )}
          </div>

          {/* Actions */}
          <div className="action-buttons">
            <Button variant="primary" onClick={() => setShowVitalsForm(true)}>
              <Heart size={16} /> Record New Vitals
            </Button>
          </div>

          {/* Health History */}
          <div className="info-section">
            <h4><FileText size={16} /> Health History</h4>
            {loading ? (
              <p>Loading health records...</p>
            ) : healthLogs.length === 0 ? (
              <p className="no-data">No health records found</p>
            ) : (
              <div className="health-history">
                {healthLogs.map(log => (
                  <div key={log._id} className="history-item">
                    <div className="history-date">
                      <Calendar size={14} />
                      {new Date(log.createdAt).toLocaleDateString()}
                    </div>
                    <div className="history-doctor">
                      <Stethoscope size={14} />
                      Recorded by: Dr. {log.recordedBy?.profile?.firstName} {log.recordedBy?.profile?.lastName}
                    </div>
                    <div className="history-vitals">
                      <span><Heart size={12} /> {log.vitals?.heartRate || '--'} bpm</span>
                      <span><Activity size={12} /> {log.vitals?.bloodPressure?.systolic || '--'}/{log.vitals?.bloodPressure?.diastolic || '--'}</span>
                      <span><Thermometer size={12} /> {log.vitals?.temperature || '--'}°C</span>
                      <span><Droplet size={12} /> {log.vitals?.oxygenSaturation || '--'}%</span>
                    </div>
                    {log.notes && <div className="history-notes"><FileText size={12} /> {log.notes}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Record Vitals Modal */}
        {showVitalsForm && (
          <div className="submodal-overlay" onClick={() => setShowVitalsForm(false)}>
            <div className="submodal-content" onClick={(e) => e.stopPropagation()}>
              <div className="submodal-header">
                <h4><Heart size={18} /> Record Vitals for {patient.user?.profile?.firstName}</h4>
                <button onClick={() => setShowVitalsForm(false)}>×</button>
              </div>
              <form onSubmit={handleRecordVitals}>
                <div className="vitals-row">
                  <input type="number" placeholder="Heart Rate (bpm)" value={vitals.heartRate} onChange={(e) => setVitals({...vitals, heartRate: e.target.value})} required />
                  <input type="number" placeholder="Systolic BP" value={vitals.systolicBP} onChange={(e) => setVitals({...vitals, systolicBP: e.target.value})} required />
                  <input type="number" placeholder="Diastolic BP" value={vitals.diastolicBP} onChange={(e) => setVitals({...vitals, diastolicBP: e.target.value})} required />
                </div>
                <div className="vitals-row">
                  <input type="number" step="0.1" placeholder="Temperature (°C)" value={vitals.temperature} onChange={(e) => setVitals({...vitals, temperature: e.target.value})} />
                  <input type="number" placeholder="O2 Saturation (%)" value={vitals.oxygenSaturation} onChange={(e) => setVitals({...vitals, oxygenSaturation: e.target.value})} />
                </div>
                <textarea placeholder="Notes" value={vitals.notes} onChange={(e) => setVitals({...vitals, notes: e.target.value})} rows="3" />
                <div className="submodal-actions">
                  <button type="button" onClick={() => setShowVitalsForm(false)}>Cancel</button>
                  <button type="submit">Save Vitals</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDetailsModal;