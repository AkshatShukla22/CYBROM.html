import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { toggleCart } from '../store/cartSlice'
import { logout } from '../store/authSlice'
import { authService } from '../services/authService'
import "../style/navbar.css"

const Navbar = ({ onSearch, onProductsClick }) => {
  const { totalQuantity } = useSelector(state => state.cart)
  const { user, isAuthenticated } = useSelector(state => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const handleCartToggle = () => {
    dispatch(toggleCart())
  }

  const handleLogout = () => {
    authService.logout()
    dispatch(logout())
    setShowUserMenu(false)
    navigate('/')
  }

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu)
  }

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    // Call the parent's search handler as user types
    if (onSearch) {
      onSearch(value)
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    // Call the parent's search handler on submit
    if (onSearch) {
      onSearch(searchTerm)
    }
  }

  const handleProductsClick = (e) => {
    e.preventDefault()
    if (onProductsClick) {
      onProductsClick()
    }
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/">
            <h1>TechStore</h1>
          </Link>
        </div>
        
        <div className="navbar-search">
          <form onSubmit={handleSearchSubmit} className="search-form">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
            <button type="submit" className="search-btn">
              <span className="search-icon">🔍</span>
            </button>
          </form>
        </div>
        
        <div className="navbar-menu">
          <ul className="navbar-nav">
            <li><Link to="/">Home</Link></li>
            <li>
              <a href="#products" onClick={handleProductsClick}>
                Products
              </a>
            </li>
            <li><a href="/order">Orders</a></li>
          </ul>
        </div>

        <div className="navbar-actions">
          <button className="cart-btn" onClick={handleCartToggle}>
            <span className="cart-icon">🛒</span>
            Cart ({totalQuantity})
          </button>

          {isAuthenticated ? (
            <div className="user-menu">
              <button className="user-btn" onClick={toggleUserMenu}>
                <span className="user-icon">👤</span>
                {user?.name}
              </button>
              
              {showUserMenu && (
                <div className="user-dropdown">
                  <Link 
                    to="/profile" 
                    className="dropdown-item"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Profile
                  </Link>
                  <button 
                    className="dropdown-item logout-btn"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="login-btn">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar