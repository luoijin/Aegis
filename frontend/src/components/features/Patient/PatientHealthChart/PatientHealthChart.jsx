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
            <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-200)" />
            <XAxis dataKey="date" stroke="var(--gray-500)" fontSize={10} />
            <YAxis stroke="var(--gray-500)" fontSize={10} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }} />
            <Area type="monotone" dataKey="heartRate" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.1} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};