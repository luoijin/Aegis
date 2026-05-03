// frontend/src/components/common/SearchInput/SearchInput.jsx
import React from 'react';
import { Search, X } from 'lucide-react';
import './SearchInput.css';

export const SearchInput = ({ value, onChange, placeholder = "Search...", className = "" }) => {
  return (
    <div className={`search-input-container ${className}`}>
      <Search size={16} className="search-icon" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="search-input-field"
      />
      {value && (
        <button className="search-clear" onClick={() => onChange('')}>
          <X size={14} />
        </button>
      )}
    </div>
  );
};