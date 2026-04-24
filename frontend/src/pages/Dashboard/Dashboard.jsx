import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const Dashboard = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await api.get('/patients');
      setPatients(response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.logo}>MedMatrix</h1>
        <div>
          <span style={styles.welcome}>
            Welcome, {user?.profile?.firstName || user?.email || 'Doctor'}
          </span>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </div>

      {/* Dashboard Content */}
      <div style={styles.content}>
        <h2 style={styles.pageTitle}>Dashboard</h2>

        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <h3 style={styles.statTitle}>Total Patients</h3>
            <p style={styles.statValue}>{patients.length}</p>
          </div>
          <div style={{...styles.statCard, borderTopColor: '#10B981'}}>
            <h3 style={styles.statTitle}>System Status</h3>
            <p style={{...styles.statValue, color: '#10B981', fontSize: '1rem'}}>✓ Operational</p>
          </div>
          <div style={{...styles.statCard, borderTopColor: '#F59E0B'}}>
            <h3 style={styles.statTitle}>Active Alerts</h3>
            <p style={styles.statValue}>0</p>
          </div>
        </div>

        {/* Patients Table */}
        <div style={styles.patientsSection}>
          <h3 style={styles.sectionTitle}>Patient List</h3>
          {loading ? (
            <p>Loading patients...</p>
          ) : patients.length === 0 ? (
            <div style={styles.emptyState}>
              <p>No patients found.</p>
              <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                Create a patient using the API:
              </p>
              <code style={styles.codeBlock}>
                POST /api/patients
              </code>
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Blood Type</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {patients.map(patient => (
                  <tr key={patient._id} style={styles.tableRow}>
                    <td style={styles.td}>
                      {patient.user?.profile?.firstName} {patient.user?.profile?.lastName}
                    </td>
                    <td style={styles.td}>{patient.user?.email || 'N/A'}</td>
                    <td style={styles.td}>{patient.bloodType || 'N/A'}</td>
                    <td style={styles.td}>
                      <span style={styles.statusBadge}>Active</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  header: {
    backgroundColor: '#007BFF',
    color: 'white',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    margin: 0,
    fontSize: '1.5rem',
  },
  welcome: {
    marginRight: '1rem',
  },
  logoutBtn: {
    padding: '0.5rem 1rem',
    backgroundColor: 'white',
    color: '#007BFF',
    border: 'none',
    borderRadius: '0.25rem',
    cursor: 'pointer',
  },
  content: {
    padding: '2rem',
  },
  pageTitle: {
    marginBottom: '2rem',
    color: '#1E293B',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem',
  },
  statCard: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    borderTop: '4px solid #007BFF',
  },
  statTitle: {
    color: '#64748B',
    marginBottom: '0.5rem',
    fontSize: '0.875rem',
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#007BFF',
    margin: 0,
  },
  patientsSection: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  sectionTitle: {
    marginBottom: '1rem',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeader: {
    borderBottom: '2px solid #E2E8F0',
    textAlign: 'left',
  },
  th: {
    padding: '0.75rem',
  },
  tableRow: {
    borderBottom: '1px solid #E2E8F0',
  },
  td: {
    padding: '0.75rem',
  },
  statusBadge: {
    backgroundColor: '#D1FAE5',
    color: '#065F46',
    padding: '0.25rem 0.5rem',
    borderRadius: '0.25rem',
    fontSize: '0.75rem',
  },
  emptyState: {
    textAlign: 'center',
    padding: '2rem',
    color: '#64748B',
  },
  codeBlock: {
    display: 'inline-block',
    backgroundColor: '#F1F5F9',
    padding: '0.25rem 0.5rem',
    borderRadius: '0.25rem',
    marginTop: '0.5rem',
    fontFamily: 'monospace',
  },
};

export default Dashboard;