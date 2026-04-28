import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Mail, Lock } from 'lucide-react';
import useAuthStore from '../stores/authStore';

const Login = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      navigate(`/${result.role}/dashboard`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 to-primary-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 animate-slide-up">
        <div className="text-center mb-8">
          <Heart size={48} className="text-primary-600 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-500 mt-1">Sign in to your account</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="email" className="input-field pl-10" placeholder="doctor@aegis.com" required
                value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="password" className="input-field pl-10" placeholder="••••••••" required
                value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>
          
          <button type="submit" disabled={isLoading} className="btn-primary w-full">
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{' '}
          <button onClick={() => navigate('/')} className="text-primary-600 hover:underline">
            Register as Patient
          </button>
        </p>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-center text-gray-400">
            Demo Accounts:<br />
            Admin: admin@aegis.com / Admin@123<br />
            Doctor: Contact admin to create<br />
            Patient: Register above
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;