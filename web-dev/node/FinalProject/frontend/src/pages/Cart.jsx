import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCartAsync, removeFromCartAsync, updateCartQuantity } from '../redux/cartSlice';
import BACKEND_URL from '../utils/BackendURL';
import '../styles/Cart.css';

const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const cart = useSelector(state => state.cart.items);
  const loading = useSelector(state => state.cart.loading);
  const error = useSelector(state => state.cart.error);

  useEffect(() => {
    // Fetch cart when component mounts
    // Cookies are automatically sent with credentials: 'include'
    dispatch(fetchCartAsync());
  }, [dispatch]);

  const handleRemoveFromCart = (gameId) => {
    dispatch(removeFromCartAsync(gameId));
  };

  const handleQuantityChange = (gameId, newQuantity) => {
    if (newQuantity < 1) return;
    // Dispatch the async thunk with correct action name
    dispatch(updateCartQuantity({ gameId, quantity: newQuantity }));
  };

  const calculateTotals = () => {
    let totalPrice = 0;
    let totalDiscountedPrice = 0;

    cart.forEach(item => {
      if (item.gameId) {
        const game = item.gameId;
        const gamePrice = game.price * item.quantity;
        const discountedPrice = game.discount > 0
          ? (game.price - (game.price * game.discount / 100)) * item.quantity
          : gamePrice;

        totalPrice += gamePrice;
        totalDiscountedPrice += discountedPrice;
      }
    });

    return {
      totalPrice: parseFloat(totalPrice.toFixed(2)),
      totalDiscountedPrice: parseFloat(totalDiscountedPrice.toFixed(2)),
      totalSavings: parseFloat((totalPrice - totalDiscountedPrice).toFixed(2))
    };
  };

  const totals = calculateTotals();

  if (loading && cart.length === 0) {
    return <div className="loading-container">Loading cart...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <p>Error: {error}</p>
        <button onClick={() => navigate('/products')}>Back to Products</button>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <button className="back-button" onClick={() => navigate(-1)}>
        <i className="fa-solid fa-arrow-left"></i>
      </button>

      <h1 className="cart-title">Shopping Cart</h1>

      {cart.length === 0 ? (
        <div className="empty-cart-container">
          <div className="empty-cart-icon">
            <i className="fa-solid fa-cart-shopping"></i>
          </div>
          <h2>Your cart is empty</h2>
          <p>Start shopping and add your favorite games!</p>
          <button 
            className="continue-shopping-btn"
            onClick={() => navigate('/products')}
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="cart-content">
          {/* Cart Items */}
          <div className="cart-items-section">
            {loading && (
              <div className="cart-loading-overlay">
                <i className="fa-solid fa-spinner fa-spin"></i>
              </div>
            )}
            <div className="cart-items-list">
              {cart.map(item => {
                const game = item.gameId;
                if (!game) return null;

                const discountedPrice = game.discount > 0
                  ? (game.price - (game.price * game.discount / 100)).toFixed(2)
                  : game.price;

                return (
                  <div key={game._id} className="cart-item">
                    {/* Game Image - FIXED: Changed from game.gamePic to game.coverImage */}
                    <div className="cart-item-image">
                      {game.coverImage ? (
                        <img
                          src={`${BACKEND_URL}/uploads/${game.coverImage}`}
                          alt={game.name}
                        />
                      ) : game.backgroundPic ? (
                        <img
                          src={`${BACKEND_URL}/uploads/${game.backgroundPic}`}
                          alt={game.name}
                        />
                      ) : (
                        <div className="image-placeholder">
                          <i className="fa-solid fa-gamepad"></i>
                        </div>
                      )}
                    </div>

                    {/* Game Info */}
                    <div className="cart-item-info">
                      <h3 className="item-name">{game.name}</h3>
                      
                      {/* Categories */}
                      {game.categories && game.categories.length > 0 && (
                        <div className="item-categories">
                          {game.categories.slice(0, 2).map(cat => (
                            <span key={cat} className="category-tag">{cat}</span>
                          ))}
                        </div>
                      )}

                      {/* Price Info */}
                      <div className="item-price-info">
                        {game.discount > 0 && (
                          <div className="discount-info">
                            <span className="original-price">₹{game.price}</span>
                            <span className="discount-badge">-{game.discount}%</span>
                          </div>
                        )}
                        <span className="current-price">₹{discountedPrice}</span>
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="quantity-controls">
                      <button
                        className="qty-btn"
                        onClick={() => handleQuantityChange(game._id, item.quantity - 1)}
                        disabled={loading}
                      >
                        <i className="fa-solid fa-minus"></i>
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(game._id, parseInt(e.target.value) || 1)}
                        className="qty-input"
                        min="1"
                        disabled={loading}
                      />
                      <button
                        className="qty-btn"
                        onClick={() => handleQuantityChange(game._id, item.quantity + 1)}
                        disabled={loading}
                      >
                        <i className="fa-solid fa-plus"></i>
                      </button>
                    </div>

                    {/* Item Total */}
                    <div className="item-total">
                      ₹{(discountedPrice * item.quantity).toFixed(2)}
                    </div>

                    {/* Remove Button */}
                    <button
                      className="remove-btn"
                      onClick={() => handleRemoveFromCart(game._id)}
                      title="Remove from cart"
                      disabled={loading}
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Summary */}
          <div className="order-summary">
            <h2 className="summary-title">Order Summary</h2>
            
            <div className="summary-row">
              <span>Subtotal ({cart.length} items):</span>
              <span>₹{totals.totalPrice}</span>
            </div>

            {totals.totalSavings > 0 && (
              <div className="summary-row savings">
                <span>Total Savings:</span>
                <span className="savings-amount">-₹{totals.totalSavings}</span>
              </div>
            )}

            <div className="summary-divider"></div>

            <div className="summary-row total">
              <span>Total:</span>
              <span>₹{totals.totalDiscountedPrice}</span>
            </div>

            <button className="checkout-btn" disabled={loading}>
              <i className="fa-solid fa-credit-card"></i>
              Proceed to Checkout
            </button>

            <button 
              className="continue-shopping-btn-2"
              onClick={() => navigate('/products')}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;