// frontend/src/components/common/ConfirmModal/ConfirmModal.jsx
import React from 'react';
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';
import './ConfirmModal.css';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  type = 'warning',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  loading = false
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <AlertCircle size={24} className="confirm-icon danger" />;
      case 'warning':
        return <AlertTriangle size={24} className="confirm-icon warning" />;
      case 'success':
        return <CheckCircle size={24} className="confirm-icon success" />;
      case 'info':
        return <Info size={24} className="confirm-icon info" />;
      default:
        return <AlertTriangle size={24} className="confirm-icon warning" />;
    }
  };

  const getButtonClass = () => {
    switch (type) {
      case 'danger':
        return 'confirm-btn danger';
      case 'warning':
        return 'confirm-btn warning';
      case 'success':
        return 'confirm-btn success';
      default:
        return 'confirm-btn primary';
    }
  };

  return (
    <div className="confirm-modal-overlay" onClick={onClose}>
      <div className="confirm-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="confirm-close-btn" onClick={onClose}>
          <X size={18} />
        </button>
        
        <div className="confirm-modal-body">
          <div className="confirm-icon-wrapper">
            {getIcon()}
          </div>
          <h3 className="confirm-title">{title}</h3>
          <p className="confirm-message">{message}</p>
        </div>
        
        <div className="confirm-modal-actions">
          {cancelText && (
            <button 
              className="confirm-btn cancel" 
              onClick={onClose}
              disabled={loading}
            >
              {cancelText}
            </button>
          )}
          <button 
            className={getButtonClass()} 
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;