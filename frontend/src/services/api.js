// frontend/src/services/api.js
import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Request interceptor - add token
api.interceptors.request.use(
  (config) => {
    // Use consistent token key - 'token' only
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors (no token refresh for now)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Clear all auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('accessToken');
      
      // Show error message
      toast.error('Session expired. Please login again.');
      
      // Redirect to login if not already there
      if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    } else if (error.response?.status === 500) {
      // Log 500 errors for debugging
      console.error('API Error (500):', {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data,
        response: error.response?.data
      });
      toast.error(error.response?.data?.message || 'Server error. Please try again.');
    } else {
      // Handle other errors
      toast.error(error.response?.data?.message || 'Something went wrong');
    }
    
    return Promise.reject(error);
  }
);

export default api;