import React, { useState } from 'react';
import ProductCard from './ProductCard';
import '../style/featuredProducts.css';

const FeaturedProducts = ({ products }) => {
  const [visibleCount, setVisibleCount] = useState(4);

  const loadMore = () => {
    setVisibleCount(prev => Math.min(prev + 4, products.length));
  };

  const showLess = () => {
    setVisibleCount(4);
  };

  if (!products || products.length === 0) {
    return <div className="no-products">No featured products available</div>;
  }

  const visibleProducts = products.slice(0, visibleCount);

  return (
    <div className="featured-products">
      <div className="featured-grid">
        {visibleProducts.map((product) => (
          <div key={product.id} className="featured-item">
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {products.length > 4 && (
        <div className="featured-actions">
          {visibleCount < products.length && (
            <button className="load-more-btn" onClick={loadMore}>
              Load More Products ({products.length - visibleCount} remaining)
            </button>
          )}
          {visibleCount > 4 && (
            <button className="show-less-btn" onClick={showLess}>
              Show Less
            </button>
          )}
        </div>
      )}

      <div className="featured-stats">
        <div className="stat-item">
          <span className="stat-number">{products.length}</span>
          <span className="stat-label">Featured Products</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{visibleCount}</span>
          <span className="stat-label">Currently Showing</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {products.reduce((total, product) => total + product.stock, 0)}
          </span>
          <span className="stat-label">Total Stock</span>
        </div>
      </div>
    </div>
  );
};

export default FeaturedProducts;