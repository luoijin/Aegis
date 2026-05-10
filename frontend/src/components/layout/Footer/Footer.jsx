import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';
import LegalModal from '../../common/LegalModal/LegalModal';
import './Footer.css';

const Footer = () => {
  const [activeModal, setActiveModal] = useState(null);

  const openModal = (type) => setActiveModal(type);
  const closeModal = () => setActiveModal(null);

  return (
    <>
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-brand">
            <span>AEGIS</span>
          </div>
          <div className="footer-links">
            <button onClick={() => openModal('privacy')} className="footer-link-btn">
              Privacy Policy
            </button>
            <button onClick={() => openModal('terms')} className="footer-link-btn">
              Terms of Service
            </button>
            <button onClick={() => openModal('hipaa')} className="footer-link-btn">
              HIPAA Compliance
            </button>
            <button onClick={() => openModal('contact')} className="footer-link-btn">
              Contact Support
            </button>
          </div>
          <div className="footer-copyright">
            © 2026 Aegis Health Monitoring. All rights reserved.
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {activeModal && (
          <LegalModal type={activeModal} onClose={closeModal} />
        )}
      </AnimatePresence>
    </>
  );
};

export default Footer;