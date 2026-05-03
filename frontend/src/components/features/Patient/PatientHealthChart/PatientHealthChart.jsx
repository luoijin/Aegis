// frontend/src/components/features/Patient/PatientHealthChart/PatientHealthChart.jsx
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity } from 'lucide-react';
import './PatientHealthChart.css';

export const PatientHealthChart = ({ chartData }) => {
  if (chartData.length === 0) {
    return (
      <div className="patient-chart-card">
        <div className="card-header">
          <h3><Activity size={16} /> Health Trends</h3>
        </div>
        <div className="no-data">No health data available</div>
      </div>
    );
  }

  return (
    <div className="patient-chart-card">
      <div className="card-header">
        <h3><Activity size={16} /> Heart Rate Trends (Last 30 Days)</h3>
      </div>
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="date" stroke="#64748B" fontSize={10} />
            <YAxis stroke="#64748B" fontSize={10} />
            <Tooltip />
            <Area 
              type="monotone" 
              dataKey="heartRate" 
              stroke="#3B82F6" 
              fill="#3B82F6" 
              fillOpacity={0.1} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};