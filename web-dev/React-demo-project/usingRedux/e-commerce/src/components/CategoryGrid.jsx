import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/categoryGrid.css';

const CategoryGrid = ({ categories }) => {
  const navigate = useNavigate();

  const categoryData = [
    {
      name: 'Smartphones',
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop',
      description: 'Latest smartphones & accessories',
      color: '#007bff'
    },
    {
      name: 'Laptops',
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop',
      description: 'High-performance laptops',
      color: '#28a745'
    },
    {
      name: 'Audio',
      image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=300&fit=crop',
      description: 'Premium headphones & speakers',
      color: '#ff9800'
    },
    {
      name: 'Desktop PC',
      image: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=400&h=300&fit=crop',
      description: 'Gaming & workstation PCs',
      color: '#dc3545'
    },
    {
      name: 'Tablets',
      image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop',
      description: 'Tablets & e-readers',
      color: '#6f42c1'
    },
    {
      name: 'Smart Watch',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop',
      description: 'Smartwatches & fitness trackers',
      color: '#20c997'
    }
  ];

  const handleCategoryClick = (categoryName) => {
    navigate(`/?category=${categoryName}`);
  };

  return (
    <section className="category-grid-section">
      <div className="section-header">
        <h2>Shop by Category</h2>
        <p>Explore our wide range of tech products</p>
      </div>

      <div className="category-grid">
        {categoryData.map((category, index) => (
          <div
            key={index}
            className="category-card"
            onClick={() => handleCategoryClick(category.name)}
            style={{ '--category-color': category.color }}
          >
            <div className="category-image">
              <img src={category.image} alt={category.name} />
              <div className="category-overlay">
                <button className="category-cta">Shop Now</button>
              </div>
            </div>
            <div className="category-content">
              <h3 className="category-name">{category.name}</h3>
              <p className="category-description">{category.description}</p>
              <div className="category-stats">
                <span className="category-count">
                  {categories.includes(category.name) ? '✓ Available' : 'Coming Soon'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="category-features">
        <div className="feature-item">
          <span className="feature-icon">📦</span>
          <h4>Free Shipping</h4>
          <p>On orders over ₹999</p>
        </div>
        <div className="feature-item">
          <span className="feature-icon">🔄</span>
          <h4>Easy Returns</h4>
          <p>30-day return policy</p>
        </div>
        <div className="feature-item">
          <span className="feature-icon">🛡️</span>
          <h4>Secure Payment</h4>
          <p>100% secure transactions</p>
        </div>
        <div className="feature-item">
          <span className="feature-icon">⚡</span>
          <h4>Fast Delivery</h4>
          <p>Same day delivery available</p>
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;