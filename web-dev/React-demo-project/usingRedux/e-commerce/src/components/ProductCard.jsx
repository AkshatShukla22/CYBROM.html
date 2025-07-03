import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart } from '../store/cartSlice'
import "../style/productCard.css"

const ProductCard = ({ product }) => {
  const dispatch = useDispatch()
  const cartItems = useSelector(state => state.cart.items)
  
  // Check if product is already in cart
  const isInCart = cartItems.some(item => item.id === product.id)

  const handleAddToCart = () => {
    if (!isInCart) {
      dispatch(addToCart(product))
    }
  }

  return (
    <div className="product-card">
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
          <span className="price">${product.price}</span>
        </div>
        
        <div className="product-stock">
          <span className={`stock ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </span>
        </div>
        
        <button 
          className={`add-to-cart-btn ${isInCart ? 'in-cart' : ''}`}
          onClick={handleAddToCart}
          disabled={isInCart || product.stock === 0}
        >
          {isInCart ? 'Added to Cart' : 'Add to Cart'}
        </button>
      </div>
    </div>
  )
}

export default ProductCard