import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Shield, Clock, Activity, Bell, Users, ChevronRight } from 'lucide-react';
import useAuthStore from '../stores/authStore';

const logo = '/images/logo-dark.png'; 

const Landing = () => {
  const navigate = useNavigate();
  const { registerPatient, isLoading } = useAuthStore();
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: { firstName: '', lastName: '' },
    phone: '',
    dateOfBirth: '',
    gender: ''
  });

  const handleRegister = async (e) => {
    e.preventDefault();
    const result = await registerPatient(formData);
    if (result.success) {
      navigate(`/${result.role}/dashboard`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md z-50 border-b border-gray-200">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Heart className="text-primary-600" size={28} />
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-600 hover:text-primary-600 transition">Features</a>
            <a href="#about" className="text-gray-600 hover:text-primary-600 transition">About</a>
            <a href="#security" className="text-gray-600 hover:text-primary-600 transition">Security</a>
            <button onClick={() => setIsRegistering(!isRegistering)} className="btn-primary">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-8">
            <Shield size={16} className="text-primary-300" />
            <span className="text-primary-200 text-sm">HIPAA Compliant & Secure</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Intelligent Health
            <span className="block text-primary-300">Monitoring System</span>
          </h1>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto mb-10">
            Aegis provides real-time patient monitoring, advanced analytics, 
            and secure health data management for doctors and patients.
          </p>
          <button onClick={() => setIsRegistering(true)} className="bg-white text-primary-900 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all inline-flex items-center gap-2">
            Start Your Health Journey <ChevronRight size={20} />
          </button>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white/5">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">10,000+</div>
              <div className="text-primary-300 mt-2">Active Patients</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">500+</div>
              <div className="text-primary-300 mt-2">Partner Doctors</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">99.9%</div>
              <div className="text-primary-300 mt-2">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">Enterprise-Grade Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card text-center hover:shadow-lg transition-all">
              <Activity size={48} className="text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Real-time Monitoring</h3>
              <p className="text-gray-600">Track patient vitals and health metrics in real-time with automated alerts.</p>
            </div>
            <div className="card text-center hover:shadow-lg transition-all">
              <Shield size={48} className="text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">HIPAA Compliant</h3>
              <p className="text-gray-600">Enterprise-grade security with end-to-end encryption and audit logs.</p>
            </div>
            <div className="card text-center hover:shadow-lg transition-all">
              <Bell size={48} className="text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Smart Alerts</h3>
              <p className="text-gray-600">Instant notifications for abnormal readings and critical conditions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Modal */}
      {isRegistering && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsRegistering(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-8 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-6">
              <Heart size={40} className="text-primary-600 mx-auto mb-3" />
              <h2 className="text-2xl font-bold">Patient Registration</h2>
              <p className="text-gray-500 mt-1">Create your patient account</p>
            </div>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="First Name" className="input-field" required
                  value={formData.name.firstName} onChange={(e) => setFormData({ ...formData, name: { ...formData.name, firstName: e.target.value } })} />
                <input type="text" placeholder="Last Name" className="input-field" required
                  value={formData.name.lastName} onChange={(e) => setFormData({ ...formData, name: { ...formData.name, lastName: e.target.value } })} />
              </div>
              <input type="email" placeholder="Email Address" className="input-field" required
                value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              <input type="tel" placeholder="Phone Number" className="input-field" required
                value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              <input type="date" placeholder="Date of Birth" className="input-field" required
                value={formData.dateOfBirth} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} />
              <select className="input-field" required value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })}>
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <input type="password" placeholder="Password (min 6 characters)" className="input-field" required minLength="6"
                value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
              <button type="submit" disabled={isLoading} className="btn-primary w-full">
                {isLoading ? 'Creating account...' : 'Register as Patient'}
              </button>
            </form>
            <p className="text-center text-sm text-gray-500 mt-4">
              Already have an account?{' '}
              <button onClick={() => navigate('/login')} className="text-primary-600 hover:underline">
                Login here
              </button>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Landing;