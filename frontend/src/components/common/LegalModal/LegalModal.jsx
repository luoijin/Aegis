import React from 'react';
import { motion } from 'framer-motion';
import { X, Shield, FileText, Heart, Lock, Mail, Phone, MapPin, MessageCircle, AlertTriangle } from 'lucide-react';
import './LegalModal.css';

const LegalModal = ({ type, onClose }) => {
  const getContent = () => {
    switch(type) {
      case 'privacy':
        return {
          title: 'Privacy Policy',
          icon: <Lock size={24} />,
          content: (
            <>
              <section>
                <h3>1. Information We Collect</h3>
                <p>Aegis Health Monitoring collects information that you provide directly to us, including:</p>
                <ul>
                  <li>Personal identification information (name, email, phone number)</li>
                  <li>Medical history and health records</li>
                  <li>Vital signs and health metrics</li>
                  <li>Device information and usage data</li>
                </ul>
              </section>

              <section>
                <h3>2. How We Use Your Information</h3>
                <p>We use the collected information to:</p>
                <ul>
                  <li>Provide and maintain our health monitoring services</li>
                  <li>Notify you about changes to your health status</li>
                  <li>Allow doctors to monitor patient health</li>
                  <li>Improve and personalize your experience</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </section>

              <section>
                <h3>3. Data Security</h3>
                <p>We implement industry-standard security measures including:</p>
                <ul>
                  <li>AES-256 encryption for data at rest</li>
                  <li>TLS 1.3 for data in transit</li>
                  <li>Regular security audits and penetration testing</li>
                  <li>Role-based access controls</li>
                </ul>
              </section>

              <section>
                <h3>4. HIPAA Compliance</h3>
                <p>Aegis is fully HIPAA compliant. We:</p>
                <ul>
                  <li>Sign Business Associate Agreements (BAAs)</li>
                  <li>Maintain audit logs of all PHI access</li>
                  <li>Implement administrative, physical, and technical safeguards</li>
                  <li>Provide breach notification as required by law</li>
                </ul>
              </section>

              <section>
                <h3>5. Your Rights</h3>
                <p>You have the right to:</p>
                <ul>
                  <li>Access your personal health information</li>
                  <li>Request corrections to your data</li>
                  <li>Receive an accounting of disclosures</li>
                  <li>Request restrictions on certain uses</li>
                  <li>Receive a copy of your data in electronic format</li>
                </ul>
              </section>

              <section>
                <h3>6. Contact Us</h3>
                <p>For privacy-related inquiries, contact our Privacy Officer:</p>
                <ul>
                  <li>Email: privacy@aegishealth.com</li>
                  <li>Phone: (555) 123-4567</li>
                  <li>Address: 123 Healthcare Blvd, Medical District, NY 10001</li>
                </ul>
              </section>

              <div className="legal-footer">
                <p>Last Updated: April 20, 2026</p>
                <p>Version 2.0</p>
              </div>
            </>
          )
        };
      
      case 'terms':
        return {
          title: 'Terms of Service',
          icon: <FileText size={24} />,
          content: (
            <>
              <section>
                <h3>1. Acceptance of Terms</h3>
                <p>By accessing or using Aegis Health Monitoring, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our service.</p>
              </section>

              <section>
                <h3>2. Description of Service</h3>
                <p>Aegis provides a health monitoring platform that allows:</p>
                <ul>
                  <li>Patients to track and share health data with healthcare providers</li>
                  <li>Doctors to monitor patient health metrics remotely</li>
                  <li>Healthcare organizations to manage patient populations</li>
                </ul>
              </section>

              <section>
                <h3>3. User Responsibilities</h3>
                <p>As a user of Aegis, you agree to:</p>
                <ul>
                  <li>Provide accurate and complete information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Notify us immediately of any unauthorized access</li>
                  <li>Use the service only for its intended medical purposes</li>
                  <li>Comply with all applicable laws and regulations</li>
                </ul>
              </section>

              <section>
                <h3>4. Healthcare Provider Responsibilities</h3>
                <p>Healthcare providers using Aegis agree to:</p>
                <ul>
                  <li>Maintain appropriate professional licenses</li>
                  <li>Provide quality medical care based on data received</li>
                  <li>Comply with all medical record-keeping requirements</li>
                  <li>Use the platform in accordance with medical best practices</li>
                </ul>
              </section>

              <section>
                <h3>5. Limitations of Service</h3>
                <p>Aegis is a monitoring tool and does not:</p>
                <ul>
                  <li>Replace professional medical advice</li>
                  <li>Provide emergency medical services</li>
                  <li>Guarantee the accuracy of all data transmissions</li>
                  <li>Serve as a substitute for in-person medical care</li>
                </ul>
                <p className="important-note">In case of medical emergency, please call 911 immediately.</p>
              </section>

              <section>
                <h3>6. Termination</h3>
                <p>We may terminate or suspend your access immediately for violations of these terms. Upon termination, your right to use the service will cease immediately.</p>
              </section>

              <div className="legal-footer">
                <p>Last Updated: April 20, 2026</p>
                <p>Version 2.0</p>
              </div>
            </>
          )
        };
      
      case 'hipaa':
        return {
          title: 'HIPAA Compliance',
          icon: <Shield size={24} />,
          content: (
            <>
              <section>
                <h3>HIPAA Compliance Statement</h3>
                <p>Aegis Health Monitoring is fully compliant with the Health Insurance Portability and Accountability Act (HIPAA) of 1996.</p>
              </section>

              <section>
                <h3>Administrative Safeguards</h3>
                <ul>
                  <li>Designated HIPAA Privacy and Security Officers</li>
                  <li>Regular risk assessments and management</li>
                  <li>Workforce training on HIPAA requirements</li>
                  <li>Signed Business Associate Agreements with all partners</li>
                </ul>
              </section>

              <section>
                <h3>Physical Safeguards</h3>
                <ul>
                  <li>Secure data centers with biometric access controls</li>
                  <li>24/7 security monitoring and surveillance</li>
                  <li>Controlled access to facilities and hardware</li>
                  <li>Secure disposal of media containing PHI</li>
                </ul>
              </section>

              <section>
                <h3>Technical Safeguards</h3>
                <ul>
                  <li>End-to-end encryption (AES-256)</li>
                  <li>Secure transmission protocols (TLS 1.3)</li>
                  <li>Automatic logoff after inactivity</li>
                  <li>Unique user identification and tracking</li>
                  <li>Emergency access procedures</li>
                </ul>
              </section>

              <section>
                <h3>Breach Notification</h3>
                <p>In accordance with HIPAA requirements, we provide:</p>
                <ul>
                  <li>Immediate notification to affected individuals</li>
                  <li>Notification to HHS within 60 days of breach discovery</li>
                  <li>Media notification for breaches affecting 500+ individuals</li>
                  <li>Documentation of breach response actions</li>
                </ul>
              </section>

              <section>
                <h3>Patient Rights Under HIPAA</h3>
                <ul>
                  <li>Right to access your PHI</li>
                  <li>Right to request amendments</li>
                  <li>Right to an accounting of disclosures</li>
                  <li>Right to request restrictions</li>
                  <li>Right to confidential communications</li>
                  <li>Right to file a complaint with HHS</li>
                </ul>
              </section>

              <div className="legal-footer">
                <p>For HIPAA-related inquiries: hipaa@aegishealth.com</p>
                <p>HHS Office for Civil Rights: (800) 368-1019</p>
              </div>
            </>
          )
        };
      
      case 'contact':
        return {
          title: 'Contact Support',
          icon: <Heart size={24} />,
          content: (
            <>
              <section>
                <h3>Customer Support</h3>
                <p>Our support team is available 24/7 to assist you with any questions or concerns.</p>
                
                <div className="contact-methods">
                  <div className="contact-method">
                    <h4><Mail size={18} style={{ display: 'inline', marginRight: '8px' }} /> Email Support</h4>
                    <p>General Inquiries: support@aegishealth.com</p>
                    <p>Technical Support: tech@aegishealth.com</p>
                    <p>Billing Questions: billing@aegishealth.com</p>
                    <p>Response Time: Within 2 hours</p>
                  </div>

                  <div className="contact-method">
                    <h4><Phone size={18} style={{ display: 'inline', marginRight: '8px' }} /> Phone Support</h4>
                    <p>Main Line: (555) 123-4567</p>
                    <p>Toll-Free: (888) 555-0123</p>
                    <p>Emergency Support: (555) 123-4568</p>
=                  </div>
                </div>

                <div className="emergency-note">
                  <h4><AlertTriangle size={18} style={{ display: 'inline', marginRight: '8px' }} /> Medical Emergencies</h4>
                  <p>If you are experiencing a medical emergency, please call 911 immediately. Do not use email or chat for emergency situations.</p>
                </div>
              </section>
            </>
          )
        };
      
      default:
        return { title: '', icon: null, content: null };
    }
  };

  const { title, icon, content } = getContent();

  return (
    <div className="legal-modal-overlay" onClick={onClose}>
      <motion.div 
        className="legal-modal"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="legal-modal-header">
          <div className="legal-modal-title">
            {icon}
            <h2>{title}</h2>
          </div>
          <button className="legal-modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
        <div className="legal-modal-content">
          {content}
        </div>
      </motion.div>
    </div>
  );
};

export default LegalModal;