import React, { useState, useCallback, useEffect, useRef } from 'react';
import '../styles/FilterSidebar.css';
import '../styles/Doctors.css';

const FilterSidebar = ({
  filters,
  userLocation,
  onFilterChange,
  onSortChange,
  onClearFilters,
  sortBy,
  sortOrder,
  backendUrl
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [minFee, setMinFee] = useState('');
  const [maxFee, setMaxFee] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [cityResults, setCityResults] = useState([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [isSearchingCities, setIsSearchingCities] = useState(false);
  
  // New states for sticky behavior
  const [isSticky, setIsSticky] = useState(true);
  const [sidebarHeight, setSidebarHeight] = useState(0);
  const sidebarRef = useRef(null);

  // Specialization options - Enhanced
  const specializationOptions = [
    { value: 'cardiology', label: 'Cardiology', icon: 'fa-heart' },
    { value: 'dermatology', label: 'Dermatology', icon: 'fa-user-md' },
    { value: 'neurology', label: 'Neurology', icon: 'fa-brain' },
    { value: 'pediatrics', label: 'Pediatrics', icon: 'fa-baby' },
    { value: 'orthopedics', label: 'Orthopedics', icon: 'fa-bone' },
    { value: 'psychiatry', label: 'Psychiatry', icon: 'fa-user-friends' },
    { value: 'general', label: 'General Practice', icon: 'fa-hospital' },
    { value: 'gynecology', label: 'Gynecology', icon: 'fa-female' },
    { value: 'ophthalmology', label: 'Ophthalmology', icon: 'fa-eye' },
    { value: 'dentistry', label: 'Dentistry', icon: 'fa-tooth' },
    { value: 'other', label: 'Other', icon: 'fa-microscope' }
  ];

  // Rating options
  const ratingOptions = [
    { value: '4.8', label: '4.8+' },
    { value: '4.5', label: '4.5+' },
    { value: '4.0', label: '4.0+' },
    { value: '3.5', label: '3.5+' }
  ];

  // Experience options
  const experienceOptions = [
    { value: '1', label: '1+ Years' },
    { value: '3', label: '3+ Years' },
    { value: '5', label: '5+ Years' },
    { value: '10', label: '10+ Years' },
    { value: '15', label: '15+ Years' }
  ];

  // Sorting options
  const sortOptions = [
    { value: 'ratings.average|desc', label: 'Highest Rated' },
    { value: 'ratings.average|asc', label: 'Lowest Rated' },
    { value: 'experience|desc', label: 'Most Experienced' },
    { value: 'experience|asc', label: 'Least Experienced' },
    { value: 'consultationFee|asc', label: 'Lowest Fee' },
    { value: 'consultationFee|desc', label: 'Highest Fee' },
    { value: 'totalAppointments|desc', label: 'Most Popular' }
  ];

  // New useEffect for handling sticky behavior and updating page layout class
  useEffect(() => {
    const handleScroll = () => {
      if (!sidebarRef.current) return;

      const sidebar = sidebarRef.current;
      const footer = document.querySelector('footer');
      
      if (!footer) {
        setIsSticky(true);
        return;
      }

      const sidebarRect = sidebar.getBoundingClientRect();
      const footerRect = footer.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate if sidebar would overlap with footer
      const sidebarBottom = sidebarRect.top + sidebarRect.height;
      const footerTop = footerRect.top;
      
      // If footer is visible and would overlap with fixed sidebar
      if (footerTop < windowHeight && footerTop < sidebarBottom) {
        setIsSticky(false);
      } else {
        setIsSticky(true);
      }
    };

    const handleResize = () => {
      if (sidebarRef.current) {
        setSidebarHeight(sidebarRef.current.offsetHeight);
      }
    };

    // Update page layout class based on collapsed state
    const doctorsPage = document.querySelector('.doctors-page');
    if (doctorsPage) {
      if (isCollapsed) {
        doctorsPage.classList.add('sidebar-collapsed');
      } else {
        doctorsPage.classList.remove('sidebar-collapsed');
      }
    }

    // Set initial sidebar height
    handleResize();

    // Add event listeners
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    
    // Call once on mount
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [isCollapsed]); // Re-run when sidebar expands/collapses

  // Search cities function
  const searchCities = async (query) => {
    if (!query || query.length < 2) {
      setCityResults([]);
      setShowCityDropdown(false);
      return;
    }

    setIsSearchingCities(true);
    try {
      const response = await fetch(`${backendUrl}/api/doctors/search-cities?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (data.success) {
        setCityResults(data.data.cities);
        setShowCityDropdown(data.data.cities.length > 0);
      } else {
        setCityResults([]);
        setShowCityDropdown(false);
      }
    } catch (error) {
      console.error('Error searching cities:', error);
      setCityResults([]);
      setShowCityDropdown(false);
    }
    setIsSearchingCities(false);
  };

  // Debounced city search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchCities(citySearch);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [citySearch, backendUrl]);

  // Handle city search input change
  const handleCitySearchChange = (e) => {
    setCitySearch(e.target.value);
  };

  // Handle city selection
  const handleCitySelect = (city) => {
    setCitySearch(city);
    setShowCityDropdown(false);
    onFilterChange('city', city);
  };

  // Clear city search
  const clearCitySearch = () => {
    setCitySearch('');
    setCityResults([]);
    setShowCityDropdown(false);
    onFilterChange('city', '');
  };

  // Handle search button click
  const handleSearchButtonClick = () => {
    if (citySearch && citySearch.trim() !== '') {
      onFilterChange('city', citySearch.trim());
      setShowCityDropdown(false);
    }
  };

  // Handle Enter key press in search input
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchButtonClick();
    }
  };

  // Memoized handlers to prevent unnecessary re-renders
  const handleSortChange = useCallback((value) => {
    const [field, order] = value.split('|');
    onSortChange(field, order);
  }, [onSortChange]);

  const getCurrentSortValue = useCallback(() => {
    return `${sortBy}|${sortOrder}`;
  }, [sortBy, sortOrder]);

  const handleCustomFeeRange = useCallback(() => {
    const filters = {};
    if (minFee) filters.minFee = minFee;
    if (maxFee) filters.maxFee = maxFee;
    
    Object.keys(filters).forEach(key => {
      onFilterChange(key, filters[key]);
    });
  }, [minFee, maxFee, onFilterChange]);

  const getActiveFiltersCount = useCallback(() => {
    return Object.values(filters).filter(value => value && value !== false).length;
  }, [filters]);

  const handleRatingClick = useCallback((rating) => {
    onFilterChange('minRating', filters.minRating === rating ? '' : rating);
  }, [filters.minRating, onFilterChange]);

  // FIXED: Handle local doctor toggle with better error handling
  const handleLocationToggle = useCallback(() => {
    console.log('Toggling showLocalOnly');
    console.log('Current filters.showLocalOnly:', filters.showLocalOnly);
    console.log('User location:', userLocation);
    
    const newValue = !filters.showLocalOnly;
    
    // If enabling local filter but no user city available, show warning and don't enable
    if (newValue && (!userLocation || !userLocation.city)) {
      alert('Please add your city to your profile to use the local doctors filter.');
      return;
    }
    
    console.log('Setting showLocalOnly to:', newValue);
    onFilterChange('showLocalOnly', newValue);
    
    // IMPORTANT: Pass the user's city to the backend when enabling local filter
    if (newValue && userLocation && userLocation.city) {
      console.log('Setting userCity for local filter:', userLocation.city);
      onFilterChange('userCity', userLocation.city);
    } else {
      // Clear userCity when disabling local filter
      console.log('Clearing userCity');
      onFilterChange('userCity', '');
    }
  }, [filters.showLocalOnly, onFilterChange, userLocation]);

  const handleCollapseToggle = useCallback(() => {
    setIsCollapsed(!isCollapsed);
  }, [isCollapsed]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.city-search-container')) {
        setShowCityDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div 
      ref={sidebarRef}
      className={`filter-sidebar ${isCollapsed ? 'collapsed' : ''} ${isSticky ? 'sticky' : 'scroll-with-footer'}`}
    >
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <div className="header-content">
          {!isCollapsed && (
            <>
              <h3>Filters & Sorting</h3>
              {getActiveFiltersCount() > 0 && (
                <span className="filter-count">{getActiveFiltersCount()}</span>
              )}
            </>
          )}
          {isCollapsed && (
            <div className="collapsed-header">
              <span className="collapsed-title">F</span>
              {getActiveFiltersCount() > 0 && (
                <span className="filter-count">{getActiveFiltersCount()}</span>
              )}
            </div>
          )}
        </div>
        <button 
          className="collapse-btn"
          onClick={handleCollapseToggle}
          title={isCollapsed ? 'Expand filters' : 'Collapse filters'}
        >
          <i className={`fas ${isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
        </button>
      </div>

      {!isCollapsed && (
        <div className="sidebar-content">
          {/* Clear Filters */}
          <div className="filter-actions">
            <button 
              className="clear-filters-btn" 
              onClick={onClearFilters}
              disabled={getActiveFiltersCount() === 0}
            >
              <i className="fas fa-undo"></i>
              Clear All ({getActiveFiltersCount()})
            </button>
          </div>

          {/* Sorting */}
          <div className="filter-section">
            <h4>
              <i className="fas fa-sort"></i>
              Sort By
            </h4>
            <select 
              value={getCurrentSortValue()}
              onChange={(e) => handleSortChange(e.target.value)}
              className="filter-select modern-select"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Location Section */}
          <div className="filter-section">
            <h4>
              <i className="fas fa-map-marker-alt"></i>
              Location
            </h4>
            
            {/* City Search with Search Button */}
            <div className="city-search-container">
              <div className="city-search-input-wrapper">
                <div className="city-input-container">
                  <input
                    type="text"
                    className={`filter-select city-search-input ${citySearch ? 'has-clear-btn' : ''}`}
                    placeholder="Search city..."
                    value={citySearch}
                    onChange={handleCitySearchChange}
                    onKeyPress={handleSearchKeyPress}
                  />
                  {citySearch && (
                    <button 
                      className="clear-city-btn"
                      onClick={clearCitySearch}
                      title="Clear city search"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  )}
                </div>
                
                {/* Search Button */}
                <button 
                  className={`city-search-btn ${citySearch && !isSearchingCities ? 'enabled' : 'disabled'}`}
                  onClick={handleSearchButtonClick}
                  disabled={!citySearch || citySearch.trim() === '' || isSearchingCities}
                  title="Search for city"
                >
                  {isSearchingCities ? (
                    <i className="fas fa-spinner fa-spin"></i>
                  ) : (
                    <>
                      <i className="fas fa-search"></i>
                      Search
                    </>
                  )}
                </button>
              </div>
              
              {/* City Dropdown */}
              {showCityDropdown && (
                <div className="city-dropdown">
                  {cityResults.length > 0 ? (
                    cityResults.map((city, index) => (
                      <div 
                        key={index}
                        className={`city-option ${index < cityResults.length - 1 ? 'has-border' : ''}`}
                        onClick={() => handleCitySelect(city)}
                      >
                        <i className="fas fa-map-marker-alt"></i>
                        {city}
                      </div>
                    ))
                  ) : (
                    <div className="city-no-results">
                      No cities found
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Local Doctors Checkbox - FIXED: Better handling for no user location */}
            <div className="checkbox-filter">
              <label className={`checkbox-label ${(!userLocation || !userLocation.city) ? 'disabled' : ''}`}>
                <input
                  type="checkbox"
                  checked={filters.showLocalOnly || false}
                  onChange={handleLocationToggle}
                  disabled={!userLocation || !userLocation.city}
                />
                <span className="sidebar-checkmark"></span>
                {userLocation && userLocation.city ? (
                  <>Doctors from my city ({userLocation.city})</>
                ) : (
                  <>Doctors from my city (Add city to profile)</>
                )}
              </label>
              {(!userLocation || !userLocation.city) && (
                <div className="filter-note">
                  <small style={{ color: '#666', fontSize: '12px' }}>
                    Add your city to your profile to use this filter
                  </small>
                </div>
              )}
            </div>

            {/* Selected City Display */}
            {filters.city && (
              <div className="selected-city">
                <span className="selected-city-name">
                  <i className="fas fa-map-marker-alt"></i>
                  {filters.city}
                </span>
                <button 
                  className="remove-city-btn"
                  onClick={() => onFilterChange('city', '')}
                  title="Remove city filter"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            )}
          </div>

          {/* Specialization Filter */}
          <div className="filter-section">
            <h4>
              <i className="fas fa-stethoscope"></i>
              Specialization
            </h4>
            <select 
              value={filters.specialization || ''}
              onChange={(e) => onFilterChange('specialization', e.target.value)}
              className="filter-select modern-select specialization-select"
            >
              <option value="">All Specializations</option>
              {specializationOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            {/* Specialization quick buttons */}
            <div className="specialization-buttons">
              {['cardiology', 'dermatology', 'neurology', 'pediatrics'].map(spec => (
                <button 
                  key={spec}
                  className={`spec-btn ${filters.specialization === spec ? 'active' : ''}`}
                  onClick={() => onFilterChange('specialization', 
                    filters.specialization === spec ? '' : spec
                  )}
                >
                  <i className={`fas ${specializationOptions.find(s => s.value === spec)?.icon || 'fa-medical'}`}></i>
                  {spec.charAt(0).toUpperCase() + spec.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Rating Filter */}
          <div className="filter-section">
            <h4>
              <i className="fas fa-star"></i>
              Rating
            </h4>
            
            <div className="rating-buttons-grid">
              {ratingOptions.map(rating => (
                <button 
                  key={rating.value}
                  className={`rating-btn ${filters.minRating === rating.value ? 'active' : ''}`}
                  onClick={() => handleRatingClick(rating.value)}
                >
                  {rating.label} <i className="fas fa-star"></i>
                </button>
              ))}
            </div>
          </div>

          {/* Experience Filter */}
          <div className="filter-section">
            <h4>
              <i className="fas fa-graduation-cap"></i>
              Experience
            </h4>
            <select 
              value={filters.experience || ''}
              onChange={(e) => onFilterChange('experience', e.target.value)}
              className="filter-select modern-select"
            >
              <option value="">Any Experience</option>
              {experienceOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            {/* Experience slider */}
            <div className="experience-slider">
              <input
                type="range"
                min="0"
                max="25"
                value={filters.experience || 0}
                onChange={(e) => onFilterChange('experience', e.target.value || '')}
                className="slider"
              />
              <div className="slider-labels">
                <span>0 years</span>
                <span>{filters.experience || 0}+ years</span>
                <span>25+ years</span>
              </div>
            </div>
          </div>

          {/* Fee Range */}
          <div className="filter-section">
            <h4>
              <i className="fas fa-money-bill-wave"></i>
              Fee Range
            </h4>
            <div className="fee-range-container">
              <div className="fee-range-inputs">
                <input
                  type="number"
                  placeholder="Min ₹"
                  className="fee-input"
                  min="0"
                  step="100"
                  value={minFee}
                  onChange={(e) => setMinFee(e.target.value)}
                />
                <span className="range-separator">to</span>
                <input
                  type="number"
                  placeholder="Max ₹"
                  className="fee-input"
                  min="0"
                  step="100"
                  value={maxFee}
                  onChange={(e) => setMaxFee(e.target.value)}
                />
              </div>
              <button 
                className="apply-fee-range-btn"
                onClick={handleCustomFeeRange}
                disabled={!minFee && !maxFee}
              >
                Apply Range
              </button>
            </div>

            {/* Active Fee Range Display */}
            {(filters.minFee || filters.maxFee) && (
              <div className="active-fee-range">
                <span className="fee-range-value">
                  {filters.minFee ? `₹${filters.minFee}` : '₹0'} - {filters.maxFee ? `₹${filters.maxFee}` : '∞'}
                </span>
                <button 
                  className="remove-fee-range-btn"
                  onClick={() => {
                    onFilterChange('minFee', '');
                    onFilterChange('maxFee', '');
                    setMinFee('');
                    setMaxFee('');
                  }}
                  title="Remove fee range filter"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            )}
          </div>

          {/* Quick Filters */}
          <div className="filter-section">
            <h4>
              <i className="fas fa-bolt"></i>
              Quick Options
            </h4>
            <div className="quick-filters">
              <button 
                className={`quick-filter-btn ${filters.minRating === '4.0' ? 'active' : ''}`}
                onClick={() => onFilterChange('minRating', filters.minRating === '4.0' ? '' : '4.0')}
              >
                <i className="fas fa-star"></i> Top Rated
              </button>
              <button 
                className={`quick-filter-btn ${filters.experience === '10' ? 'active' : ''}`}
                onClick={() => onFilterChange('experience', filters.experience === '10' ? '' : '10')}
              >
                <i className="fas fa-user-md"></i> Experienced
              </button>
              <button 
                className={`quick-filter-btn ${filters.maxFee === '1000' ? 'active' : ''}`}
                onClick={() => onFilterChange('maxFee', filters.maxFee === '1000' ? '' : '1000')}
              >
                <i className="fas fa-rupee-sign"></i> Affordable
              </button>
              <button 
                className={`quick-filter-btn ${filters.specialization === 'general' ? 'active' : ''}`}
                onClick={() => onFilterChange('specialization', filters.specialization === 'general' ? '' : 'general')}
              >
                <i className="fas fa-hospital"></i> General
              </button>
            </div>
          </div>

          {/* Active Filters Summary */}
          {getActiveFiltersCount() > 0 && (
            <div className="filter-section">
              <h4>
                <i className="fas fa-list-check"></i>
                Active ({getActiveFiltersCount()})
              </h4>
              <div className="active-filters-summary">
                {Object.entries(filters).map(([key, value]) => {
                  if (!value || value === false) return null;
                  
                  let displayValue = value;
                  let displayKey = key;
                  
                  if (key === 'specialization') {
                    const spec = specializationOptions.find(s => s.value === value);
                    displayValue = spec ? spec.label : value;
                    displayKey = 'Specialty';
                  } else if (key === 'minRating') {
                    displayValue = `${value}+ stars`;
                    displayKey = 'Rating';
                  } else if (key === 'maxFee') {
                    displayValue = `< ₹${value}`;
                    displayKey = 'Max Fee';
                  } else if (key === 'minFee') {
                    displayValue = `> ₹${value}`;
                    displayKey = 'Min Fee';
                  } else if (key === 'experience') {
                    displayValue = `${value}+ years`;
                    displayKey = 'Experience';
                  } else if (key === 'showLocalOnly') {
                    displayValue = `My City`;
                    displayKey = 'Location';
                  } else if (key === 'city') {
                    displayValue = value;
                    displayKey = 'City';
                  } else if (key === 'userCity') {
                    // Don't show userCity in active filters (it's internal)
                    return null;
                  }

                  return (
                    <div key={key} className="active-filter-tag">
                      <span className="filter-key">{displayKey}:</span>
                      <span className="filter-value">{displayValue}</span>
                      <button 
                        onClick={() => {
                          onFilterChange(key, key === 'showLocalOnly' ? false : '');
                          // Also clear userCity when clearing showLocalOnly
                          if (key === 'showLocalOnly') {
                            onFilterChange('userCity', '');
                          }
                        }}
                        className="remove-filter"
                        title={`Remove ${displayKey} filter`}
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Collapsed state quick actions */}
      {isCollapsed && (
        <div className="collapsed-content">
          <div className="quick-actions-collapsed">
            <button 
              className="collapsed-action"
              onClick={() => onFilterChange('minRating', filters.minRating === '4.0' ? '' : '4.0')}
              title="Toggle top rated filter"
            >
              <i className="fas fa-star"></i>
            </button>
            <button 
              className={`collapsed-action ${filters.showLocalOnly ? 'active' : ''}`}
              onClick={handleLocationToggle}
              title="Toggle local doctors only"
              disabled={!userLocation || !userLocation.city}
            >
              <i className="fas fa-map-marker-alt"></i>
            </button>
            <button 
              className="collapsed-action"
              onClick={onClearFilters}
              title="Clear all filters"
            >
              <i className="fas fa-undo"></i>
            </button>
          </div>
          
          {getActiveFiltersCount() > 0 && (
            <div className="active-count-collapsed">
              {getActiveFiltersCount()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterSidebar;