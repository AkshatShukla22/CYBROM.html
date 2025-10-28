import React, { useState, useEffect, useRef } from 'react';
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
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  
  const searchRef = useRef(null);
  
  const cart = useSelector(state => state.cart.items);
  const cartItemCount = cart.length;

  useEffect(() => {
    dispatch(fetchCartAsync());
  }, [dispatch]);

  useEffect(() => {
    checkAuth();
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/verify', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(true);
        
        const userResponse = await fetch('http://localhost:5000/api/auth/user', {
          credentials: 'include'
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUserProfile(userData.user);
        }
      } else {
        setIsAuthenticated(false);
        setUserProfile(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
      setUserProfile(null);
    }
  };

  const toggleSearch = () => {
    setSearchActive(!searchActive);
    if (searchActive) {
      setSearchValue('');
      setShowSuggestions(false);
      setSearchSuggestions([]);
    }
  };

  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearchValue(value);

    if (value.trim().length < 2) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoadingSuggestions(true);
    setShowSuggestions(true);

    try {
      const response = await fetch(
        `http://localhost:5000/api/user/games/filter?search=${encodeURIComponent(value)}&sortBy=popularity`,
        { credentials: 'include' }
      );
      
      if (response.ok) {
        const data = await response.json();
        setSearchSuggestions(data.games.slice(0, 5));
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoadingSuggestions(false);
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
      navigate(`/products?search=${encodeURIComponent(searchValue)}`);
      setSearchActive(false);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (gameId) => {
    navigate(`/game/${gameId}`);
    setSearchActive(false);
    setShowSuggestions(false);
    setSearchValue('');
  };

  const isActive = (path) => {
    if (path === '/home') {
      return location.pathname === '/' || location.pathname === '/home';
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={`full-${i}`} className="fas fa-star"></i>);
    }
    if (hasHalfStar) {
      stars.push(<i key="half" className="fas fa-star-half-alt"></i>);
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<i key={`empty-${i}`} className="far fa-star"></i>);
    }
    return stars;
  };

  // Helper function to get the image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-game.jpg';
    // Check if it's already a full URL
    if (imagePath.startsWith('http')) return imagePath;
    // Check if it already has /uploads/ prefix
    if (imagePath.startsWith('/uploads/')) return `http://localhost:5000${imagePath}`;
    // Otherwise, add the full path
    return `http://localhost:5000/uploads/${imagePath}`;
  };

  return (
    <>
      <nav className="navbar">
        <div className="nav-container">
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

          <div className="nav-actions">
            <div ref={searchRef} className={`search-wrapper ${searchActive ? 'active' : ''}`}>
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search games, genres, categories..."
                  value={searchValue}
                  onChange={handleSearchChange}
                  onFocus={() => searchValue.trim().length >= 2 && setShowSuggestions(true)}
                />
                <button type="button" className="search-btn" onClick={toggleSearch}>
                  <i className="fas fa-search"></i>
                </button>
              </form>

              {showSuggestions && searchActive && (
                <div className="search-suggestions">
                  {loadingSuggestions ? (
                    <div className="suggestion-loading">
                      <i className="fas fa-spinner fa-spin"></i>
                      <span>Searching...</span>
                    </div>
                  ) : searchSuggestions.length > 0 ? (
                    <>
                      {searchSuggestions.map((game) => (
                        <div
                          key={game._id}
                          className="suggestion-item"
                          onClick={() => handleSuggestionClick(game._id)}
                        >
                          <div className="suggestion-image">
                            <img 
                              src={getImageUrl(game.coverImage)} 
                              alt={game.name}
                              onError={(e) => {
                                e.target.src = '/placeholder-game.jpg';
                              }}
                            />
                          </div>
                          <div className="suggestion-details">
                            <div className="suggestion-name">{game.name}</div>
                            <div className="suggestion-rating">
                              {renderStars(game.averageRating || 0)}
                              <span className="rating-value">
                                {(game.averageRating || 0).toFixed(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="suggestion-view-all" onClick={handleSearch}>
                        <i className="fas fa-search"></i>
                        <span>View all results for "{searchValue}"</span>
                      </div>
                    </>
                  ) : (
                    <div className="suggestion-empty">
                      <i className="fas fa-search"></i>
                      <span>No games found</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {isAuthenticated ? (
              <button 
                className="profile-btn"
                onClick={(e) => handleNavigation('/userprofile', e)}
                title={userProfile?.username || 'Profile'}
              >
                {userProfile?.profilePicUrl ? (
                  <img 
                    src={`http://localhost:5000${userProfile.profilePicUrl}`}
                    alt="Profile"
                    className="profile-pic"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <i className="fas fa-user" style={{ display: userProfile?.profilePicUrl ? 'none' : 'block' }}></i>
              </button>
            ) : (
              <button 
                className="login-btn"
                onClick={(e) => handleNavigation('/login', e)}
              >
                <i className="fas fa-sign-in-alt"></i>
                <span>Login</span>
              </button>
            )}
          </div>
        </div>
      </nav>
      
      <div className="content-spacer"></div>
    </>
  );
}

export default Header;