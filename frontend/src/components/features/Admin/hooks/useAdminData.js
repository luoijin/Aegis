// frontend/src/components/features/Admin/hooks/useAdminData.js
import { useState, useEffect, useCallback } from 'react';
import api from '../../../../utils/api';

export const useAdminData = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalHospitals: 0,
    totalHealthLogs: 0,
    totalAppointments: 0
  });
  const [recentPatients, setRecentPatients] = useState([]);
  const [recentDoctors, setRecentDoctors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [allPatients, setAllPatients] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Fetching admin data...');
      
      // Fetch dashboard stats
      const statsRes = await api.get('/admin/dashboard/stats');
      console.log('Dashboard stats response:', statsRes.data);
      
      // Fetch specializations FIRST
      const specsRes = await api.get('/admin/specializations');
      const specializationsData = specsRes.data || [];
      setSpecializations(specializationsData);
      
      // CORRECT STATS EXTRACTION with totalSpecializations
      if (statsRes.data && statsRes.data.stats) {
        setStats({
          totalPatients: statsRes.data.stats.totalPatients || 0,
          totalDoctors: statsRes.data.stats.totalDoctors || 0,
          totalHospitals: statsRes.data.stats.totalHospitals || 0,
          totalHealthLogs: statsRes.data.stats.totalHealthLogs || 0,
          totalAppointments: statsRes.data.stats.totalAppointments || 0,
          totalSpecializations: specializationsData.length || 0  // ← ADD THIS
        });
        console.log('Stats set to:', {
          ...statsRes.data.stats,
          totalSpecializations: specializationsData.length
        });
      } else if (statsRes.data) {
        // Alternative structure
        setStats({
          totalPatients: statsRes.data.totalPatients || 0,
          totalDoctors: statsRes.data.totalDoctors || 0,
          totalHospitals: statsRes.data.totalHospitals || 0,
          totalHealthLogs: statsRes.data.totalHealthLogs || 0,
          totalAppointments: statsRes.data.totalAppointments || 0,
          totalSpecializations: specializationsData.length || 0  // ← ADD THIS
        });
      }
      
      // Set recent items from dashboard stats
      if (statsRes.data.recentPatients) {
        setRecentPatients(statsRes.data.recentPatients);
      }
      if (statsRes.data.recentDoctors) {
        setRecentDoctors(statsRes.data.recentDoctors);
      }
      
      // Fetch hospitals
      const hospitalsRes = await api.get('/admin/hospitals');
      setHospitals(hospitalsRes.data || []);
      
      // Fetch doctors
      const doctorsRes = await api.get('/admin/doctors');
      setDoctors(doctorsRes.data || []);
      
      // Fetch patients
      const patientsRes = await api.get('/admin/patients');
      setAllPatients(patientsRes.data || []);
      
      console.log('Data fetched successfully. Specializations count:', specializationsData.length);
      
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  return {
    stats,
    recentPatients,
    recentDoctors,
    hospitals,
    doctors,
    allPatients,
    specializations,
    loading,
    error,
    success,
    setError,
    setSuccess,
    fetchAllData
  };
};