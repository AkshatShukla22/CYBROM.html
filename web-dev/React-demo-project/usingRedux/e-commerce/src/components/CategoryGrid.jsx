import React from 'react';
import { useNavigate } from 'react-router-dom';

const CategoryGrid = ({ categories }) => {
  const navigate = useNavigate();

  const categoryData = [
    {
      name: 'Electronics',
      image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop',
      description: 'Latest gadgets & tech',
      color: '#007bff'
    },
    {
      name: 'Fashion',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop',
      description: 'Trendy clothing & accessories',
      color: '#e91e63'
    },
    {
      name: 'Audio',
      image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=300&fit=crop',
      description: 'Premium audio equipment',
      color: '#ff9800'
    },
    {
      name: 'Home',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
      description: 'Home & living essentials',
      color: '#4caf50'
    },
    {
      name: 'Sports',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
      description: 'Sports & fitness gear',
      color: '#9c27b0'
    },
    {
      name: 'Books',
      image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
      description: 'Books & educational content',
      color: '#795548'
    }
  ];

  const handleCategoryClick = (categoryName) => {
    navigate(`/?category=${categoryName}`);
  };

  return (
    <section className="category-grid-section">
      <div className="section-header">
        <h2>Shop by Category</h2>
        <p>Explore our wide range of product categories</p>
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