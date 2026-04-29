import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './components/features/Landing/Landing';
import DoctorDashboard from './components/features/Doctor/DoctorDashboard';
import PatientDashboard from './components/features/Patient/PatientDashboard';
import AdminDashboard from './components/features/Admin/AdminDashboard';
import AdminLayout from './components/layout/AdminLayout/AdminLayout';
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    window.location.href = '/';
  };

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
        <Route 
          path="/admin/dashboard" 
          element={
            <PrivateRoute allowedRole="admin">
              <AdminLayout onLogout={handleLogout}>
                <AdminDashboard />
              </AdminLayout>
            </PrivateRoute>
          } 
        />
        {/* Admin sub-routes */}
        <Route 
          path="/admin/hospitals" 
          element={
            <PrivateRoute allowedRole="admin">
              <AdminLayout onLogout={handleLogout}>
                <AdminDashboard initialTab="hospitals" />
              </AdminLayout>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/admin/doctors" 
          element={
            <PrivateRoute allowedRole="admin">
              <AdminLayout onLogout={handleLogout}>
                <AdminDashboard initialTab="doctors" />
              </AdminLayout>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/admin/patients" 
          element={
            <PrivateRoute allowedRole="admin">
              <AdminLayout onLogout={handleLogout}>
                <AdminDashboard initialTab="patients" />
              </AdminLayout>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/admin/specializations" 
          element={
            <PrivateRoute allowedRole="admin">
              <AdminLayout onLogout={handleLogout}>
                <AdminDashboard initialTab="specializations" />
              </AdminLayout>
            </PrivateRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;