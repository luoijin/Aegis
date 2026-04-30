import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './HealthChart.css';

export const HealthChart = ({ chartData }) => {
  if (chartData.length === 0) {
    return (
      <div className="chart-container">
        <h3>Heart Rate Trends (Last 30 Days)</h3>
        <div className="no-data">No health data available</div>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <h3>Heart Rate Trends (Last 30 Days)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis dataKey="date" stroke="#64748B" />
          <YAxis stroke="#64748B" />
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
  );
};