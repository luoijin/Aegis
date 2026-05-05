// frontend/src/utils/confirmDialog.js
export const confirmDialog = (title, message, type = 'warning', confirmText = 'Confirm', cancelText = 'Cancel') => {
  return new Promise((resolve) => {
    const event = new CustomEvent('showConfirmModal', {
      detail: { title, message, type, confirmText, cancelText, resolve }
    });
    window.dispatchEvent(event);
  });
};

// Global notification helper
export const showNotification = (message, type = 'success') => {
  const event = new CustomEvent('showNotification', {
    detail: { message, type }
  });
  window.dispatchEvent(event);
};