import React, { useState, useEffect } from 'react';
import { CartProvider } from './context/CartContext';
import TopNavigation from './components/TopNavigation';
import SearchFilterBar from './components/SearchFilterBar';
import ProductGrid from './components/ProductGrid';
import Cart from './components/Cart';
import DB_DATA from './data/db.json';
import './Style/animation.css';

const App = () => {
  const [products] = useState(DB_DATA.products);
  const [filteredProducts, setFilteredProducts] = useState(DB_DATA.products);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let filtered = products;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchTerm]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  return (
    <CartProvider>
      <div className="min-h-screen bg-gray-950">
        <TopNavigation />
        
        <SearchFilterBar
          onSearch={handleSearch}
          searchTerm={searchTerm}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />
        
        <ProductGrid products={filteredProducts} />
        
        <Cart />
      </div>
    </CartProvider>
  );
};

export default App;