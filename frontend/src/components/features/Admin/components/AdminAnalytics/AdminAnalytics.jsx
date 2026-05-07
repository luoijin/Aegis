import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Activity, Users, TrendingUp, AlertCircle } from 'lucide-react';
import api from '../../../../../services/api';
import './AdminAnalytics.css';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'];

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAnalytics(); }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/admin/analytics/patients');
      setAnalytics(response.data);
    } catch (error) { console.error('Error fetching analytics:', error); }
    finally { setLoading(false); }
  };

  if (loading) return <div className="admin-analytics loading">Loading analytics...</div>;

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

  return (
    <div className="admin-analytics">
      {/* Header */}
      <div className="tab-header">
        <div className="header-content">
          <Activity size={18} />
          <h3>Patient Analytics</h3>
        </div>
      </div>

      {/* Stats Row */}
      <div className="stats-row">
        <div className="stat-mini">
          <div className="stat-value">{analytics?.totalPatients || 0}</div>
          <div className="stat-label">Total Patients</div>
        </div>
        <div className="stat-mini info">
          <div className="stat-value">{analytics?.totalConditions || 0}</div>
          <div className="stat-label">Total Conditions</div>
        </div>
        <div className="stat-mini success">
          <div className="stat-value">{analytics?.conditions?.length || 0}</div>
          <div className="stat-label">Condition Types</div>
        </div>
      </div>

      {/* Chart Card */}
      <div className="chart-card">
        <div className="chart-header">
          <div className="chart-title">
            <TrendingUp size={18} />
            <h3>Condition Distribution</h3>
          </div>
        </div>
        
        <div className="chart-wrapper">
          {analytics?.conditions?.length > 0 ? (
            <ResponsiveContainer width="100%" height={340}>
              <PieChart>
                <Pie
                  data={analytics.conditions}
                  cx="50%"
                  cy="45%"
                  innerRadius="30%"
                  outerRadius="45%"
                  paddingAngle={2}
                  dataKey="value"
                  labelLine={{ stroke: '#94A3B8', strokeWidth: 1 }}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {analytics.conditions.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                      stroke="white"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  align="center" 
                  layout="horizontal"
                  wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }}
                  formatter={(value) => <span style={{ color: '#475569' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data">
              <AlertCircle size={48} />
              <p>No condition data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;