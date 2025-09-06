// Header.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    console.log('Search query:', searchQuery);
    // Add your search logic here
  };

  return (
    <header className={`header ${isScrolled ? 'header--scrolled' : ''}`}>
      <div className="header__container">
        {/* Logo */}
        <div className="header__logo">
          <Link to="/" className="logo">
            <div className="logo__icon">
              <i className="fas fa-heartbeat"></i>
            </div>
            <span className="logo__text">MediCare</span>
          </Link>
        </div>

        <div className="header__search">
          <form className="search-form" onSubmit={handleSearchSubmit}>
            <div className="search-container">
              <input 
                type="text" 
                className="search-input" 
                placeholder="Search doctors, specialties, or services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="search-btn">
                <i className="fas fa-search"></i>
              </button>
            </div>
          </form>
        </div>

        <nav className={`nav ${isMenuOpen ? 'nav--open' : ''}`}>
          <ul className="nav__list">
            <li className="nav__item">
              <Link to="/home" className="nav__link" onClick={() => setIsMenuOpen(false)}>
                <i className="fas fa-home"></i>
                <span>Home</span>
              </Link>
            </li>
            <li className="nav__item">
              <Link to="/about" className="nav__link" onClick={() => setIsMenuOpen(false)}>
                <i className="fas fa-info-circle"></i>
                <span>About</span>
              </Link>
            </li>
            <li className="nav__item">
              <Link to="/services" className="nav__link" onClick={() => setIsMenuOpen(false)}>
                <i className="fas fa-stethoscope"></i>
                <span>Services</span>
              </Link>
            </li>
            <li className="nav__item">
              <Link to="/doctors" className="nav__link" onClick={() => setIsMenuOpen(false)}>
                <i className="fas fa-user-md"></i>
                <span>Doctors</span>
              </Link>
            </li>
            <li className="nav__item">
              <Link to="/contact" className="nav__link" onClick={() => setIsMenuOpen(false)}>
                <i className="fas fa-phone-alt"></i>
                <span>Contact</span>
              </Link>
            </li>
          </ul>
        </nav>

        <button 
          className={`hamburger ${isMenuOpen ? 'hamburger--active' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span className="hamburger__line"></span>
          <span className="hamburger__line"></span>
          <span className="hamburger__line"></span>
        </button>
      </div>
    </header>
  );
};

export default Header;