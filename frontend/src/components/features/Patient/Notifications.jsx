import React, { useState, useEffect } from 'react';
import { Bell, Check, X, AlertCircle, Heart } from 'lucide-react';
import api from '../../../utils/api';
import './Notifications.css';

const Notifications = ({ patientId, onNotificationAction }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [pendingRequest, setPendingRequest] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, [patientId]);

  const fetchNotifications = async () => {
    try {
      const response = await api.get(`/patients/${patientId}/notifications`);
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unreadCount);
      if (response.data.pendingDoctorChange?.status === 'pending') {
        setPendingRequest(response.data.pendingDoctorChange);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleApprove = async (notification) => {
    try {
      await api.post(`/patients/${patientId}/approve-doctor-change`);
      await fetchNotifications();
      if (onNotificationAction) onNotificationAction();
      alert('Doctor changed successfully!');
    } catch (error) {
      console.error('Error approving:', error);
    }
  };

  const handleReject = async (notification) => {
    try {
      await api.post(`/patients/${patientId}/reject-doctor-change`);
      await fetchNotifications();
      if (onNotificationAction) onNotificationAction();
    } catch (error) {
      console.error('Error rejecting:', error);
    }
  };

  const handleMarkRead = async (notificationId) => {
    try {
      await api.patch(`/patients/${patientId}/notifications/${notificationId}/read`);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking read:', error);
    }
  };

  return (
    <div className="notifications-container">
      <button className="notification-bell" onClick={() => setShowDropdown(!showDropdown)}>
        <Bell size={20} />
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </button>

      {showDropdown && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h4>Notifications</h4>
            {notifications.length === 0 && <p className="no-notifications">No notifications</p>}
          </div>
          <div className="notification-list">
            {notifications.map(notif => (
              <div key={notif._id} className={`notification-item ${!notif.isRead ? 'unread' : ''}`}>
                <div className="notification-icon">
                  {notif.type === 'doctor_change_request' && <Bell size={16} />}
                  {notif.type === 'doctor_change_approved' && <Check size={16} />}
                  {notif.type === 'vital_recorded' && <Heart size={16} />}
                </div>
                <div className="notification-content">
                  <p>{notif.message}</p>
                  <span className="notification-time">
                    {new Date(notif.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {notif.type === 'doctor_change_request' && (
                  <div className="notification-actions">
                    <button className="approve-btn" onClick={() => handleApprove(notif)}>
                      <Check size={14} /> Approve
                    </button>
                    <button className="reject-btn" onClick={() => handleReject(notif)}>
                      <X size={14} /> Decline
                    </button>
                  </div>
                )}
                {!notif.isRead && notif.type !== 'doctor_change_request' && (
                  <button className="mark-read-btn" onClick={() => handleMarkRead(notif._id)}>
                    Mark read
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;