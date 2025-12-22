import React from 'react';
import '../styles/FilterSidebar.css';

const FilterSidebar = ({ isOpen, onClose, filters, onFilterChange, onReset }) => {
  const categoryOptions = ['Action', 'Adventure', 'RPG', 'Horror', 'Sports', 'Racing', 'Strategy', 'Simulation', 'Puzzle', 'Fighting', 'Shooter', 'Open World'];
  const consoleOptions = ['PlayStation 5', 'PlayStation 4', 'Xbox Series X/S', 'Xbox One', 'Nintendo Switch', 'PC'];
  const ratingOptions = ['Everyone', 'Teen', '18+', 'Mature', 'Violence', 'Horror'];

  const handleCheckboxChange = (field, value) => {
    const current = filters[field] || [];
    const updated = current.includes(value)
      ? current.filter(item => item !== value)
      : [...current, value];
    onFilterChange({ ...filters, [field]: updated });
  };

  const handleInputChange = (field, value) => {
    onFilterChange({ ...filters, [field]: value });
  };

  // Count active filters
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.categories && filters.categories.length > 0) count += filters.categories.length;
    if (filters.consoles && filters.consoles.length > 0) count += filters.consoles.length;
    if (filters.ratings && filters.ratings.length > 0) count += filters.ratings.length;
    if (filters.minPrice !== '' && filters.minPrice !== null) count++;
    if (filters.maxPrice !== '' && filters.maxPrice !== null) count++;
    if (filters.minDiscount !== '' && filters.minDiscount !== null) count++;
    if (filters.minRating !== '' && filters.minRating !== null) count++;
    return count;
  };

  const activeCount = getActiveFilterCount();

  return (
    <>
      {/* Overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
      
      {/* Sidebar */}
      <div className={`filter-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>
            Filters
            {activeCount > 0 && <span className="filter-badge"> ({activeCount})</span>}
          </h2>
          <button className="close-sidebar-btn" onClick={onClose} aria-label="Close Filters">
            <i className="fa-solid fa-times"></i>
          </button>
        </div>

        <div className="sidebar-content">
          {/* Sort By */}
          <div className="filter-section">
            <h3 className="filter-title">Sort By</h3>
            <select 
              className="filter-select"
              value={filters.sortBy || 'newest'}
              onChange={(e) => handleInputChange('sortBy', e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="popularity">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="discount">Highest Discount</option>
              <option value="name_asc">Name: A to Z</option>
              <option value="name_desc">Name: Z to A</option>
            </select>
          </div>

          {/* Price Range */}
          <div className="filter-section">
            <h3 className="filter-title">Price Range (₹)</h3>
            <div className="price-inputs">
              <input
                type="number"
                placeholder="Min"
                className="filter-input"
                value={filters.minPrice || ''}
                onChange={(e) => handleInputChange('minPrice', e.target.value)}
                min="0"
              />
              <span>to</span>
              <input
                type="number"
                placeholder="Max"
                className="filter-input"
                value={filters.maxPrice || ''}
                onChange={(e) => handleInputChange('maxPrice', e.target.value)}
                min="0"
              />
            </div>
          </div>

          {/* Discount Filter */}
          <div className="filter-section">
            <h3 className="filter-title">Minimum Discount (%)</h3>
            <select
              className="filter-select"
              value={filters.minDiscount || ''}
              onChange={(e) => handleInputChange('minDiscount', e.target.value)}
            >
              <option value="">Any Discount</option>
              <option value="10">10% or more</option>
              <option value="20">20% or more</option>
              <option value="30">30% or more</option>
              <option value="40">40% or more</option>
              <option value="50">50% or more</option>
              <option value="70">70% or more</option>
            </select>
          </div>

          {/* User Rating Filter */}
          <div className="filter-section">
            <h3 className="filter-title">Minimum Rating</h3>
            <select
              className="filter-select"
              value={filters.minRating || ''}
              onChange={(e) => handleInputChange('minRating', e.target.value)}
            >
              <option value="">Any Rating</option>
              <option value="1"> 1+ Stars</option>
              <option value="2"> 2+ Stars</option>
              <option value="3"> 3+ Stars</option>
              <option value="4"> 4+ Stars</option>
              <option value="4.5"> 4.5+ Stars</option>
            </select>
          </div>

          {/* Categories */}
          <div className="filter-section">
            <h3 className="filter-title">
              Categories
              {filters.categories && filters.categories.length > 0 && (
                <span style={{ fontSize: '0.8rem', color: '#00BFFF', marginLeft: '8px' }}>
                  ({filters.categories.length} selected)
                </span>
              )}
            </h3>
            <div className="filter-checkboxes">
              {categoryOptions.map(category => (
                <label key={category} className="filter-checkbox-label">
                  <input
                    type="checkbox"
                    checked={filters.categories && filters.categories.includes(category)}
                    onChange={() => handleCheckboxChange('categories', category)}
                  />
                  <span>{category}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Consoles/Platforms */}
          <div className="filter-section">
            <h3 className="filter-title">
              Platforms
              {filters.consoles && filters.consoles.length > 0 && (
                <span style={{ fontSize: '0.8rem', color: '#00BFFF', marginLeft: '8px' }}>
                  ({filters.consoles.length} selected)
                </span>
              )}
            </h3>
            <div className="filter-checkboxes">
              {consoleOptions.map(console => (
                <label key={console} className="filter-checkbox-label">
                  <input
                    type="checkbox"
                    checked={filters.consoles && filters.consoles.includes(console)}
                    onChange={() => handleCheckboxChange('consoles', console)}
                  />
                  <span>{console}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Age Ratings */}
          <div className="filter-section">
            <h3 className="filter-title">
              Age Ratings
              {filters.ratings && filters.ratings.length > 0 && (
                <span style={{ fontSize: '0.8rem', color: '#00BFFF', marginLeft: '8px' }}>
                  ({filters.ratings.length} selected)
                </span>
              )}
            </h3>
            <div className="filter-checkboxes">
              {ratingOptions.map(rating => (
                <label key={rating} className="filter-checkbox-label">
                  <input
                    type="checkbox"
                    checked={filters.ratings && filters.ratings.includes(rating)}
                    onChange={() => handleCheckboxChange('ratings', rating)}
                  />
                  <span>{rating}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <button className="reset-btn" onClick={onReset}>
            Reset All Filters
          </button>
        </div>
      </div>
    </>
  );
};

export default FilterSidebar;