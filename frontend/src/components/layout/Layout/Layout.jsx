import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './components/features/Landing/Landing';
import DoctorDashboard from './components/features/Doctor/DoctorDashboard';
import PatientDashboard from './components/features/Patient/PatientDashboard';
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;