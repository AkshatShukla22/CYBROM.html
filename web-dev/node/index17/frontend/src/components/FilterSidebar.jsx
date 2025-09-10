import React, { useState, useCallback } from 'react';
import '../styles/FilterSidebar.css';

const FilterSidebar = ({
  filters,
  userLocation,
  onFilterChange,
  onSortChange,
  onClearFilters,
  sortBy,
  sortOrder
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [minFee, setMinFee] = useState('');
  const [maxFee, setMaxFee] = useState('');

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
            
            {/* Local Doctors Checkbox */}
            {userLocation && (
              <div className="checkbox-filter">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={filters.showLocalOnly || false}
                    onChange={handleLocationToggle}
                  />
                  <span className="sidebar-checkmark"></span>
                  Doctors from my city
                </label>
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
              {getActiveFiltersCount()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterSidebar;