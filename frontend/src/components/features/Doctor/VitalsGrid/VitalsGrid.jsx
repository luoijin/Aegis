import React from 'react';
import { VitalCard } from './VitalCard';
import { Heart, Activity, Thermometer, Droplet } from 'lucide-react';
import './VitalsGrid.css';

export const VitalsGrid = ({ latestVitals }) => {
  const vitals = [
    {
      icon: <Heart size={24} />,
      label: 'Heart Rate',
      value: latestVitals?.heartRate || '--',
      unit: 'bpm'
    },
    {
      icon: <Activity size={24} />,
      label: 'Blood Pressure',
      value: latestVitals?.bloodPressure 
        ? `${latestVitals.bloodPressure.systolic}/${latestVitals.bloodPressure.diastolic}`
        : '--',
      unit: 'mmHg'
    },
    {
      icon: <Thermometer size={24} />,
      label: 'Temperature',
      value: latestVitals?.temperature || '--',
      unit: '°C'
    },
    {
      icon: <Droplet size={24} />,
      label: 'O2 Saturation',
      value: latestVitals?.oxygenSaturation || '--',
      unit: '%'
    }
  ];

  return (
    <div className="vitals-grid">
      {vitals.map((vital, index) => (
        <VitalCard key={index} {...vital} />
      ))}
    </div>
  );
};