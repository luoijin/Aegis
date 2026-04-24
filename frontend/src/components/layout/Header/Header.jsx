import React, { useState, useEffect } from 'react';
import { Shield, Heart } from 'lucide-react';
import Button from '../../common/Button/Button';
import './Header.css';

const Header = ({ transparent = false, onLoginClick }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`header ${!isScrolled && transparent ? 'transparent' : 'scrolled'}`}>
      <div className="header-container">
        <div className="logo">
          <Heart size={28} strokeWidth={1.5} />
          <span className="logo-text">AEGIS</span>
        </div>
        
        <nav className="nav-links">
          <a href="#features">Features</a>
          <a href="#about">About</a>
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
        </div>
      </div>
    </header>
  );
};

export default Header;