import React, { useState, useEffect } from 'react';
import HeroBanner from './HeroBanner';
import ProductSlider from './ProductSlider';
import FeaturedProducts from './FeaturedProducts';
import CategoryGrid from './CategoryGrid';
import ServiceFeatures from './ServiceFeatures';
import TestimonialSlider from './TestimonialSlider';
import NewsletterSignup from './NewsletterSignup';
import SearchSort from './SearchSort';
import ProductCard from './ProductCard';
import '../style/home.css';

const Home = ({ 
  products, 
  filteredProducts, 
  searchTerm, 
  setSearchTerm, 
  sortBy, 
  setSortBy, 
  selectedCategory, 
  setSelectedCategory, 
  categories, 
  loading, 
  error 
}) => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [topRated, setTopRated] = useState([]);

  useEffect(() => {
    if (products.length > 0) {
      // Featured products (high-priced items)
      const featured = products.filter(p => p.price > 1000).slice(0, 8);
      setFeaturedProducts(featured);

      // New arrivals (last 6 products by ID)
      const newItems = [...products].sort((a, b) => b.id - a.id).slice(0, 10);
      setNewArrivals(newItems);

      // Best sellers (random selection for demo)
      const bestSelling = [...products].sort(() => 0.5 - Math.random()).slice(0, 10);
      setBestSellers(bestSelling);

      // Top rated (rating > 4.5)
      const topRatedItems = products.filter(p => p.rating >= 4.7).slice(0, 10);
      setTopRated(topRatedItems);
    }
  }, [products]);

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <main className="main-content">
      <HeroBanner />
      
      <ServiceFeatures />
      
      {featuredProducts.length > 0 && (
        <section className="home-section">
          <div className="section-header">
            <h2>Featured Products</h2>
            <p>Discover our premium selection</p>
          </div>
          <FeaturedProducts products={featuredProducts} />
        </section>
      )}
      
      {newArrivals.length > 0 && (
        <section className="home-section">
          <div className="section-header">
            <h2>New Arrivals</h2>
            <p>Latest products just for you</p>
          </div>
          <ProductSlider products={newArrivals} />
        </section>
      )}
      
      <CategoryGrid categories={categories} />
      
      {topRated.length > 0 && (
        <section className="home-section">
          <div className="section-header">
            <h2>Top Rated Products</h2>
            <p>Highly rated by our customers</p>
          </div>
          <ProductSlider products={topRated} />
        </section>
      )}
      
      <TestimonialSlider />
      
      {bestSellers.length > 0 && (
        <section className="home-section">
          <div className="section-header">
            <h2>Best Sellers</h2>
            <p>Most popular items</p>
          </div>
          <ProductSlider products={bestSellers} />
        </section>
      )}
      
      <section className="home-section">
        <div className="section-header">
          <h2>All Products</h2>
          <p>Browse our complete collection</p>
        </div>
        
        <SearchSort
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          sortBy={sortBy}
          onSortChange={setSortBy}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={categories}
        />
        
        <div className="products-grid">
          {filteredProducts.length === 0 ? (
            <div className="no-products">
              <p>No products found matching your criteria.</p>
            </div>
          ) : (
            filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </section>
      
      <NewsletterSignup />
    </main>
  );
};

export default Home;