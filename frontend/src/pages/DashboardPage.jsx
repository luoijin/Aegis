import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Dashboard from '../components/features/DashBoard/Dashboard';

const DashboardPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  return <Dashboard />;
};

export default DashboardPage;