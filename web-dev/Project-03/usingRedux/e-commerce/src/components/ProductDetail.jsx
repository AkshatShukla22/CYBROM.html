import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart, increaseQuantity, decreaseQuantity } from '../store/cartSlice'
import '../style/ProductDetail.css'
const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  
  const cartItems = useSelector(state => state.cart.items)
  const cartItem = cartItems.find(item => item.id === parseInt(id))

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:3000/products/${id}`)
      if (!response.ok) {
        throw new Error('Product not found')
      }
      const data = await response.json()
      setProduct(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (product && product.stock > 0) {
      for (let i = 0; i < quantity; i++) {
        dispatch(addToCart(product))
      }
      setQuantity(1)
    }
  }

  const handleQuantityChange = (type) => {
    if (type === 'increase' && quantity < product.stock) {
      setQuantity(prev => prev + 1)
    } else if (type === 'decrease' && quantity > 1) {
      setQuantity(prev => prev - 1)
    }
  }

  const handleCartQuantityChange = (type) => {
    if (type === 'increase') {
      dispatch(increaseQuantity(product.id))
    } else if (type === 'decrease') {
      dispatch(decreaseQuantity(product.id))
    }
  }

  const formatPrice = (price) => {
    return `₹${(price * 83).toLocaleString('en-IN')}`
  }

  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="star filled">★</span>)
    }
    
    if (hasHalfStar) {
      stars.push(<span key="half" className="star half">★</span>)
    }
    
    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star empty">★</span>)
    }
    
    return stars
  }

  // Mock additional images for demonstration
  const productImages = [
    product?.image,
    product?.image,
    product?.image,
    product?.image
  ]

  if (loading) {
    return (
      <div className="product-detail-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading product details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="product-detail-container">
        <div className="error-message">
          <h2>Product Not Found</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/')} className="back-btn">
            Back to Products
          </button>
        </div>
      </div>
    )
  }

  if (!product) {
    return null
  }

  return (
    <div className="product-detail-container">
      <div className="breadcrumb">
        <button onClick={() => navigate('/')} className="breadcrumb-link">
          Home
        </button>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-current">{product.name}</span>
      </div>

      <div className="product-detail-content">
        <div className="product-images">
          <div className="main-image">
            <img 
              src={productImages[selectedImage]} 
              alt={product.name}
              className="main-product-image"
            />
          </div>
          <div className="image-thumbnails">
            {productImages.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`${product.name} ${index + 1}`}
                className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                onClick={() => setSelectedImage(index)}
              />
            ))}
          </div>
        </div>

        <div className="product-info">
          <div className="product-header">
            <h1 className="product-title">{product.name}</h1>
            <p className="product-brand">{product.brand}</p>
          </div>

          <div className="product-rating">
            <div className="stars">
              {renderStars(product.rating)}
            </div>
            <span className="rating-value">({product.rating}/5)</span>
          </div>

          <div className="product-price">
            <span className="current-price">{formatPrice(product.price)}</span>
            <span className="original-price">{formatPrice(product.price * 1.2)}</span>
            <span className="discount">17% OFF</span>
          </div>

          <div className="product-description">
            <h3>Description</h3>
            <p>{product.description}</p>
          </div>

          <div className="product-details">
            <h3>Product Details</h3>
            <ul>
              <li><strong>Brand:</strong> {product.brand}</li>
              <li><strong>Category:</strong> {product.category}</li>
              <li><strong>Stock:</strong> {product.stock} units available</li>
              <li><strong>Rating:</strong> {product.rating}/5</li>
            </ul>
          </div>

          <div className="product-stock">
            <span className={`stock-status ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>

          <div className="product-actions">
            {!cartItem ? (
              <div className="add-to-cart-section">
                <div className="quantity-selector">
                  <button 
                    onClick={() => handleQuantityChange('decrease')}
                    disabled={quantity <= 1}
                    className="quantity-btn"
                  >
                    -
                  </button>
                  <span className="quantity-display">{quantity}</span>
                  <button 
                    onClick={() => handleQuantityChange('increase')}
                    disabled={quantity >= product.stock}
                    className="quantity-btn"
                  >
                    +
                  </button>
                </div>
                <button 
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="add-to-cart-btn"
                >
                  Add to Cart - {formatPrice(product.price * quantity)}
                </button>
              </div>
            ) : (
              <div className="cart-controls">
                <p className="in-cart-text">✓ Added to Cart</p>
                <div className="cart-quantity-controls">
                  <button 
                    onClick={() => handleCartQuantityChange('decrease')}
                    className="quantity-btn"
                  >
                    -
                  </button>
                  <span className="quantity-display">{cartItem.quantity}</span>
                  <button 
                    onClick={() => handleCartQuantityChange('increase')}
                    disabled={cartItem.quantity >= product.stock}
                    className="quantity-btn"
                  >
                    +
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="product-features">
            <div className="feature">
              <span className="feature-icon">🚚</span>
              <span>Free Delivery</span>
            </div>
            <div className="feature">
              <span className="feature-icon">↩️</span>
              <span>7 Days Return</span>
            </div>
            <div className="feature">
              <span className="feature-icon">🛡️</span>
              <span>1 Year Warranty</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail