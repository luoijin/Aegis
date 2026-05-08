import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Activity, Users, TrendingUp, AlertCircle } from 'lucide-react';
import api from '../../../../services/api';
import './AnalyticsPanel.css';

// Use a blue gradient from your theme
const BLUE_COLORS = [
  'var(--accent)',
  'var(--accent-light)',
  '#1e40af',
  '#3b82f6',
  '#60a5fa',
  '#93c5fd',
  '#bfdbfe',
  '#dbeafe'
];

export const AnalyticsPanel = ({ doctorId }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCondition, setSelectedCondition] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/doctor/analytics/patient-stats');
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="analytics-tooltip">
          <p className="condition-name">{data.name}</p>
          <p className="condition-count">{data.value} patients ({data.percentage}%)</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="analytics-panel loading">
        <div className="spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="analytics-panel">
      <div className="analytics-header">
        <h3>Patient Analytics Dashboard</h3>
        <p>Health condition distribution among your patients</p>
      </div>

      <div className="analytics-stats">
        <div className="stat-card">
          <Users size={20} />
          <div>
            <div className="stat-value">{analytics?.totalPatients || 0}</div>
            <div className="stat-label">Total Patients</div>
          </div>
        </div>
        <div className="stat-card">
          <Activity size={20} />
          <div>
            <div className="stat-value">{analytics?.totalConditions || 0}</div>
            <div className="stat-label">Active Conditions</div>
          </div>
        </div>
        <div className="stat-card">
          <TrendingUp size={20} />
          <div>
            <div className="stat-value">{analytics?.conditions?.length || 0}</div>
            <div className="stat-label">Condition Types</div>
          </div>
        </div>
      </div>

      <div className="chart-container">
        {analytics?.conditions?.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={analytics.conditions}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                onMouseEnter={(data) => setSelectedCondition(data.name)}
                onMouseLeave={() => setSelectedCondition(null)}
              >
                {analytics.conditions.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={BLUE_COLORS[index % BLUE_COLORS.length]}
                    stroke="white"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value) => <span className="legend-label">{value}</span>}
                wrapperStyle={{ fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="no-data">
            <AlertCircle size={48} />
            <p>No condition data available</p>
            <small>Add conditions to patient records to see analytics</small>
          </div>
        )}
      </div>

      {selectedCondition && (
        <div className="condition-highlight">
          Showing details for: <strong>{selectedCondition}</strong>
        </div>
      )}
    </div>
  );
};