// frontend/src/components/features/Patient/PatientVitals/PatientVitals.jsx
import React from 'react';
import { Heart, Activity, Thermometer, Droplet } from 'lucide-react';
import './PatientVitals.css';

export const PatientVitals = ({ latestVitals }) => {
  const vitals = [
    {
      icon: <Heart size={22} />,
      label: 'Heart Rate',
      value: latestVitals?.heartRate || '--',
      unit: 'bpm',
      color: '#3B82F6'
    },
    {
      icon: <Activity size={22} />,
      label: 'Blood Pressure',
      value: latestVitals?.bloodPressure 
        ? `${latestVitals.bloodPressure.systolic}/${latestVitals.bloodPressure.diastolic}`
        : '--/--',
      unit: 'mmHg',
      color: '#3B82F6'
    },
    {
      icon: <Thermometer size={22} />,
      label: 'Temperature',
      value: latestVitals?.temperature || '--',
      unit: '°C',
      color: '#3B82F6'
    },
    {
      icon: <Droplet size={22} />,
      label: 'O₂ Saturation',
      value: latestVitals?.oxygenSaturation || '--',
      unit: '%',
      color: '#3B82F6'
    }
  ];

  return (
    <div className="patient-vitals-card">
      <h3>Latest Vitals</h3>
      <div className="vitals-grid">
        {vitals.map((vital, index) => (
          <div key={index} className="vital-item">
            <div className="vital-icon" style={{ backgroundColor: `${vital.color}15`, color: vital.color }}>
              {vital.icon}
            </div>
            <div className="vital-details">
              <span className="vital-label">{vital.label}</span>
              <span className="vital-value">{vital.value} <span>{vital.unit}</span></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};