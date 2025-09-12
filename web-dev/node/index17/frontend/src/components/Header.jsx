import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    console.log('Search query:', searchQuery);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    setShowProfileMenu(false);
  };

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
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
            {/* <li className="nav__item">
              <Link to="/about" className="nav__link" onClick={() => setIsMenuOpen(false)}>
                <i className="fas fa-info-circle"></i>
                <span>About</span>
              </Link>
            </li> */}
            <li className="nav__item">
              <Link to="/messages" className="nav__link" onClick={() => setIsMenuOpen(false)}>
                <i className="fa-solid fa-message"></i>
                <span>Messages</span>
              </Link>
            </li>
            <li className="nav__item">
              <Link to="/doctors" className="nav__link" onClick={() => setIsMenuOpen(false)}>
                <i className="fas fa-user-md"></i>
                <span>Doctors</span>
              </Link>
            </li>
            {/* <li className="nav__item">
              <Link to="/contact" className="nav__link" onClick={() => setIsMenuOpen(false)}>
                <i className="fas fa-phone-alt"></i>
                <span>Contact</span>
              </Link>
            </li> */}
          </ul>
        </nav>

        {/* Authentication Section */}
        <div className="header__auth">
          {isLoggedIn ? (
            <div className="user-profile" onClick={toggleProfileMenu}>
              <div className="profile-avatar">
                <i className={`fas ${user?.userType === 'doctor' ? 'fa-user-md' : 'fa-user'}`}></i>
              </div>
              <span className="profile-name">{user?.name}</span>
              <i className="fas fa-chevron-down profile-arrow"></i>
              
              {showProfileMenu && (
                <div className="profile-menu">
                  <div className="profile-menu-header">
                    <div className="profile-info">
                      <h4>{user?.name}</h4>
                      <p>{user?.email}</p>
                      <span className="user-type">{user?.userType}</span>
                    </div>
                  </div>
                  <ul className="profile-menu-list">
                    <li>
                      <Link to="/profile" onClick={() => setShowProfileMenu(false)}>
                        <i className="fas fa-user"></i>
                        Profile
                      </Link>
                    </li>
                    {user?.userType === 'doctor' && (
                      <>
                        <li>
                          <Link to="/dashboard" onClick={() => setShowProfileMenu(false)}>
                            <i className="fas fa-tachometer-alt"></i>
                            Dashboard
                          </Link>
                        </li>
                        <li>
                          <Link to="/appointments" onClick={() => setShowProfileMenu(false)}>
                            <i className="fas fa-calendar-check"></i>
                            Appointments
                          </Link>
                        </li>
                      </>
                    )}
                    {user?.userType === 'user' && (
                      <li>
                        <Link to="/appointments" onClick={() => setShowProfileMenu(false)}>
                          <i className="fas fa-calendar-alt"></i>
                          My Appointments
                        </Link>
                      </li>
                    )}
                    <li>
                      <Link to="/settings" onClick={() => setShowProfileMenu(false)}>
                        <i className="fas fa-cog"></i>
                        Settings
                      </Link>
                    </li>
                    <li>
                      <button onClick={handleLogout} className="logout-btn">
                        <i className="fas fa-sign-out-alt"></i>
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="login-btn">
              <i className="fas fa-sign-in-alt"></i>
              <span>Login</span>
            </Link>
          )}
        </div>

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