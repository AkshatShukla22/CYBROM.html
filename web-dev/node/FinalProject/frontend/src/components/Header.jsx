import React, { useState } from 'react';
import '../styles/Header.css';

const Header = () => {
  const [searchActive, setSearchActive] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const toggleSearch = () => {
    setSearchActive(!searchActive);
    if (searchActive) {
      setSearchValue('');
    }
  };

  return (
    <>
      {/* Font Awesome CDN */}
      <link 
        rel="stylesheet" 
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />

      <nav className="navbar">
        <div className="nav-container">
          {/* Logo and Brand */}
          <div className="brand">
            <div className="logo">
              <i className="fas fa-gamepad"></i>
            </div>
            <span className="brand-name">Respawn Hub</span>
          </div>

          {/* Navigation Links */}
          <div className="nav-links">
            <a href="home" className="nav-link">
              <i className="fas fa-home"></i>
              <span>Home</span>
            </a>
            <a href="products" className="nav-link">
              <i className="fas fa-box"></i>
              <span>Products</span>
            </a>
            <a href="news" className="nav-link">
              <i className="fas fa-newspaper"></i>
              <span>News</span>
            </a>
            <a href="support" className="nav-link">
              <i className="fas fa-headset"></i>
              <span>Support</span>
            </a>
            <a href="cart" className="nav-link">
              <i className="fas fa-shopping-cart"></i>
              <span>Cart</span>
            </a>
          </div>

          {/* Right Side Actions */}
          <div className="nav-actions">
            <div className={`search-wrapper ${searchActive ? 'active' : ''}`}>
              <input
                type="text"
                className="search-input"
                placeholder="Search games..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
              <button className="search-btn" onClick={toggleSearch}>
                <i className="fas fa-search"></i>
              </button>
            </div>
            
            <button className="profile-btn">
              <i className="fas fa-user"></i>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}

export default Header;