import React, { useState, useEffect } from 'react';
import { Send, CheckCircle, XCircle, Clock, Users, Activity } from 'lucide-react';
import { SendReferralModal } from './SendReferralModal';
import { ReferralCard } from './ReferralCard';
import api from '../../../../services/api';
import './ReferralSystem.css';

export const ReferralSystem = ({ doctorId, patients }) => {
  const [referrals, setReferrals] = useState([]);
  const [showSendModal, setShowSendModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    fetchReferrals();
    fetchDoctors();
  }, []);

  const fetchReferrals = async () => {
    try {
      const [sentRes, receivedRes] = await Promise.all([
        api.get('/doctor/referrals/sent'),
        api.get('/doctor/referrals/received')
      ]);
      setReferrals({
        sent: sentRes.data,
        received: receivedRes.data
      });
    } catch (error) {
      console.error('Error fetching referrals:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await api.get('/doctor/doctors');
      const otherDoctors = response.data.filter(d => d._id !== doctorId);
      setDoctors(otherDoctors);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const handleSendReferral = async (referralData) => {
    try {
      await api.post('/doctor/referrals', referralData);
      setShowSendModal(false);
      fetchReferrals();
    } catch (error) {
      console.error('Error sending referral:', error);
      alert(error.response?.data?.message || 'Failed to send referral');
    }
  };

  const handleRespondToReferral = async (referralId, status) => {
    try {
      await api.put(`/doctor/referrals/${referralId}/respond`, { status });
      fetchReferrals();
    } catch (error) {
      console.error('Error responding to referral:', error);
      alert(error.response?.data?.message || 'Failed to respond');
    }
  };

  const getFilteredReferrals = () => {
    if (!referrals.received) return [];
    if (filter === 'all') return referrals.received;
    return referrals.received.filter(r => r.status === filter);
  };

  const stats = {
    pending: referrals.received?.filter(r => r.status === 'pending').length || 0,
    accepted: referrals.received?.filter(r => r.status === 'accepted').length || 0,
    denied: referrals.received?.filter(r => r.status === 'denied').length || 0,
    sent: referrals.sent?.length || 0
  };

  return (
    <div className="referral-system">
      {/* Header */}
      <div className="referral-header">
        <div>
          <h2>Referrals</h2>
          <p>Manage patient referrals and consultations</p>
        </div>
        <button className="send-btn" onClick={() => setShowSendModal(true)}>
          <Send size={18} />
          Send Referral
        </button>
      </div>

      {/* Stats Cards - Minimal, no colored borders */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon pending-icon">
            <Clock size={20} />
          </div>
          <div>
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon accepted-icon">
            <CheckCircle size={20} />
          </div>
          <div>
            <div className="stat-value">{stats.accepted}</div>
            <div className="stat-label">Accepted</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon denied-icon">
            <XCircle size={20} />
          </div>
          <div>
            <div className="stat-value">{stats.denied}</div>
            <div className="stat-label">Declined</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon sent-icon">
            <Send size={20} />
          </div>
          <div>
            <div className="stat-value">{stats.sent}</div>
            <div className="stat-label">Sent</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs - Minimal */}
      <div className="filter-tabs">
        <button className={`filter-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          All
        </button>
        <button className={`filter-tab ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>
          Pending
        </button>
        <button className={`filter-tab ${filter === 'accepted' ? 'active' : ''}`} onClick={() => setFilter('accepted')}>
          Accepted
        </button>
        <button className={`filter-tab ${filter === 'denied' ? 'active' : ''}`} onClick={() => setFilter('denied')}>
          Declined
        </button>
      </div>

      {/* Referrals List */}
      <div className="referrals-list">
        {loading ? (
          <div className="empty-state">Loading referrals...</div>
        ) : getFilteredReferrals().length === 0 ? (
          <div className="empty-state">
            <Users size={48} />
            <p>No referrals found</p>
            <span>When you receive referrals, they will appear here</span>
          </div>
        ) : (
          getFilteredReferrals().map(referral => (
            <ReferralCard
              key={referral._id}
              referral={referral}
              onRespond={handleRespondToReferral}
            />
          ))
        )}
      </div>

      {/* Send Referral Modal */}
      {showSendModal && (
        <SendReferralModal
          patients={patients}
          doctors={doctors}
          onClose={() => setShowSendModal(false)}
          onSend={handleSendReferral}
        />
      )}
    </div>
  );
};