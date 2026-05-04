// frontend/src/components/features/Admin/components/AdminAnalytics/AdminAnalytics.jsx
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
      return <div className="analytics-tooltip"><p className="condition-name">{data.name}</p><p className="condition-count">{data.value} patients ({data.percentage}%)</p></div>;
    }
    return null;
  };

  return (
    <div className="admin-analytics">
      <div className="analytics-header"><h2>Global Patient Analytics</h2><p>Health condition distribution across all patients</p></div>
      <div className="analytics-stats">
        <div className="stat-card"><Users size={20} /><div><div className="stat-value">{analytics?.totalPatients || 0}</div><div className="stat-label">Total Patients</div></div></div>
        <div className="stat-card"><Activity size={20} /><div><div className="stat-value">{analytics?.totalConditions || 0}</div><div className="stat-label">Total Conditions</div></div></div>
        <div className="stat-card"><TrendingUp size={20} /><div><div className="stat-value">{analytics?.conditions?.length || 0}</div><div className="stat-label">Condition Types</div></div></div>
      </div>
      <div className="chart-container">
        {analytics?.conditions?.length > 0 ? (
          <ResponsiveContainer width="100%" height={420}>
            <PieChart>
              <Pie data={analytics.conditions} cx="50%" cy="50%" innerRadius={70} outerRadius={120} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} labelLine={{ stroke: '#94A3B8', strokeWidth: 1 }}>
                {analytics.conditions.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="white" strokeWidth={2} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="bottom" height={36} formatter={(value) => <span style={{ fontSize: '12px', color: '#475569' }}>{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="no-data"><AlertCircle size={48} /><p>No condition data available</p></div>
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;