import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store/store'
import Navbar from './components/Navbar'
import SearchSort from './components/SearchSort'
import ProductCard from './components/ProductCard'
import ProductDetail from './components/ProductDetail'
import Cart from './components/Cart'
import Footer from './components/Footer'
import './App.css'

// Home component for the main product listing
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
  if (loading) {
    return <div className="loading">Loading products...</div>
  }

  if (error) {
    return <div className="error">Error: {error}</div>
  }

  return (
    <main className="main-content">
      <div className="hero-section">
        <h1>Welcome to TechStore</h1>
        <p>Discover the latest technology and fashion products</p>
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
      
      <div className="products-section">
        <h2>Our Products</h2>
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
      </div>
    </main>
  )
}

function App() {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch products from JSON server
  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:3000/products')
      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }
      const data = await response.json()
      setProducts(data)
      setFilteredProducts(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Filter and sort products
  useEffect(() => {
    let filtered = [...products]

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory)
    }

    // Sort products
    if (sortBy) {
      switch (sortBy) {
        case 'price-low':
          filtered.sort((a, b) => a.price - b.price)
          break
        case 'price-high':
          filtered.sort((a, b) => b.price - a.price)
          break
        case 'name-asc':
          filtered.sort((a, b) => a.name.localeCompare(b.name))
          break
        case 'name-desc':
          filtered.sort((a, b) => b.name.localeCompare(a.name))
          break
        case 'rating':
          filtered.sort((a, b) => b.rating - a.rating)
          break
        default:
          break
      }
    }

    setFilteredProducts(filtered)
  }, [products, searchTerm, sortBy, selectedCategory])

  // Get unique categories
  const categories = [...new Set(products.map(product => product.category))]

  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <Navbar />
          <Cart />
          
          <Routes>
            <Route 
              path="/" 
              element={
                <Home 
                  products={products}
                  filteredProducts={filteredProducts}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  categories={categories}
                  loading={loading}
                  error={error}
                />
              } 
            />
            <Route path="/product/:id" element={<ProductDetail />} />
          </Routes>
          
          <Footer />
        </div>
      </Router>
    </Provider>
  )
}

export default App