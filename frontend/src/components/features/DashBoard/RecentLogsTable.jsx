import React from 'react';
import './RecentLogsTable.css';

const RecentLogsTable = ({ logs }) => {
  const getStatusClass = (status) => {
    const classes = {
      warning: 'warning',
      danger: 'danger',
      success: 'success'
    };
    return classes[status] || 'success';
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Recent Health Logs</h3>
        <input 
          type="text" 
          placeholder="Search patients..." 
          className="search-input"
        />
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Patient Name</th>
              <th>Age</th>
              <th>Vital Type</th>
              <th>Reading</th>
              <th>Status</th>
              <th>Time</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id}>
                <td className="patient-name">{log.patient}</td>
                <td>{log.age}</td>
                <td>{log.type}</td>
                <td className="reading-value">{log.val}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(log.status)}`}>
                    {log.status}
                  </span>
                </td>
                <td className="time-text">{log.date}</td>
                <td>
                  <button className="btn-sm btn-outline">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentLogsTable;