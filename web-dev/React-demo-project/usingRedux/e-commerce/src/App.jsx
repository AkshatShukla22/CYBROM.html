import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { Provider, useDispatch } from 'react-redux'
import { store } from './store/store'
import { loginSuccess } from './store/authSlice'
import { authService } from './services/authService'
import Navbar from './components/Navbar'
import Home from './components/Home'
import ProductDetail from './components/ProductDetail'
import Cart from './components/Cart'
import Footer from './components/Footer'
import Login from './components/Login'
import Register from './components/Register'
import UserProfile from './components/UserProfile'
import './App.css'

// Auth initializer component
const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch()

  useEffect(() => {
    // Check if user is already logged in
    const user = authService.getCurrentUser()
    if (user && authService.isAuthenticated()) {
      dispatch(loginSuccess(user))
    }
  }, [dispatch])

  return children
}

// Main App component
const AppContent = () => {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Get current location to determine if navbar should be shown
  const location = useLocation()
  const navigate = useNavigate()
  const hideNavbarRoutes = ['/login', '/register']
  const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname)

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

  // Handle URL parameters for category filtering
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const categoryParam = urlParams.get('category')
    if (categoryParam) {
      setSelectedCategory(categoryParam)
    }
  }, [])

  // Get unique categories
  const categories = [...new Set(products.map(product => product.category))]

  // Handle search from navbar
  const handleSearch = (term) => {
    setSearchTerm(term)
    // Navigate to home if not already there
    if (location.pathname !== '/') {
      navigate('/')
    }
    // Scroll to products section after navigation
    setTimeout(() => {
      const productsSection = document.getElementById('products')
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth' })
      }
    }, 100)
  }

  // Handle products click from navbar
  const handleProductsClick = () => {
    // Navigate to home if not already there
    if (location.pathname !== '/') {
      navigate('/')
    }
    // Scroll to products section after navigation
    setTimeout(() => {
      const productsSection = document.getElementById('products')
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth' })
      }
    }, 100)
  }

  return (
    <div className="App">
      {shouldShowNavbar && (
        <Navbar 
          onSearch={handleSearch}
          onProductsClick={handleProductsClick}
        />
      )}
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
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/login" element={<Login />} />
      </Routes>
      
      <Footer />
    </div>
  )
}

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AuthInitializer>
          <AppContent />
        </AuthInitializer>
      </Router>
    </Provider>
  )
}

export default App;