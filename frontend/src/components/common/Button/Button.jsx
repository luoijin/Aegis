import React from 'react';
import './Button.css';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  fullWidth = false, 
  onClick, 
  type = 'button', 
  disabled = false 
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`btn btn-${variant} btn-${size} ${fullWidth ? 'btn-full' : ''} ${loading ? 'btn-loading' : ''}`}
    >
      {loading && <span className="btn-spinner"></span>}
      <span>{children}</span>
    </button>
  );
};

export default Button;