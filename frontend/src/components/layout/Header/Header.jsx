import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import Button from '../../common/Button/Button';
import './Header.css';

// Logo from public folder
const logo = '/images/logo-dark.png';

const Header = ({ onLoginClick }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`header ${!isScrolled ? 'transparent' : 'scrolled'}`}>
      <div className="header-container">
        <div className="logo">
          <img src={logo} alt="AEGIS Logo" className="logo-image" />
          <span className="logo-text">AEGIS</span>
        </div>
        
        <nav className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <a href="#about">About</a>
          <a href="#features">Features</a>
          <a href="#security">Security</a>
        </nav>
        
        <div className="header-buttons">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onLoginClick}
          >
            Sign In
          </Button>
          <button 
            className="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu - Optional, you can add if needed */}
      {isMobileMenuOpen && (
        <div className="mobile-menu">
          <a href="#about" onClick={() => setIsMobileMenuOpen(false)}>About</a>
          <a href="#features" onClick={() => setIsMobileMenuOpen(false)}>Features</a>
          <a href="#security" onClick={() => setIsMobileMenuOpen(false)}>Security</a>
          <Button 
            variant="primary" 
            size="sm"
            fullWidth
            onClick={() => {
              setIsMobileMenuOpen(false);
              onLoginClick();
            }}
          >
            Sign In
          </Button>
        </div>
      )}
    </header>
  );
};

export default Header;