import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import backendUrl from '../utils/BackendURL'; // Import your backend URL
import '../styles/Header.css';

const Header = () => {
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const profileMenuRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Debounce timer for search
  const searchTimeoutRef = useRef(null);

  // Helper function to check if URL is a Cloudinary URL
  const isCloudinaryUrl = (url) => {
    return url && (url.startsWith('https://res.cloudinary.com') || url.startsWith('http://res.cloudinary.com'));
  };

  // Helper function to get correct image URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    
    // If it's a Cloudinary URL, return as-is
    if (isCloudinaryUrl(imageUrl)) {
      return imageUrl;
    }
    
    // If it's a relative path (legacy), prepend backend URL
    return `${backendUrl}${imageUrl}`;
  };

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

  // Combined click-outside handler for both search suggestions and profile menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Handle search suggestions
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
      
      // Handle profile menu
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
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

  // Fetch search suggestions
  const fetchSearchSuggestions = async (query) => {
    if (!query.trim() || query.length < 2) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearchLoading(true);

    try {
      const response = await fetch(`${backendUrl}/api/doctors/search?q=${encodeURIComponent(query)}&limit=8`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();
      console.log('Search suggestions response:', data);

      if (data.success) {
        const suggestions = [];

        // Add specialization suggestions
        if (data.data.specializations && data.data.specializations.length > 0) {
          data.data.specializations.forEach(spec => {
            suggestions.push({
              type: 'specialization',
              value: spec,
              label: `${formatSpecializationDisplay(spec)} (Specialty)`,
              icon: 'fas fa-stethoscope'
            });
          });
        }

        // Add doctor suggestions - FIXED: Include profileImage
        if (data.data.doctors && data.data.doctors.length > 0) {
          data.data.doctors.forEach(doctor => {
            console.log('Doctor data:', doctor); // Debug log
            suggestions.push({
              type: 'doctor',
              value: doctor._id,
              label: `Dr. ${doctor.name}`,
              subtitle: formatSpecializationDisplay(doctor.specialization),
              location: doctor.practiceLocations?.[0]?.address?.city,
              rating: doctor.ratings?.average,
              icon: 'fas fa-user-md',
              profileImage: doctor.profileImage // FIXED: Add profileImage
            });
          });
        }

        // Add city suggestions if any
        if (data.data.cities && data.data.cities.length > 0) {
          data.data.cities.forEach(city => {
            suggestions.push({
              type: 'city',
              value: city,
              label: `Doctors in ${city}`,
              icon: 'fas fa-map-marker-alt'
            });
          });
        }

        console.log('Processed suggestions:', suggestions); // Debug log
        setSearchSuggestions(suggestions);
        setShowSuggestions(suggestions.length > 0);
      }
    } catch (error) {
      console.error('Search suggestions error:', error);
      setSearchSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsSearchLoading(false);
    }
  };

  // Handle search input change with debouncing
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      fetchSearchSuggestions(query);
    }, 300);
  };

  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      performSearch(searchQuery.trim());
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setSearchQuery('');
    setShowSuggestions(false);
    
    switch (suggestion.type) {
      case 'doctor':
        navigate(`/doctor/${suggestion.value}`);
        break;
      case 'specialization':
        navigate(`/doctors?specialization=${encodeURIComponent(suggestion.value)}`);
        break;
      case 'city':
        navigate(`/doctors?city=${encodeURIComponent(suggestion.value)}`);
        break;
      default:
        performSearch(suggestion.label);
    }
  };

  // Perform search and navigate to doctors page
  const performSearch = (query) => {
    // Check if query matches a specialization
    const specializations = [
      'cardiology', 'dermatology', 'neurology', 'pediatrics', 
      'orthopedics', 'psychiatry', 'general', 'gynecology',
      'ophthalmology', 'dentistry', 'other'
    ];

    const matchedSpec = specializations.find(spec => 
      spec.toLowerCase().includes(query.toLowerCase()) ||
      formatSpecializationDisplay(spec).toLowerCase().includes(query.toLowerCase())
    );

    if (matchedSpec) {
      navigate(`/doctors?specialization=${encodeURIComponent(matchedSpec)}`);
    } else {
      // General search - navigate to doctors page with search query
      navigate(`/doctors?search=${encodeURIComponent(query)}`);
    }
    
    setSearchQuery('');
    setShowSuggestions(false);
  };

  // Format specialization for display
  const formatSpecializationDisplay = (specialization) => {
    const specializations = {
      'cardiology': 'Cardiologist',
      'dermatology': 'Dermatologist',
      'neurology': 'Neurologist',
      'pediatrics': 'Pediatrician',
      'orthopedics': 'Orthopedic Surgeon',
      'psychiatry': 'Psychiatrist',
      'general': 'General Physician',
      'gynecology': 'Gynecologist',
      'ophthalmology': 'Ophthalmologist',
      'dentistry': 'Dentist',
      'other': 'Specialist'
    };
    return specializations[specialization] || specialization;
  };

  // Handle keyboard navigation in suggestions
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSearchQuery('');
    }
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

        {/* Enhanced Search */}
        <div className="header__search" ref={searchRef}>
          <form className="search-form" onSubmit={handleSearchSubmit}>
            <div className="search-container">
              <input 
                type="text" 
                className="search-input" 
                placeholder="Search doctors, specialties, or locations..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => {
                  if (searchSuggestions.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                onKeyDown={handleKeyDown}
                autoComplete="off"
              />
              <button type="submit" className="search-btn" disabled={isSearchLoading}>
                <i className={`fas ${isSearchLoading ? 'fa-spinner fa-spin' : 'fa-search'}`}></i>
              </button>
              
              {/* Search Suggestions Dropdown */}
              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="search-suggestions">
                  <div className="suggestions-header">
                    <span>Search Suggestions</span>
                    <button 
                      type="button" 
                      className="close-suggestions"
                      onClick={() => setShowSuggestions(false)}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                  <ul className="suggestions-list">
                    {searchSuggestions.map((suggestion, index) => (
                      <li 
                        key={`${suggestion.type}-${suggestion.value}-${index}`}
                        className="suggestion-item"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        <div className="suggestion-icon">
                          {/* FIXED: Use getImageUrl helper for proper URL handling */}
                          {suggestion.type === 'doctor' && suggestion.profileImage ? (
                            <img 
                              src={getImageUrl(suggestion.profileImage)} 
                              alt={suggestion.label}
                              className="suggestion-profile-image"
                              onError={(e) => {
                                // Fallback to icon if image fails to load
                                console.log('Image failed to load:', suggestion.profileImage);
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'inline';
                              }}
                            />
                          ) : null}
                          <i 
                            className={suggestion.icon}
                            style={{ 
                              display: suggestion.type === 'doctor' && suggestion.profileImage ? 'none' : 'inline' 
                            }}
                          ></i>
                        </div>
                        <div className="suggestion-content">
                          <div className="suggestion-main">
                            <span className="suggestion-label">{suggestion.label}</span>
                            {suggestion.type === 'doctor' && suggestion.rating && (
                              <div className="suggestion-rating">
                                <i className="fas fa-star"></i>
                                <span>{suggestion.rating.toFixed(1)}</span>
                              </div>
                            )}
                          </div>
                          {suggestion.subtitle && (
                            <div className="suggestion-subtitle">
                              {suggestion.subtitle}
                              {suggestion.location && ` • ${suggestion.location}`}
                            </div>
                          )}
                        </div>
                        <div className="suggestion-arrow">
                          <i className="fas fa-arrow-right"></i>
                        </div>
                      </li>
                    ))}
                  </ul>
                  
                  {/* View All Results */}
                  {searchQuery.trim() && (
                    <div className="suggestions-footer">
                      <button 
                        type="button"
                        className="view-all-btn"
                        onClick={() => performSearch(searchQuery.trim())}
                      >
                        <i className="fas fa-search"></i>
                        View all results for "{searchQuery}"
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              {/* No Results Message */}
              {showSuggestions && searchSuggestions.length === 0 && searchQuery.trim() && !isSearchLoading && (
                <div className="search-suggestions">
                  <div className="no-suggestions">
                    <i className="fas fa-search"></i>
                    <p>No suggestions found</p>
                    <button 
                      type="button"
                      className="search-anyway-btn"
                      onClick={() => performSearch(searchQuery.trim())}
                    >
                      Search for "{searchQuery}" anyway
                    </button>
                  </div>
                </div>
              )}
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
          </ul>
        </nav>

        {/* Authentication Section */}
        <div className="header__auth">
          {isLoggedIn ? (
            <div 
              className="user-profile" 
              onClick={toggleProfileMenu}
              ref={profileMenuRef}
            >
              <div className="profile-avatar">
                {/* FIXED: Also apply proper image URL handling for user profile in header */}
                {user?.profileImage ? (
                  <img 
                    src={getImageUrl(user.profileImage)} 
                    alt={user.name}
                    className="profile-avatar-image"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'inline';
                    }}
                  />
                ) : null}
                <i 
                  className={`fas ${user?.userType === 'doctor' ? 'fa-user-md' : 'fa-user'}`}
                  style={{ display: user?.profileImage ? 'none' : 'inline' }}
                ></i>
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