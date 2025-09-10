import React, { useState, useMemo, useCallback } from 'react';
import '../styles/FilterSidebar.css';

const FilterSidebar = ({
  filters,
  filterOptions,
  userLocation,
  onFilterChange,
  onSortChange,
  onClearFilters,
  sortBy,
  sortOrder
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [minFee, setMinFee] = useState('');
  const [maxFee, setMaxFee] = useState('');

  // Specialization options
  const specializationOptions = [
    { value: 'cardiology', label: 'Cardiology' },
    { value: 'dermatology', label: 'Dermatology' },
    { value: 'neurology', label: 'Neurology' },
    { value: 'pediatrics', label: 'Pediatrics' },
    { value: 'orthopedics', label: 'Orthopedics' },
    { value: 'psychiatry', label: 'Psychiatry' },
    { value: 'general', label: 'General Practice' },
    { value: 'other', label: 'Other' }
  ];

  // Rating options - more comprehensive
  const ratingOptions = [
    { value: '4.8', label: '4.8+' },
    { value: '4.5', label: '4.5+' },
    { value: '4.0', label: '4.0+' },
    { value: '3.5', label: '3.5+' },
    { value: '3.0', label: '3.0+' },
    { value: '2.5', label: '2.5+' }
  ];

  // Experience options
  const experienceOptions = [
    { value: '1', label: '1+ Years' },
    { value: '3', label: '3+ Years' },
    { value: '5', label: '5+ Years' },
    { value: '10', label: '10+ Years' },
    { value: '15', label: '15+ Years' },
    { value: '20', label: '20+ Years' }
  ];

  // Sorting options
  const sortOptions = [
    { value: 'ratings.average|desc', label: 'Highest Rated' },
    { value: 'ratings.average|asc', label: 'Lowest Rated' },
    { value: 'experience|desc', label: 'Most Experienced' },
    { value: 'experience|asc', label: 'Least Experienced' },
    { value: 'consultationFee|asc', label: 'Lowest Fee' },
    { value: 'consultationFee|desc', label: 'Highest Fee' },
    { value: 'totalAppointments|desc', label: 'Most Popular' },
    { value: 'createdAt|desc', label: 'Recently Joined' }
  ];

  // Filtered cities based on search
  const filteredCities = useMemo(() => {
    if (!filterOptions.cities) return [];
    return filterOptions.cities.filter(city =>
      city.toLowerCase().includes(citySearch.toLowerCase())
    );
  }, [filterOptions.cities, citySearch]);

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

  const handleLocationToggle = useCallback(() => {
    onFilterChange('showLocalOnly', !filters.showLocalOnly);
  }, [filters.showLocalOnly, onFilterChange]);

  const handleCollapseToggle = useCallback(() => {
    setIsCollapsed(!isCollapsed);
  }, [isCollapsed]);

  return (
    <div className={`filter-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
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
              <span className="collapsed-title">Filters</span>
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
              Clear All Filters ({getActiveFiltersCount()})
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
              className="filter-select"
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
            
            {/* Local Doctors Checkbox */}
            {userLocation && (
              <div className="checkbox-filter">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={filters.showLocalOnly || false}
                    onChange={handleLocationToggle}
                  />
                  <span className="checkmark"></span>
                  Doctors from my city ({userLocation})
                </label>
              </div>
            )}

            {/* City Filter with Search */}
            <div className="city-filter-container">
              <div className="city-search-container">
                <input
                  type="text"
                  placeholder="Search cities..."
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  className="city-search-input"
                />
                <i className="fas fa-search search-icon"></i>
              </div>
              
              <select 
                value={filters.city || ''}
                onChange={(e) => onFilterChange('city', e.target.value)}
                className="filter-select city-select"
              >
                <option value="">All Cities</option>
                {filteredCities.map(city => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
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
              className="filter-select"
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
                  {spec.charAt(0).toUpperCase() + spec.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Rating Filter - Only Buttons */}
          <div className="filter-section">
            <h4>
              <i className="fas fa-star"></i>
              Minimum Rating
            </h4>
            
            {/* Rating buttons */}
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
              Minimum Experience
            </h4>
            <select 
              value={filters.experience || ''}
              onChange={(e) => onFilterChange('experience', e.target.value)}
              className="filter-select"
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
                max="30"
                value={filters.experience || 0}
                onChange={(e) => onFilterChange('experience', e.target.value || '')}
                className="slider"
              />
              <div className="slider-labels">
                <span>0 years</span>
                <span>30+ years</span>
              </div>
            </div>
          </div>

          {/* Custom Fee Range */}
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
          </div>

          {/* Quick Filters */}
          <div className="filter-section">
            <h4>
              <i className="fas fa-bolt"></i>
              Quick Filters
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

          {/* Applied Filters Summary */}
          {getActiveFiltersCount() > 0 && (
            <div className="filter-section">
              <h4>
                <i className="fas fa-list-check"></i>
                Active Filters ({getActiveFiltersCount()})
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
                    displayKey = 'Min Rating';
                  } else if (key === 'maxFee') {
                    displayValue = `Under ₹${value}`;
                    displayKey = 'Max Fee';
                  } else if (key === 'minFee') {
                    displayValue = `Above ₹${value}`;
                    displayKey = 'Min Fee';
                  } else if (key === 'experience') {
                    displayValue = `${value}+ years`;
                    displayKey = 'Min Experience';
                  } else if (key === 'showLocalOnly') {
                    displayValue = `In ${userLocation}`;
                    displayKey = 'Location';
                  } else if (key === 'city') {
                    displayKey = 'City';
                  }

                  return (
                    <div key={key} className="active-filter-tag">
                      <span className="filter-key">{displayKey}:</span>
                      <span className="filter-value">{displayValue}</span>
                      <button 
                        onClick={() => onFilterChange(key, key === 'showLocalOnly' ? false : '')}
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

          {/* Filter Statistics */}
          <div className="filter-section">
            <div className="filter-stats">
              <h4>
                <i className="fas fa-chart-bar"></i>
                Available Options
              </h4>
              <div className="stats-list">
                <div className="stat-item">
                  <span className="stat-label">Cities:</span>
                  <span className="stat-value">{filterOptions.cities?.length || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Specializations:</span>
                  <span className="stat-value">{filterOptions.specializations?.length || 0}</span>
                </div>
              </div>
            </div>
          </div>
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
              className="collapsed-action"
              onClick={handleLocationToggle}
              title="Toggle local doctors only"
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
              {getActiveFiltersCount()} active
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterSidebar;