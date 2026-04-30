import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Activity, AlertCircle, CheckCircle, History, Eye } from 'lucide-react';
import api from '../../../../services/api';
import './ConditionManager.css';

export const ConditionManager = ({ patient, onUpdate }) => {
  const [activeConditions, setActiveConditions] = useState([]);
  const [resolvedConditions, setResolvedConditions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showResolved, setShowResolved] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [conditionOptions, setConditionOptions] = useState([]);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    severity: 'moderate',
    diagnosedDate: new Date().toISOString().split('T')[0]
  });

  // Fetch fresh patient data directly
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
      setError('Failed to load condition options');
    }
  };

  const handleAddCondition = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      await api.post(`/doctor/patients/${patient._id}/conditions`, formData);
      setShowForm(false);
      setFormData({
        name: '',
        severity: 'moderate',
        diagnosedDate: new Date().toISOString().split('T')[0]
      });
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
      setActiveConditions(prev => prev.map(c => 
        c._id === conditionId ? { ...c, severity: newSeverity } : c
      ));
      setResolvedConditions(prev => prev.map(c => 
        c._id === conditionId ? { ...c, severity: newSeverity } : c
      ));
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
      case 'mild': 
        return { bg: '#D1FAE5', color: '#065F46', text: 'Mild', border: '#10B981' };
      case 'moderate': 
        return { bg: '#FEF3C7', color: '#92400E', text: 'Moderate', border: '#F59E0B' };
      case 'severe': 
        return { bg: '#FEE2E2', color: '#991B1B', text: 'Severe', border: '#EF4444' };
      default: 
        return { bg: '#F1F5F9', color: '#475569', text: 'Unknown', border: '#94A3B8' };
    }
  };

  // Modal component using Portal
  const AddConditionModal = () => {
    if (!showForm) return null;
    
    return createPortal(
      <div className="modal-overlay" onClick={() => setShowForm(false)}>
        <div className="condition-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>Add Medical Condition</h3>
            <button className="close-btn" onClick={() => setShowForm(false)}>×</button>
          </div>
          <form onSubmit={handleAddCondition}>
            {error && <div className="error-message">{error}</div>}
            
            <div className="form-group">
              <label>Condition *</label>
              <select
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              >
                <option value="">Select condition</option>
                {conditionOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Severity *</label>
              <div className="severity-options">
                <label className={`severity-option ${formData.severity === 'mild' ? 'selected mild' : ''}`}>
                  <input
                    type="radio"
                    name="severity"
                    value="mild"
                    checked={formData.severity === 'mild'}
                    onChange={(e) => setFormData({...formData, severity: e.target.value})}
                  />
                  <span>Mild</span>
                </label>
                <label className={`severity-option ${formData.severity === 'moderate' ? 'selected moderate' : ''}`}>
                  <input
                    type="radio"
                    name="severity"
                    value="moderate"
                    checked={formData.severity === 'moderate'}
                    onChange={(e) => setFormData({...formData, severity: e.target.value})}
                  />
                  <span>Moderate</span>
                </label>
                <label className={`severity-option ${formData.severity === 'severe' ? 'selected severe' : ''}`}>
                  <input
                    type="radio"
                    name="severity"
                    value="severe"
                    checked={formData.severity === 'severe'}
                    onChange={(e) => setFormData({...formData, severity: e.target.value})}
                  />
                  <span>Severe</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>Diagnosed Date</label>
              <input
                type="date"
                value={formData.diagnosedDate}
                onChange={(e) => setFormData({...formData, diagnosedDate: e.target.value})}
              />
            </div>

            <div className="modal-actions">
              <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>
                Cancel
              </button>
              <button type="submit" className="submit-btn" disabled={submitting}>
                {submitting ? 'Adding...' : 'Add Condition'}
              </button>
            </div>
          </form>
        </div>
      </div>,
      document.body
    );
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
        <button className="add-btn" onClick={() => setShowForm(true)}>
          <Plus size={16} /> Add Condition
        </button>
      </div>

      <div className="conditions-container">
        {/* Active Conditions */}
        <div className="conditions-section">
          <div className="section-title">
            <span>Active Conditions</span>
          </div>
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
                  <div key={condition._id} className="condition-item active">
                    <div className="condition-content">
                      <div className="condition-name">{condition.name}</div>
                      <div className="condition-meta">
                        {isUpdating ? (
                          <span className="updating-badge">Updating...</span>
                        ) : (
                          <>
                            <span 
                              className="severity-badge"
                              style={{ background: style.bg, color: style.color }}
                            >
                              {style.text}
                            </span>
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
                        style={{ borderColor: style.border }}
                        disabled={isUpdating}
                      >
                        <option value="mild">Mild</option>
                        <option value="moderate">Moderate</option>
                        <option value="severe">Severe</option>
                      </select>
                      <button 
                        className="resolve-btn"
                        onClick={() => handleResolveCondition(condition._id)}
                        title="Mark as resolved"
                      >
                        <CheckCircle size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Resolved/Inactive Conditions */}
        {resolvedConditions.length > 0 && (
          <div className="conditions-section resolved-section">
            <button 
              className="section-toggle"
              onClick={() => setShowResolved(!showResolved)}
            >
              <History size={16} />
              <span>Resolved Conditions ({resolvedConditions.length})</span>
              <span className="toggle-icon">{showResolved ? '▼' : '▶'}</span>
            </button>
            
            {showResolved && (
              <div className="conditions-list resolved-list">
                {resolvedConditions.map(condition => {
                  const style = getSeverityStyle(condition.severity);
                  return (
                    <div key={condition._id} className="condition-item resolved">
                      <div className="condition-content">
                        <div className="condition-name">{condition.name}</div>
                        <div className="condition-meta">
                          <span 
                            className="severity-badge"
                            style={{ background: style.bg, color: style.color }}
                          >
                            {style.text}
                          </span>
                          <span className="diagnosed-date">
                            Resolved
                          </span>
                        </div>
                      </div>
                      <div className="condition-actions">
                        <button 
                          className="reactivate-btn"
                          onClick={() => handleReactivateCondition(condition._id)}
                          title="Reactivate condition"
                        >
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

      {/* Modal rendered via Portal */}
      <AddConditionModal />
    </div>
  );
};