import React, { useState, useEffect } from 'react';
import { MapPin, Building, Phone, Mail } from 'lucide-react';
import api from '../../../services/api';
import './HospitalSelector.css';

export const HospitalSelector = ({ value, onChange, className = '' }) => {
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHospitals();
  }, []);

  useEffect(() => {
    if (value && hospitals.length > 0) {
      const hospital = hospitals.find(h => h._id === value);
      setSelectedHospital(hospital);
    }
  }, [value, hospitals]);

  const fetchHospitals = async () => {
    setLoading(true);
    try {
      const response = await api.get('/hospitals');
      setHospitals(response.data);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (hospitalId) => {
    const hospital = hospitals.find(h => h._id === hospitalId);
    setSelectedHospital(hospital);
    onChange(hospitalId);
  };

  return (
    <div className={`hospital-selector ${className}`}>
      <select
        value={value || ''}
        onChange={(e) => handleSelect(e.target.value)}
        className="hospital-select"
        disabled={loading}
      >
        <option value="">Select Hospital</option>
        {hospitals.map(hospital => (
          <option key={hospital._id} value={hospital._id}>
            {hospital.name} - {hospital.address?.city || 'No city'}
          </option>
        ))}
      </select>
      
      {selectedHospital && (
        <div className="hospital-info">
          <div className="info-row">
            <Building size={14} />
            <span>{selectedHospital.name}</span>
          </div>
          {selectedHospital.address?.street && (
            <div className="info-row">
              <MapPin size={14} />
              <span>{selectedHospital.address.street}, {selectedHospital.address.city}</span>
            </div>
          )}
          {selectedHospital.phone && (
            <div className="info-row">
              <Phone size={14} />
              <span>{selectedHospital.phone}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};