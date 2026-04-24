import React from 'react';
import './Input.css';

const Input = ({ 
  label, 
  type = "text", 
  placeholder, 
  value, 
  onChange, 
  error, 
  icon,
  name,
  required = false 
}) => {
  return (
    <div className="input-group">
      {label && (
        <label htmlFor={name} className="input-label">
          {label} {required && <span className="required">*</span>}
        </label>
      )}
      <div className="input-wrapper">
        {icon && <span className="input-icon">{icon}</span>}
        <input
          type={type}
          id={name}
          name={name}
          className={`input-field ${error ? 'input-error' : ''}`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
        />
      </div>
      {error && <span className="error-text">{error}</span>}
    </div>
  );
};

export default Input;