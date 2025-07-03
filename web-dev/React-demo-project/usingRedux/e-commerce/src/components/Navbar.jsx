import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { toggleCart } from '../store/cartSlice'
import "../style/navbar.css"

const Navbar = () => {
  const { totalQuantity } = useSelector(state => state.cart)
  const dispatch = useDispatch()

  const handleCartToggle = () => {
    dispatch(toggleCart())
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <h1>TechStore</h1>
        </div>
        
        <div className="navbar-menu">
          <ul className="navbar-nav">
            <li><a href="#home">Home</a></li>
            <li><a href="#products">Products</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>

        <div className="navbar-actions">
          <button className="cart-btn" onClick={handleCartToggle}>
            <span className="cart-icon">🛒</span>
            Cart ({totalQuantity})
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar