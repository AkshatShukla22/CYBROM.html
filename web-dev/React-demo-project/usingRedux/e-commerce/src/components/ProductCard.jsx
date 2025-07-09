import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart } from '../store/cartSlice'
import "../style/productCard.css"

const ProductCard = ({ product }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const cartItems = useSelector(state => state.cart.items)
  
  // Check if product is already in cart
  const isInCart = cartItems.some(item => item.id === product.id)

  const handleAddToCart = (e) => {
    e.stopPropagation() // Prevent navigation when clicking add to cart
    if (!isInCart) {
      dispatch(addToCart(product))
    }
  }

  const handleProductClick = () => {
    navigate(`/product/${product.id}`)
  }

  return (
    <div className="product-card" onClick={handleProductClick}>
      <div className="product-image">
        <img src={product.image} alt={product.name} />
      </div>
      
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-brand">{product.brand}</p>
        <p className="product-description">{product.description}</p>
        
        <div className="product-rating">
          <span className="rating-stars">⭐</span>
          <span className="rating-value">{product.rating}</span>
        </div>
        
        <div className="product-price">
          <span className="price">{product.price}</span>
          <span className="original-price">{product.price * 1.2}</span>
        </div>
        
        <div className="product-stock">
          <span className={`stock ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </span>
        </div>
        
        <div className="product-actions">
          <button 
            className="view-details-btn"
            onClick={handleProductClick}
          >
            View Details
          </button>
          <button 
            className={`add-to-cart-btn ${isInCart ? 'in-cart' : ''}`}
            onClick={handleAddToCart}
            disabled={isInCart || product.stock === 0}
          >
            {isInCart ? 'Added' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard