// frontend/src/components/features/Doctor/ReferralSystem/ReferralSystem.jsx
import React, { useState, useEffect } from 'react';
import { Send, Share2, Users, AlertCircle, CheckCircle, XCircle, Clock, User, Stethoscope, Mail } from 'lucide-react';
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
  
  const [formData, setFormData] = useState({
    patientId: '',
    toDoctorId: '',
    reason: '',
    priority: 'normal',
    notes: ''
  });

  useEffect(() => {
    fetchAllData();
  }, []);

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
    } catch (error) {
      console.error('Error fetching referrals:', error);
    }
  };

  const fetchAvailableDoctors = async () => {
    try {
      const response = await api.get('/doctor/doctors');
      setAvailableDoctors(response.data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      
      setSuccess('Referral sent successfully!');
      setFormData({
        patientId: '',
        toDoctorId: '',
        reason: '',
        priority: 'normal',
        notes: ''
      });
      
      fetchReferrals();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error sending referral:', error);
      setError(error.response?.data?.message || 'Failed to send referral');
      setTimeout(() => setError(''), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRespond = async (referralId, status, responseNotes = '') => {
    setResponding(referralId);
    try {
      await api.put(`/doctor/referrals/${referralId}/respond`, { status, responseNotes });
      await fetchReferrals();
      await fetchAvailableDoctors();
    } catch (error) {
      console.error('Error responding to referral:', error);
      setError(error.response?.data?.message || 'Failed to respond to referral');
      setTimeout(() => setError(''), 3000);
    } finally {
      setResponding(null);
    }
  };

  const getPriorityClass = (priority) => {
    switch(priority) {
      case 'urgent': return 'priority-urgent';
      case 'high': return 'priority-high';
      default: return 'priority-normal';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'accepted': return <CheckCircle size={16} className="status-icon accepted" />;
      case 'denied': return <XCircle size={16} className="status-icon denied" />;
      default: return <Clock size={16} className="status-icon pending" />;
    }
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
    <div className="referral-system">
      <div className="referral-header">
        <h2><Share2 size={20} /> Referral System</h2>
        <p>Refer patients to other doctors and manage incoming referrals</p>
      </div>

      {error && (
        <div className="error-message global">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className="referral-grid">
        {/* Send Referral Form */}
        <div className="referral-card send-card">
          <div className="card-header">
            <Send size={18} />
            <h3>Send Referral</h3>
          </div>
          
          <form onSubmit={handleSubmit} className="referral-form">
            {success && (
              <div className="success-message">
                <CheckCircle size={14} />
                <span>{success}</span>
              </div>
            )}
            
            <div className="form-group">
              <label><Users size={14} /> Select Patient</label>
              <select
                name="patientId"
                value={formData.patientId}
                onChange={handleChange}
                required
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
              <label><Stethoscope size={14} /> Referring To</label>
              <select
                name="toDoctorId"
                value={formData.toDoctorId}
                onChange={handleChange}
                required
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
              {availableDoctors.length === 0 && (
                <small className="warning-text">No other active doctors found in the system.</small>
              )}
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
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Priority</label>
                <select name="priority" value={formData.priority} onChange={handleChange}>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label>Additional Notes (Optional)</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any additional information for the receiving doctor..."
                rows="2"
              />
            </div>
            
            <button type="submit" className="send-btn" disabled={submitting || availableDoctors.length === 0}>
              <Send size={16} />
              {submitting ? 'Sending...' : 'Send Referral'}
            </button>
          </form>
        </div>

        {/* Received Referrals */}
        <div className="referral-card received-card">
          <div className="card-header">
            <Share2 size={18} />
            <h3>Received Referrals</h3>
            <span className="badge">{receivedReferrals.length}</span>
          </div>
          
          <div className="referrals-list">
            {receivedReferrals.length === 0 ? (
              <div className="empty-state">
                <Share2 size={32} />
                <p>No pending referrals</p>
                <span>When other doctors refer patients to you, they will appear here</span>
              </div>
            ) : (
              receivedReferrals.map(ref => (
                <div key={ref._id} className="referral-item received">
                  <div className="referral-header-info">
                    <div className="referral-patient">
                      <strong>
                        {ref.patient?.user?.profile?.firstName} {ref.patient?.user?.profile?.lastName}
                      </strong>
                      <span className={`priority-badge ${getPriorityClass(ref.priority)}`}>
                        {ref.priority}
                      </span>
                    </div>
                    <div className="referral-status">
                      {getStatusIcon(ref.status)}
                      <span>{ref.status}</span>
                    </div>
                  </div>
                  <div className="referral-doctor-info">
                    <User size={12} />
                    <span>From: Dr. {ref.fromDoctor?.profile?.firstName} {ref.fromDoctor?.profile?.lastName}</span>
                    <Mail size={12} />
                    <span>{ref.fromDoctor?.email}</span>
                  </div>
                  <div className="referral-reason">
                    <p><strong>Reason:</strong> {ref.reason}</p>
                  </div>
                  {ref.notes && (
                    <div className="referral-notes">
                      <p><strong>Notes:</strong> {ref.notes}</p>
                    </div>
                  )}
                  <div className="referral-actions">
                    <button 
                      className="accept-btn" 
                      onClick={() => handleRespond(ref._id, 'accepted')}
                      disabled={responding === ref._id}
                    >
                      <CheckCircle size={14} />
                      Accept
                    </button>
                    <button 
                      className="deny-btn" 
                      onClick={() => handleRespond(ref._id, 'denied')}
                      disabled={responding === ref._id}
                    >
                      <XCircle size={14} />
                      Deny
                    </button>
                  </div>
                  <div className="referral-date">
                    Received: {new Date(ref.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sent Referrals */}
        <div className="referral-card sent-card">
          <div className="card-header">
            <Send size={18} />
            <h3>Sent Referrals</h3>
            <span className="badge">{sentReferrals.length}</span>
          </div>
          
          <div className="referrals-list">
            {sentReferrals.length === 0 ? (
              <div className="empty-state">
                <Send size={32} />
                <p>No sent referrals</p>
                <span>Referrals you send to other doctors will appear here</span>
              </div>
            ) : (
              sentReferrals.map(ref => (
                <div key={ref._id} className="referral-item sent">
                  <div className="referral-header-info">
                    <div className="referral-patient">
                      <strong>
                        {ref.patient?.user?.profile?.firstName} {ref.patient?.user?.profile?.lastName}
                      </strong>
                      <span className={`priority-badge ${getPriorityClass(ref.priority)}`}>
                        {ref.priority}
                      </span>
                    </div>
                    <div className="referral-status">
                      {getStatusIcon(ref.status)}
                      <span>{ref.status}</span>
                    </div>
                  </div>
                  <div className="referral-doctor-info">
                    <User size={12} />
                    <span>To: Dr. {ref.toDoctor?.profile?.firstName} {ref.toDoctor?.profile?.lastName}</span>
                    <Mail size={12} />
                    <span>{ref.toDoctor?.email}</span>
                  </div>
                  <div className="referral-reason">
                    <p><strong>Reason:</strong> {ref.reason}</p>
                  </div>
                  {ref.notes && (
                    <div className="referral-notes">
                      <p><strong>Notes:</strong> {ref.notes}</p>
                    </div>
                  )}
                  {ref.responseNotes && ref.status !== 'pending' && (
                    <div className="referral-response">
                      <p><strong>Response:</strong> {ref.responseNotes}</p>
                    </div>
                  )}
                  <div className="referral-date">
                    Sent: {new Date(ref.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralSystem;