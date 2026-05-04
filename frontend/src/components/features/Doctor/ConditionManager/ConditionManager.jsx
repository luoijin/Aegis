// frontend/src/components/features/Doctor/ConditionManager/ConditionManager.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Activity, CheckCircle, History, Eye, X } from 'lucide-react';
import api from '../../../../services/api';
import '../../../../styles/doctor-modal.css';
import './ConditionManager.css';

export const ConditionManager = ({ patient, onUpdate }) => {
  const [activeConditions, setActiveConditions] = useState([]);
  const [resolvedConditions, setResolvedConditions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showResolved, setShowResolved] = useState(false);
  const [updating, setUpdating] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [conditionOptions, setConditionOptions] = useState([]);

  const [formName, setFormName] = useState('');
  const [formSeverity, setFormSeverity] = useState('moderate');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const refreshPatientData = async () => {
    if (!patient?._id) return;
    setRefreshing(true);
    try {
      const response = await api.get(`/doctor/patients/${patient._id}`);
      const freshPatient = response.data;
      const active = freshPatient.conditions?.filter(c => c.isActive !== false) || [];
      const resolved = freshPatient.conditions?.filter(c => c.isActive === false) || [];
      setActiveConditions(active);
      setResolvedConditions(resolved);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error refreshing patient data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (patient?.conditions) {
      const active = patient.conditions.filter(c => c.isActive !== false);
      const resolved = patient.conditions.filter(c => c.isActive === false);
      setActiveConditions(active);
      setResolvedConditions(resolved);
    }
    fetchConditionOptions();
  }, [patient]);

  const fetchConditionOptions = async () => {
    try {
      const response = await api.get('/doctor/analytics/conditions');
      setConditionOptions(response.data);
    } catch (error) {
      console.error('Error fetching condition options:', error);
    }
  };

  const handleAddCondition = async () => {
    if (!formName) {
      setError('Please select a condition');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      await api.post(`/doctor/patients/${patient._id}/conditions`, {
        name: formName,
        severity: formSeverity,
        diagnosedDate: formDate
      });
      
      setFormName('');
      setFormSeverity('moderate');
      setFormDate(new Date().toISOString().split('T')[0]);
      setShowForm(false);
      await refreshPatientData();
    } catch (error) {
      console.error('Error adding condition:', error);
      setError(error.response?.data?.message || 'Failed to add condition');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateSeverity = async (conditionId, newSeverity) => {
    setUpdating(conditionId);
    try {
      await api.put(`/doctor/patients/${patient._id}/conditions/${conditionId}`, { severity: newSeverity });
      setActiveConditions(prev => prev.map(c => c._id === conditionId ? { ...c, severity: newSeverity } : c));
      setResolvedConditions(prev => prev.map(c => c._id === conditionId ? { ...c, severity: newSeverity } : c));
    } catch (error) {
      console.error('Error updating condition:', error);
      alert(error.response?.data?.message || 'Failed to update condition');
    } finally {
      setUpdating(null);
    }
  };

  const handleResolveCondition = async (conditionId) => {
    if (window.confirm('Mark this condition as resolved?')) {
      try {
        await api.put(`/doctor/patients/${patient._id}/conditions/${conditionId}`, { isActive: false });
        await refreshPatientData();
      } catch (error) {
        console.error('Error resolving condition:', error);
        alert(error.response?.data?.message || 'Failed to resolve condition');
      }
    }
  };

  const handleReactivateCondition = async (conditionId) => {
    if (window.confirm('Reactivate this condition?')) {
      try {
        await api.put(`/doctor/patients/${patient._id}/conditions/${conditionId}`, { isActive: true });
        await refreshPatientData();
      } catch (error) {
        console.error('Error reactivating condition:', error);
        alert(error.response?.data?.message || 'Failed to reactivate condition');
      }
    }
  };

  const getSeverityStyle = (severity) => {
    switch(severity) {
      case 'mild': return { bg: '#D1FAE5', color: '#065F46', text: 'Mild' };
      case 'moderate': return { bg: '#FEF3C7', color: '#92400E', text: 'Moderate' };
      case 'severe': return { bg: '#FEE2E2', color: '#991B1B', text: 'Severe' };
      default: return { bg: '#F1F5F9', color: '#475569', text: 'Unknown' };
    }
  };

  return (
    <div className="condition-manager-card">
      <div className="card-header">
        <div className="header-title">
          <Activity size={20} />
          <h3>Medical Conditions</h3>
          <span className="condition-count">{activeConditions.length}</span>
          {refreshing && <span className="refreshing-badge">Syncing...</span>}
        </div>
        <button className="add-icon-btn" onClick={() => setShowForm(true)}>
          <Plus size={18} />
        </button>
      </div>

      <div className="conditions-container">
        {/* Active Conditions */}
        <div className="conditions-section">
          <div className="section-title">Active Conditions</div>
          {activeConditions.length === 0 ? (
            <div className="empty-conditions">
              <Activity size={32} />
              <p>No active medical conditions</p>
            </div>
          ) : (
            <div className="conditions-list">
              {activeConditions.map(condition => {
                const style = getSeverityStyle(condition.severity);
                const isUpdating = updating === condition._id;
                return (
                  <div key={condition._id} className="condition-item">
                    <div className="condition-content">
                      <div className="condition-name">{condition.name}</div>
                      <div className="condition-meta">
                        {isUpdating ? (
                          <span className="updating-badge">Updating...</span>
                        ) : (
                          <>
                            <span className="diagnosed-date">
                              Diagnosed: {new Date(condition.diagnosedDate).toLocaleDateString()}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="condition-actions">
                      <select
                        className="severity-select"
                        value={condition.severity}
                        onChange={(e) => handleUpdateSeverity(condition._id, e.target.value)}
                        disabled={isUpdating}
                      >
                        <option value="mild">Mild</option>
                        <option value="moderate">Moderate</option>
                        <option value="severe">Severe</option>
                      </select>
                      <button className="resolve-btn" onClick={() => handleResolveCondition(condition._id)}>
                        <CheckCircle size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Resolved Conditions */}
        {resolvedConditions.length > 0 && (
          <div className="resolved-section">
            <button className="section-toggle" onClick={() => setShowResolved(!showResolved)}>
              <History size={16} />
              <span>Resolved Conditions ({resolvedConditions.length})</span>
              <span className="toggle-icon">{showResolved ? '▼' : '▶'}</span>
            </button>
            {showResolved && (
              <div className="resolved-list">
                {resolvedConditions.map(condition => {
                  const style = getSeverityStyle(condition.severity);
                  return (
                    <div key={condition._id} className="condition-item resolved">
                      <div className="condition-content">
                        <div className="condition-name">{condition.name}</div>
                        <div className="condition-meta">
                          <span className="severity-badge" style={{ background: style.bg, color: style.color }}>
                            {style.text}
                          </span>
                          <span className="diagnosed-date">Resolved</span>
                        </div>
                      </div>
                      <div className="condition-actions">
                        <button className="reactivate-btn" onClick={() => handleReactivateCondition(condition._id)}>
                          <Eye size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Condition Modal - Using doctor-modal CSS */}
      {showForm && (
        <div className="doctor-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="doctor-modal-container doctor-modal-md" onClick={(e) => e.stopPropagation()}>
            <div className="doctor-modal-header">
              <h3>Add Medical Condition</h3>
              <button className="doctor-close-btn" onClick={() => setShowForm(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="doctor-modal-form">
              {error && <div className="doctor-error-message">{error}</div>}
              
              <div className="doctor-form-group">
                <label>Condition <span className="doctor-required">*</span></label>
                <select
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                >
                  <option value="">Select condition</option>
                  {conditionOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="doctor-form-group">
                <label>Severity <span className="doctor-required">*</span></label>
                <div className="doctor-severity-options">
                  <button
                    type="button"
                    className={`doctor-severity-option ${formSeverity === 'mild' ? 'selected mild' : ''}`}
                    onClick={() => setFormSeverity('mild')}
                  >
                    Mild
                  </button>
                  <button
                    type="button"
                    className={`doctor-severity-option ${formSeverity === 'moderate' ? 'selected moderate' : ''}`}
                    onClick={() => setFormSeverity('moderate')}
                  >
                    Moderate
                  </button>
                  <button
                    type="button"
                    className={`doctor-severity-option ${formSeverity === 'severe' ? 'selected severe' : ''}`}
                    onClick={() => setFormSeverity('severe')}
                  >
                    Severe
                  </button>
                </div>
              </div>

              <div className="doctor-form-group">
                <label>Diagnosed Date</label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                />
              </div>

              <div className="doctor-modal-actions">
                <button type="button" className="doctor-cancel-btn" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="button" className="doctor-submit-btn" onClick={handleAddCondition} disabled={submitting}>
                  {submitting ? 'Adding...' : 'Add Condition'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};