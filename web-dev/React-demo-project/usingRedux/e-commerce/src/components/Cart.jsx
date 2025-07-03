import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { 
  removeFromCart, 
  increaseQuantity, 
  decreaseQuantity, 
  clearCart, 
  toggleCart 
} from '../store/cartSlice'
import "../style/cart.css"

const Cart = () => {
  const { items, totalQuantity, totalAmount, isCartOpen } = useSelector(state => state.cart)
  const dispatch = useDispatch()

  const handleRemoveFromCart = (id) => {
    dispatch(removeFromCart(id))
  }

  const handleIncreaseQuantity = (id) => {
    dispatch(increaseQuantity(id))
  }

  const handleDecreaseQuantity = (id) => {
    dispatch(decreaseQuantity(id))
  }

  const handleClearCart = () => {
    dispatch(clearCart())
  }

  const handleCloseCart = () => {
    dispatch(toggleCart())
  }

  if (!isCartOpen) return null

  return (
    <div className="cart-overlay">
      <div className="cart-container">
        <div className="cart-header">
          <h2>Shopping Cart</h2>
          <button className="close-cart-btn" onClick={handleCloseCart}>
            ✕
          </button>
        </div>

        <div className="cart-content">
          {items.length === 0 ? (
            <div className="empty-cart">
              <p>Your cart is empty</p>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {items.map(item => (
                  <div key={item.id} className="cart-item">
                    <div className="cart-item-image">
                      <img src={item.image} alt={item.name} />
                    </div>
                    
                    <div className="cart-item-info">
                      <h4>{item.name}</h4>
                      <p className="item-price">${item.price}</p>
                    </div>
                    
                    <div className="cart-item-controls">
                      <button 
                        className="quantity-btn"
                        onClick={() => handleDecreaseQuantity(item.id)}
                      >
                        -
                      </button>
                      <span className="quantity">{item.quantity}</span>
                      <button 
                        className="quantity-btn"
                        onClick={() => handleIncreaseQuantity(item.id)}
                      >
                        +
                      </button>
                    </div>
                    
                    <div className="cart-item-total">
                      <span>${item.totalPrice}</span>
                    </div>
                    
                    <button 
                      className="remove-btn"
                      onClick={() => handleRemoveFromCart(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="cart-summary">
                <div className="summary-row">
                  <span>Total Items: {totalQuantity}</span>
                </div>
                <div className="summary-row total">
                  <span>Total Amount: ${totalAmount}</span>
                </div>
                
                <div className="cart-actions">
                  <button className="clear-cart-btn" onClick={handleClearCart}>
                    Clear Cart
                  </button>
                  <button className="checkout-btn">
                    Checkout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Cart