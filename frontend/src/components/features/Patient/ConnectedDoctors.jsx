import React, { useState, useEffect } from 'react';
import { Stethoscope, Mail, Phone, UserPlus, X, Check } from 'lucide-react';
import api from '../../../utils/api';
import Button from '../../common/Button/Button';
import './ConnectedDoctors.css';

const ConnectedDoctors = ({ patientId, onRefresh }) => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [doctorEmail, setDoctorEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pendingRequests, setPendingRequests] = useState([]);

  useEffect(() => {
    fetchConnectedDoctors();
  }, [patientId]);

  const fetchConnectedDoctors = async () => {
    try {
      const response = await api.get(`/patients/${patientId}/doctors`);
      setDoctors(response.data.sharedWith || []);
      setPendingRequests(response.data.pendingRequests || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDoctor = async () => {
    if (!doctorEmail) {
      setError('Please enter doctor email');
      return;
    }

    setError('');
    setSuccess('');

    try {
      const response = await api.post(`/patients/${patientId}/share`, {
        doctorEmail
      });
      
      setSuccess(`Share request sent to ${doctorEmail}`);
      setDoctorEmail('');
      setShowAddDoctor(false);
      fetchConnectedDoctors();
      if (onRefresh) onRefresh();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to share data');
    }
  };

  const handleRemoveDoctor = async (doctorId) => {
    if (window.confirm('Are you sure you want to remove this doctor\'s access?')) {
      try {
        await api.delete(`/patients/${patientId}/doctors/${doctorId}`);
        setSuccess('Doctor access removed');
        fetchConnectedDoctors();
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        setError('Failed to remove doctor');
      }
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await api.post(`/patients/share-requests/${requestId}/accept`);
      fetchConnectedDoctors();
      setSuccess('Request accepted');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to accept request');
    }
  };

  const handleDeclineRequest = async (requestId) => {
    try {
      await api.post(`/patients/share-requests/${requestId}/decline`);
      fetchConnectedDoctors();
      setSuccess('Request declined');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to decline request');
    }
  };

  return (
    <div className="connected-doctors">
      <div className="section-header">
        <h3>Connected Healthcare Providers</h3>
        <Button variant="outline" size="sm" onClick={() => setShowAddDoctor(true)}>
          <UserPlus size={16} /> Share with Doctor
        </Button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {pendingRequests.length > 0 && (
        <div className="pending-requests">
          <h4>Pending Requests</h4>
          {pendingRequests.map(request => (
            <div key={request._id} className="doctor-card pending">
              <div className="doctor-avatar">{request.doctor?.profile?.firstName?.[0]}</div>
              <div className="doctor-info">
                <div className="doctor-name">Dr. {request.doctor?.profile?.firstName} {request.doctor?.profile?.lastName}</div>
                <div className="doctor-specialty">Requesting access to your health data</div>
              </div>
              <div className="request-actions">
                <button className="accept-btn" onClick={() => handleAcceptRequest(request._id)}>
                  <Check size={16} /> Accept
                </button>
                <button className="decline-btn" onClick={() => handleDeclineRequest(request._id)}>
                  <X size={16} /> Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="loading-doctors">Loading connected doctors...</div>
      ) : doctors.length === 0 ? (
        <div className="empty-doctors">
          <Stethoscope size={48} />
          <p>No healthcare providers connected yet</p>
          <p className="hint">Share your health data with doctors for better care</p>
        </div>
      ) : (
        <div className="doctors-list">
          {doctors.map(doctor => (
            <div key={doctor._id} className="doctor-card">
              <div className="doctor-avatar">
                {doctor.profile?.firstName?.[0]}{doctor.profile?.lastName?.[0]}
              </div>
              <div className="doctor-info">
                <div className="doctor-name">Dr. {doctor.profile?.firstName} {doctor.profile?.lastName}</div>
                <div className="doctor-email"><Mail size={12} /> {doctor.email}</div>
                {doctor.profile?.phone && (
                  <div className="doctor-phone"><Phone size={12} /> {doctor.profile.phone}</div>
                )}
              </div>
              <div className="doctor-status">
                <span className="status-badge connected">Connected</span>
                <button className="remove-btn" onClick={() => handleRemoveDoctor(doctor._id)}>
                  <X size={14} /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Doctor Modal */}
      {showAddDoctor && (
        <div className="modal-overlay" onClick={() => setShowAddDoctor(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Share Health Data with Doctor</h3>
              <button className="close-btn" onClick={() => setShowAddDoctor(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>Enter your doctor's email address to request access to your health records.</p>
              <input 
                type="email" 
                placeholder="doctor@hospital.com" 
                value={doctorEmail}
                onChange={(e) => setDoctorEmail(e.target.value)}
              />
              <div className="info-note">
                <p>The doctor will receive a request to access your health data.</p>
                <p>You'll be notified when they accept.</p>
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowAddDoctor(false)}>Cancel</button>
              <button onClick={handleAddDoctor}>Send Request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectedDoctors;