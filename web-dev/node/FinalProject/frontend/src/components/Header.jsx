import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCartAsync } from '../redux/cartSlice';
import '../styles/Header.css';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const [searchActive, setSearchActive] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  
  // Get cart items from Redux store
  const cart = useSelector(state => state.cart.items);
  const cartItemCount = cart.length;

  // Fetch cart on component mount to ensure count is accurate
  useEffect(() => {
    dispatch(fetchCartAsync());
  }, [dispatch]);

  const toggleSearch = () => {
    setSearchActive(!searchActive);
    if (searchActive) {
      setSearchValue('');
    }
  };

  const handleNavigation = (path, e) => {
    if (e) {
      e.preventDefault();
    }
    navigate(path);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      // Navigate to products with search query
      navigate(`/products?search=${encodeURIComponent(searchValue)}`);
      setSearchActive(false);
    }
  };

  // Check if current path is active
  const isActive = (path) => {
    if (path === '/home') {
      return location.pathname === '/' || location.pathname === '/home';
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <>
      <nav className="navbar">
        <div className="nav-container">
          {/* Logo and Brand */}
          <div 
            className="brand" 
            onClick={(e) => handleNavigation('/home', e)} 
            style={{ cursor: 'pointer' }}
          >
            <div className="logo">
              <i className="fas fa-ring"></i>
            </div>
            <span className="brand-name">Respawn Hub</span>
          </div>

          {/* Navigation Links */}
          <div className="nav-links">
            <button 
              onClick={(e) => handleNavigation('/home', e)} 
              className={`nav-link ${isActive('/home') ? 'active' : ''}`}
            >
              <i className="fas fa-home"></i>
              <span>Home</span>
            </button>
            <button 
              onClick={(e) => handleNavigation('/products', e)} 
              className={`nav-link ${isActive('/products') ? 'active' : ''}`}
            >
              <i className="fas fa-gamepad"></i>
              <span>Products</span>
            </button>
            <button 
              onClick={(e) => handleNavigation('/news', e)} 
              className={`nav-link ${isActive('/news') ? 'active' : ''}`}
            >
              <i className="fas fa-newspaper"></i>
              <span>News</span>
            </button>
            <button 
              onClick={(e) => handleNavigation('/support', e)} 
              className={`nav-link ${isActive('/support') ? 'active' : ''}`}
            >
              <i className="fas fa-headset"></i>
              <span>Support</span>
            </button>
            <button 
              onClick={(e) => handleNavigation('/cart', e)} 
              className={`nav-link ${isActive('/cart') ? 'active' : ''}`}
            >
              <div className="navbar-cart-icon-wrapper">
                <i className="fas fa-shopping-cart"></i>
                {cartItemCount > 0 && (
                  <span className="navbar-cart-count-badge">{cartItemCount}</span>
                )}
              </div>
              <span>Cart</span>
            </button>
          </div>

          {/* Right Side Actions */}
          <div className="nav-actions">
            <form onSubmit={handleSearch} className={`search-wrapper ${searchActive ? 'active' : ''}`}>
              <input
                type="text"
                className="search-input"
                placeholder="Search games..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
              <button type="button" className="search-btn" onClick={toggleSearch}>
                <i className="fas fa-search"></i>
              </button>
            </form>
            
            <button 
              className="profile-btn"
              onClick={(e) => handleNavigation('/userprofile', e)}
            >
              <i className="fas fa-user"></i>
            </button>
          </div>
        </div>
      </nav>
      
      <div className="content-spacer"></div>
    </>
  );
}

export default Header;