// frontend/src/components/features/Admin/hooks/useAdminData.js
import { useState, useEffect, useCallback } from 'react';
import api from '../../../../utils/api';

export const useAdminData = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalHospitals: 0,
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
      setStats(statsRes.data);
      
      // Fetch hospitals
      const hospitalsRes = await api.get('/admin/hospitals');
      setHospitals(hospitalsRes.data);
      
      // Fetch doctors
      const doctorsRes = await api.get('/admin/doctors');
      setDoctors(doctorsRes.data);
      setRecentDoctors(doctorsRes.data.slice(0, 5));
      
      // Fetch patients
      const patientsRes = await api.get('/admin/patients');
      setAllPatients(patientsRes.data);
      setRecentPatients(patientsRes.data.slice(0, 5));
      
      // Fetch specializations
      const specsRes = await api.get('/admin/specializations');
      setSpecializations(specsRes.data);
      
      console.log('Data fetched successfully:', {
        doctors: doctorsRes.data.length,
        patients: patientsRes.data.length,
        hospitals: hospitalsRes.data.length,
        specializations: specsRes.data.length
      });
      
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
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