// frontend/src/components/features/Doctor/ReferralSystem/ReferralSystem.jsx

import React, { useState, useEffect } from 'react';
import { Send, Share2, Users, AlertCircle, CheckCircle, XCircle, Clock, User, Stethoscope, Mail, Calendar, Eye, WifiOff } from 'lucide-react';
import { confirmDialog } from '../../../../utils/confirmDialog';
import api from '../../../../services/api';
import './ReferralSystem.css';

const ReferralSystem = ({ doctorId, patients }) => {
  const [sentReferrals, setSentReferrals] = useState([]);
  const [receivedReferrals, setReceivedReferrals] = useState([]);
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [responding, setResponding] = useState(null);
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const [formData, setFormData] = useState({
    patientId: '',
    toDoctorId: '',
    reason: '',
    priority: 'normal',
    notes: ''
  });

  useEffect(() => {
    fetchAllData();

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const showSuccess = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 3000);
  };

  const showError = (message) => {
    setError(message);
    setTimeout(() => setError(''), 3000);
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchReferrals(),
        fetchAvailableDoctors()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReferrals = async () => {
    try {
      const [sentRes, receivedRes] = await Promise.all([
        api.get('/doctor/referrals/sent'),
        api.get('/doctor/referrals/received')
      ]);
      setSentReferrals(sentRes.data);
      setReceivedReferrals(receivedRes.data);
      // Cache referrals
      localStorage.setItem('cachedSentReferrals', JSON.stringify(sentRes.data));
      localStorage.setItem('cachedReceivedReferrals', JSON.stringify(receivedRes.data));
    } catch (error) {
      console.error('Error fetching referrals:', error);
      // Offline fallback
      const cachedSent = localStorage.getItem('cachedSentReferrals');
      const cachedReceived = localStorage.getItem('cachedReceivedReferrals');
      if (cachedSent) setSentReferrals(JSON.parse(cachedSent));
      if (cachedReceived) setReceivedReferrals(JSON.parse(cachedReceived));
      if (!cachedSent && !cachedReceived) showError('Failed to load referrals');
    }
  };

  const fetchAvailableDoctors = async () => {
    try {
      const response = await api.get('/doctor/doctors');
      setAvailableDoctors(response.data);
      localStorage.setItem('cachedDoctors', JSON.stringify(response.data));
    } catch (error) {
      console.error('Error fetching doctors:', error);
      const cached = localStorage.getItem('cachedDoctors');
      if (cached) setAvailableDoctors(JSON.parse(cached));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isOffline) {
      showError('You are offline. Cannot send referral.');
      return;
    }
    setSubmitting(true);
    setError('');
    setSuccess('');

    if (!formData.patientId) {
      setError('Please select a patient');
      setSubmitting(false);
      return;
    }
    if (!formData.toDoctorId) {
      setError('Please select a doctor');
      setSubmitting(false);
      return;
    }
    if (!formData.reason.trim()) {
      setError('Please provide a reason for referral');
      setSubmitting(false);
      return;
    }

    try {
      await api.post('/doctor/referrals', {
        patientId: formData.patientId,
        toDoctorId: formData.toDoctorId,
        reason: formData.reason,
        priority: formData.priority,
        notes: formData.notes
      });
      
      setFormData({
        patientId: '',
        toDoctorId: '',
        reason: '',
        priority: 'normal',
        notes: ''
      });
      
      showSuccess('Referral sent successfully!');
      await fetchReferrals();
    } catch (error) {
      console.error('Error sending referral:', error);
      setError(error.response?.data?.message || 'Failed to send referral');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRespond = async (referralId, status, actionName) => {
    if (isOffline) {
      showError('You are offline. Cannot respond to referral.');
      return;
    }
    const confirmed = await confirmDialog(
      `${actionName} Referral`,
      `Are you sure you want to ${actionName.toLowerCase()} this referral?`,
      status === 'denied' ? 'danger' : 'warning',
      `Yes, ${actionName}`,
      'Cancel'
    );
    
    if (confirmed) {
      setResponding(referralId);
      try {
        await api.put(`/doctor/referrals/${referralId}/respond`, { status });
        showSuccess(`Referral ${actionName.toLowerCase()} successfully!`);
        await fetchReferrals();
      } catch (error) {
        console.error('Error responding to referral:', error);
        setError(error.response?.data?.message || `Failed to ${actionName.toLowerCase()} referral`);
      } finally {
        setResponding(null);
      }
    }
  };

  const handleViewDetails = (referral) => {
    setSelectedReferral(referral);
    setShowDetailsModal(true);
  };

  const getPriorityClass = (priority) => {
    switch(priority) {
      case 'urgent': return 'priority-urgent';
      case 'high': return 'priority-high';
      default: return 'priority-normal';
    }
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'accepted': return 'status-accepted';
      case 'denied': return 'status-denied';
      default: return 'status-pending';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'accepted': return <CheckCircle size={14} />;
      case 'denied': return <XCircle size={14} />;
      default: return <Clock size={14} />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="referral-loading">
        <div className="loading-spinner"></div>
        <p>Loading referrals...</p>
      </div>
    );
  }

  return (
    <>
      <div className="referral-system">
        {/* Offline banner */}
        {isOffline && (
          <div className="offline-banner">
            <WifiOff size={16} />
            <span>You are offline. Referrals are read‑only.</span>
          </div>
        )}

        {error && (
          <div className="error-message global">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="success-message global">
            <CheckCircle size={16} />
            <span>{success}</span>
          </div>
        )}

        <div className="referral-header">
          <h2><Share2 size={20} /> Referral System</h2>
          <p>Refer patients to other doctors and manage incoming referrals</p>
        </div>

        <div className="referral-layout">
          {/* Send Referral Form */}
          <div className="referral-form-card">
            <div className="card-header">
              <Send size={18} />
              <h3>Send Referral</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="referral-form">
              <div className="form-group">
                <label><Users size={14} /> Select Patient *</label>
                <select
                  name="patientId"
                  value={formData.patientId}
                  onChange={handleChange}
                  required
                  disabled={isOffline}
                >
                  <option value="">Select a patient</option>
                  {patients?.filter(p => p.assignedDoctor?._id === doctorId || p.assignedDoctor === doctorId).map(patient => {
                    const firstName = patient.user?.profile?.firstName || '';
                    const lastName = patient.user?.profile?.lastName || '';
                    const fullName = `${firstName} ${lastName}`.trim() || 'Unknown Patient';
                    return (
                      <option key={patient._id} value={patient._id}>
                        {fullName} - {patient.bloodType || 'No blood type'}
                      </option>
                    );
                  })}
                </select>
              </div>
              
              <div className="form-group">
                <label><Stethoscope size={14} /> Refer To *</label>
                <select
                  name="toDoctorId"
                  value={formData.toDoctorId}
                  onChange={handleChange}
                  required
                  disabled={isOffline}
                >
                  <option value="">Select a doctor</option>
                  {availableDoctors.length === 0 ? (
                    <option disabled>No other doctors available</option>
                  ) : (
                    availableDoctors.map(doctor => (
                      <option key={doctor._id} value={doctor._id}>
                        Dr. {doctor.profile?.firstName} {doctor.profile?.lastName} - {doctor.specialization || 'General'}
                      </option>
                    ))
                  )}
                </select>
              </div>
              
              <div className="form-group">
                <label>Reason for Referral *</label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  placeholder="Explain why you are referring this patient..."
                  rows="3"
                  required
                  disabled={isOffline}
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Priority</label>
                  <select name="priority" value={formData.priority} onChange={handleChange} disabled={isOffline}>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Additional Notes (Optional)</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Additional notes..."
                    rows="3"
                    disabled={isOffline}
                  />
                </div>
              </div>
            
              <button type="submit" className="send-btn" disabled={submitting || availableDoctors.length === 0 || isOffline}>
                <Send size={16} />
                {submitting ? 'Sending...' : 'Send Referral'}
              </button>
            </form>
          </div>

          {/* Received Referrals Table */}
          <div className="referrals-table-card">
            <div className="card-header">
              <Share2 size={18} />
              <h3>Received Referrals</h3>
              <span className="badge">{receivedReferrals.length}</span>
            </div>
            
            <div className="table-wrapper">
              {receivedReferrals.length === 0 ? (
                <div className="empty-state">
                  <Share2 size={32} />
                  <p>No pending referrals</p>
                  <span>When other doctors refer patients to you, they will appear here</span>
                </div>
              ) : (
                <table className="referrals-table">
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>From Doctor</th>
                      <th>Reason</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receivedReferrals.map(ref => (
                      <tr key={ref._id}>
                        <td data-label="Patient">
                          <div className="patient-name">
                            {ref.patient?.user?.profile?.firstName} {ref.patient?.user?.profile?.lastName}
                          </div>
                          <div className="patient-detail">
                            {ref.patient?.bloodType ? `Blood Type: ${ref.patient.bloodType}` : 'Blood type not specified'}
                          </div>
                        </td>
                        <td data-label="From Doctor">
                          <div className="doctor-name">
                            Dr. {ref.fromDoctor?.profile?.firstName} {ref.fromDoctor?.profile?.lastName}
                          </div>
                          <div className="doctor-detail">{ref.fromDoctor?.email}</div>
                        </td>
                        <td data-label="Reason" className="reason-cell" title={ref.reason}>
                          {ref.reason.length > 50 ? ref.reason.substring(0, 50) + '...' : ref.reason}
                        </td>
                        <td data-label="Priority">
                          <span className={`priority-badge ${getPriorityClass(ref.priority)}`}>
                            {ref.priority}
                          </span>
                        </td>
                        <td data-label="Status">
                          <div className={`status-badge ${getStatusClass(ref.status)}`}>
                            {getStatusIcon(ref.status)}
                            <span>{ref.status}</span>
                          </div>
                        </td>
                        <td data-label="Date" className="date-cell">
                          {formatDate(ref.createdAt)}
                        </td>
                        <td data-label="Actions" className="actions-cell">
                          <button 
                            className="action-btn accept" 
                            onClick={() => handleRespond(ref._id, 'accepted', 'Accept')}
                            disabled={responding === ref._id || isOffline}
                            title="Accept"
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button 
                            className="action-btn deny" 
                            onClick={() => handleRespond(ref._id, 'denied', 'Deny')}
                            disabled={responding === ref._id || isOffline}
                            title="Deny"
                          >
                            <XCircle size={16} />
                          </button>
                          <button 
                            className="action-btn view" 
                            onClick={() => handleViewDetails(ref)}
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Sent Referrals Table */}
          <div className="referrals-table-card">
            <div className="card-header">
              <Send size={18} />
              <h3>Sent Referrals</h3>
              <span className="badge">{sentReferrals.length}</span>
            </div>
            
            <div className="table-wrapper">
              {sentReferrals.length === 0 ? (
                <div className="empty-state">
                  <Send size={32} />
                  <p>No sent referrals</p>
                  <span>Referrals you send to other doctors will appear here</span>
                </div>
              ) : (
                <table className="referrals-table">
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>To Doctor</th>
                      <th>Reason</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sentReferrals.map(ref => (
                      <tr key={ref._id}>
                        <td data-label="Patient">
                          <div className="patient-name">
                            {ref.patient?.user?.profile?.firstName} {ref.patient?.user?.profile?.lastName}
                          </div>
                        </td>
                        <td data-label="To Doctor">
                          <div className="doctor-name">
                            Dr. {ref.toDoctor?.profile?.firstName} {ref.toDoctor?.profile?.lastName}
                          </div>
                          <div className="doctor-detail">{ref.toDoctor?.email}</div>
                        </td>
                        <td data-label="Reason" className="reason-cell" title={ref.reason}>
                          {ref.reason.length > 50 ? ref.reason.substring(0, 50) + '...' : ref.reason}
                        </td>
                        <td data-label="Priority">
                          <span className={`priority-badge ${getPriorityClass(ref.priority)}`}>
                            {ref.priority}
                          </span>
                        </td>
                        <td data-label="Status">
                          <div className={`status-badge ${getStatusClass(ref.status)}`}>
                            {getStatusIcon(ref.status)}
                            <span>{ref.status}</span>
                          </div>
                        </td>
                        <td data-label="Date" className="date-cell">
                          {formatDate(ref.createdAt)}
                        </td>
                        <td data-label="Actions" className="actions-cell">
                          <button 
                            className="action-btn view" 
                            onClick={() => handleViewDetails(ref)}
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedReferral && (
        <div className="referral-modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="referral-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><Share2 size={18} /> Referral Details</h3>
              <button className="close-btn" onClick={() => setShowDetailsModal(false)}>
                <XCircle size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <span className="detail-label">Patient:</span>
                <span className="detail-value">
                  {selectedReferral.patient?.user?.profile?.firstName} {selectedReferral.patient?.user?.profile?.lastName}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">From Doctor:</span>
                <span className="detail-value">
                  Dr. {selectedReferral.fromDoctor?.profile?.firstName} {selectedReferral.fromDoctor?.profile?.lastName}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">To Doctor:</span>
                <span className="detail-value">
                  Dr. {selectedReferral.toDoctor?.profile?.firstName} {selectedReferral.toDoctor?.profile?.lastName}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Priority:</span>
                <span className={`priority-badge ${getPriorityClass(selectedReferral.priority)}`}>
                  {selectedReferral.priority}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status:</span>
                <div className={`status-badge ${getStatusClass(selectedReferral.status)}`}>
                  {getStatusIcon(selectedReferral.status)}
                  <span>{selectedReferral.status}</span>
                </div>
              </div>
              <div className="detail-row">
                <span className="detail-label">Date:</span>
                <span className="detail-value">{formatDate(selectedReferral.createdAt)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Reason:</span>
                <span className="detail-value reason-text">{selectedReferral.reason}</span>
              </div>
              {selectedReferral.notes && (
                <div className="detail-row">
                  <span className="detail-label">Notes:</span>
                  <span className="detail-value notes-text">{selectedReferral.notes}</span>
                </div>
              )}
              {selectedReferral.responseNotes && (
                <div className="detail-row">
                  <span className="detail-label">Response:</span>
                  <span className="detail-value response-text">{selectedReferral.responseNotes}</span>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="close-modal-btn" onClick={() => setShowDetailsModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReferralSystem;