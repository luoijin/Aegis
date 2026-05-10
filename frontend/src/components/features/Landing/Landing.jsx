import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Lock, TrendingUp, Users, Smartphone, Code,
  Shield, Eye, Key, FileText, Database, Server, Heart, Award, Clock
} from 'lucide-react';
import Header from '../../layout/Header/Header';
import Footer from '../../layout/Footer/Footer';
import Button from '../../common/Button/Button';
import AuthModal from '../Auth/AuthModal';
import api from '../../../services/api';
import './Landing.css';

const logo = '/images/logo-dark.png';


const Landing = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [modalMode, setModalMode] = useState('login');
  const [stats, setStats] = useState({ totalActiveUsers: 0, totalAppointments: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    fetchPlatformStats();
  }, []);

  const fetchPlatformStats = async () => {
    try {
      const response = await api.get('/stats/platform');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch platform stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const formatVagueCount = (count) => {
    if (count >= 100) return '100+';
    if (count >= 50) return '50+';
    if (count >= 20) return '20+';
    if (count >= 10) return '10+';
    return count.toString();
  };

  const openAuthModal = (mode) => {
    setModalMode(mode);
    setShowAuthModal(true);
  };

  return (
    <>
      <Header onLoginClick={() => openAuthModal('login')} />
      
      <div className="landing-container">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-bg">
            <div className="hero-gradient"></div>
            <div className="hero-pattern"></div>
          </div>
          
          <div className="hero-container">
            <motion.div 
              className="hero-content"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="hero-badge">
                <span>Enterprise Health Platform</span>
              </div>
              
              <h1 className="hero-title">
                Intelligent Health Monitoring
                <span className="title-gradient"> for Modern Healthcare</span>
              </h1>
              
              <p className="hero-subtitle">
                Aegis provides real-time patient monitoring, advanced analytics, 
                and secure health data management for doctors and patients.
              </p>
              
              <div className="hero-buttons">
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => openAuthModal('login')}
                >
                  Access Portal
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="features-section">
          <div className="section-container">
            <div className="section-header">
              <h2>Enterprise-Grade Features</h2>
            </div>
            
            <div className="features-grid">
              <div className="feature-card">
                <Activity size={48} strokeWidth={1.5} />
                <h3>Real-time Monitoring</h3>
                <p>Track patient vitals and health metrics in real-time with automated alerts</p>
              </div>
              <div className="feature-card">
                <Lock size={48} strokeWidth={1.5} />
                <h3>HIPAA Compliant</h3>
                <p>Enterprise-grade security with end-to-end encryption</p>
              </div>
              <div className="feature-card">
                <TrendingUp size={48} strokeWidth={1.5} />
                <h3>Advanced Analytics</h3>
                <p>AI-powered insights and predictive health analytics</p>
              </div>
              <div className="feature-card">
                <Users size={48} strokeWidth={1.5} />
                <h3>Role-Based Access</h3>
                <p>Separate dashboards for doctors and patients</p>
              </div>
              <div className="feature-card">
                <Smartphone size={48} strokeWidth={1.5} />
                <h3>Mobile Ready</h3>
                <p>Fully responsive design for all devices</p>
              </div>
              <div className="feature-card">
                <Code size={48} strokeWidth={1.5} />
                <h3>API Integration</h3>
                <p>RESTful API for seamless integration</p>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="about-section">
          <div className="section-container">
            <div className="about-grid">
              <div className="about-content">
                <h2>About Aegis</h2>
                <p className="about-lead">
                  Founded by healthcare professionals and technologists, Aegis is on a mission to transform patient care through intelligent monitoring.
                </p>
                <div className="about-stats">
                  <div className="about-stat">
                    <div className="about-stat-number">2026</div>
                    <div className="about-stat-label">Founded</div>
                  </div>
                  <div className="about-stat">
                    <div className="about-stat-number">{!loadingStats ? formatVagueCount(stats.totalHospitals) : '...'}</div>
                    <div className="about-stat-label">Hospitals</div>
                  </div>
                  <div className="about-stat">
                    <div className="about-stat-number">{!loadingStats ? formatVagueCount(stats.totalPatients) : '...'}</div>
                    <div className="about-stat-label">Patients Served</div>
                  </div>
                </div>
                <p className="about-text">
                  Aegis combines cutting-edge technology with medical expertise to deliver a platform 
                  that empowers healthcare providers with real-time insights, reduces administrative burden, 
                  and improves patient outcomes. Our team includes former clinicians, data scientists, 
                  and software engineers dedicated to advancing digital health.
                </p>
              </div>
              <div className="about-image">
                <img 
                  src="/images/logo-light.png" 
                  alt="AEGIS Logo" 
                  className="about-logo" 
                />
              </div>
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section id="security" className="security-section">
          <div className="section-container">
            <div className="security-header">
              <h2>Enterprise-Grade Security</h2>
              <p>Your data is protected with the highest standards</p>
            </div>
            <div className="security-grid">
              <div className="security-card">
                <Shield size={48} strokeWidth={1.5} />
                <h3>HIPAA Compliance</h3>
                <p>Fully compliant with HIPAA regulations for handling protected health information (PHI).</p>
              </div>
              <div className="security-card">
                <Key size={48} strokeWidth={1.5} />
                <h3>End-to-End Encryption</h3>
                <p>Data encrypted at rest and in transit using AES-256 and TLS 1.3 protocols.</p>
              </div>
              <div className="security-card">
                <Users size={48} strokeWidth={1.5} />
                <h3>Role-Based Access</h3>
                <p>Granular access controls ensuring only authorized personnel view sensitive data.</p>
              </div>
              <div className="security-card">
                <FileText size={48} strokeWidth={1.5} />
                <h3>Audit Logs</h3>
                <p>Complete audit trails of all data access and system activities.</p>
              </div>
              <div className="security-card">
                <Database size={48} strokeWidth={1.5} />
                <h3>Automatic Backups</h3>
                <p>Daily encrypted backups with point-in-time recovery.</p>
              </div>
              <div className="security-card">
                <Server size={48} strokeWidth={1.5} />
                <h3>Secure Data Centers</h3>
                <p>Enterprise hosting on SOC 2 certified infrastructure.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="cta-container">
            <h2>Ready to transform healthcare delivery?</h2>
            <p>Join thousands of medical professionals using Aegis</p>
            <Button 
              variant="primary" 
              size="lg"
              onClick={() => openAuthModal('register')}
            >
              Get Started Today
            </Button>
          </div>
        </section>
      </div>
      
      <Footer />

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <AuthModal 
            mode={modalMode}
            onClose={() => setShowAuthModal(false)}
            onSwitchMode={(mode) => setModalMode(mode)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Landing;