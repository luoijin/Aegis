// frontend/src/components/common/ConfirmModal/ConfirmProvider.jsx
import React, { useState, useEffect } from 'react';
import ConfirmModal from './ConfirmModal';
import { NotificationToast } from '../NotificationToast/NotificationToast';

export const ConfirmProvider = ({ children }) => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    onConfirm: null,
    resolve: null
  });

  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const handleShowConfirm = (event) => {
      const { title, message, type, confirmText, cancelText, resolve } = event.detail;
      setModalState({
        isOpen: true,
        title,
        message,
        type,
        confirmText,
        cancelText,
        resolve,
        onConfirm: () => {
          resolve(true);
          setModalState(prev => ({ ...prev, isOpen: false }));
        }
      });
    };

    const handleShowNotification = (event) => {
      const { message, type } = event.detail;
      setNotification({ message, type });
      setTimeout(() => setNotification(null), 3000);
    };

    window.addEventListener('showConfirmModal', handleShowConfirm);
    window.addEventListener('showNotification', handleShowNotification);
    return () => {
      window.removeEventListener('showConfirmModal', handleShowConfirm);
      window.removeEventListener('showNotification', handleShowNotification);
    };
  }, []);

  const handleClose = () => {
    if (modalState.resolve) {
      modalState.resolve(false);
    }
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <>
      {children}
      <ConfirmModal
        isOpen={modalState.isOpen}
        onClose={handleClose}
        onConfirm={modalState.onConfirm || handleClose}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
      />
      {notification && (
        <NotificationToast
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </>
  );
};