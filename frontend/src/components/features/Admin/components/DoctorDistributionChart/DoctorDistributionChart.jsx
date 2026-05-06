// frontend/src/components/features/Admin/components/DoctorDistributionChart/DoctorDistributionChart.jsx
import React from 'react';
import { TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', 
  '#06B6D4', '#84CC16', '#F97316', '#6366F1', '#14B8A6', '#D946EF'
];

const DoctorDistributionChart = ({ doctors, specializations }) => {
  const doctorDistribution = specializations.slice(0, 6).map(spec => ({
    name: spec.name,
    value: doctors.filter(d => d.specialization === spec.name).length || 0
  })).filter(item => item.value > 0);

  if (doctorDistribution.length === 0) {
    return (
      <div className="doctor-distribution-chart">
        <div className="chart-card">
          <div className="chart-header">
            <div className="chart-title">
              <TrendingUp size={18} />
              <h3>Doctor Distribution by Specialization</h3>
            </div>
          </div>
          <div className="no-data">No doctor data available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="doctor-distribution-chart">
      <div className="chart-card">
        <div className="chart-header">
          <div className="chart-title">
            <TrendingUp size={18} />
            <h3>Doctor Distribution by Specialization</h3>
          </div>
          <div className="chart-stats">
            <span className="stat-badge">Specializations: {doctorDistribution.length}</span>
            <span className="stat-badge">Total Doctors: {doctors.length}</span>
          </div>
        </div>
        
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={doctorDistribution}
                cx="50%"
                cy="50%"
                innerRadius="35%"
                outerRadius="50%"
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                labelLine={{ stroke: '#94A3B8', strokeWidth: 1 }}
              >
                {doctorDistribution.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                    stroke="white"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E2E8F0', 
                  borderRadius: '8px',
                  padding: '8px 12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value, name) => [`${value} doctors`, name]}
              />
              <Legend 
                verticalAlign="bottom" 
                align="center" 
                layout="horizontal"
                wrapperStyle={{ paddingTop: '16px' }}
                formatter={(value) => <span style={{ fontSize: '12px', color: '#475569' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
          
          {/* <div className="donut-center-text">
            <div className="center-value">{doctors.length}</div>
            <div className="center-label">Total Doctors</div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default DoctorDistributionChart;