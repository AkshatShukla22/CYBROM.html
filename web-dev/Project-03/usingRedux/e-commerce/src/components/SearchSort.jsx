import React from 'react'
import '../style/searchSort.css'

const SearchSort = ({ 
  sortBy, 
  onSortChange, 
  selectedCategory, 
  onCategoryChange, 
  categories,
  totalResults = 0,
  showResultsCount = true,
  showClearFilters = true,
  compact = false,
  loading = false
}) => {
  
  const hasActiveFilters = selectedCategory || sortBy
  
  const handleClearFilters = () => {
    onCategoryChange('')
    onSortChange('')
  }

  return (
    <div className={`search-sort-container ${compact ? 'compact' : ''} ${loading ? 'loading' : ''}`}>
      <div className={`filter-section ${hasActiveFilters ? 'has-active-filters' : ''}`}>
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="category-select"
          disabled={loading}
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="sort-select"
          disabled={loading}
        >
          <option value="">Sort By</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="name-asc">Name: A to Z</option>
          <option value="name-desc">Name: Z to A</option>
          <option value="rating">Rating: High to Low</option>
          <option value="newest">Newest First</option>
          <option value="popular">Most Popular</option>
        </select>

        {showClearFilters && hasActiveFilters && (
          <button 
            onClick={handleClearFilters}
            className="clear-filters-btn"
            disabled={loading}
          >
            Clear Filters
          </button>
        )}

        {showResultsCount && (
          <div className="results-count">
            <strong>{totalResults}</strong> {totalResults === 1 ? 'product' : 'products'} found
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchSort