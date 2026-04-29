import { useState, useEffect, useCallback } from 'react';
import api from '../../../../utils/api';

export const useAdminData = () => {
  const [stats, setStats] = useState({ totalPatients: 0, totalDoctors: 0, totalHospitals: 0, totalAppointments: 0 });
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
    try {
      const [statsRes, hospitalsRes, doctorsRes, patientsRes, specializationsRes] = await Promise.all([
        api.get('/admin/dashboard/stats'),
        api.get('/admin/hospitals'),
        api.get('/admin/doctors'),
        api.get('/admin/patients'),
        api.get('/admin/specializations')
      ]);
      setStats(statsRes.data.stats);
      setRecentPatients(statsRes.data.recentPatients || []);
      setRecentDoctors(statsRes.data.recentDoctors || []);
      setHospitals(hospitalsRes.data);
      setDoctors(doctorsRes.data);
      setAllPatients(patientsRes.data);
      setSpecializations(specializationsRes.data);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
      setTimeout(() => {
        setError('');
        setSuccess('');
      }, 3000);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  return {
    stats, recentPatients, recentDoctors, hospitals, doctors, allPatients, specializations,
    loading, error, success, setError, setSuccess, fetchAllData
  };
};