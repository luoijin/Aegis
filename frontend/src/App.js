import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfirmProvider } from './components/common/ConfirmModal/ConfirmProvider';
import Landing from './components/features/Landing/Landing';
import DoctorDashboard from './components/features/Doctor/DoctorDashboard/DoctorDashboard';
import PatientDashboard from './components/features/Patient/PatientDashboard/PatientDashboard';
import AdminDashboard from './components/features/Admin/AdminDashboard';

import './styles/global.css';

const PrivateRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  
  if (!token) {
    return <Navigate to="/" replace />;
  }
  
  if (allowedRole && userRole !== allowedRole) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  return (
    <ConfirmProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route 
            path="/doctor/dashboard" 
            element={
              <PrivateRoute allowedRole="doctor">
                <DoctorDashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/patient/dashboard" 
            element={
              <PrivateRoute allowedRole="patient">
                <PatientDashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/admin/dashboard" 
            element={
              <PrivateRoute allowedRole="admin">
                <AdminDashboard />
              </PrivateRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ConfirmProvider>
  );
}

export default App;