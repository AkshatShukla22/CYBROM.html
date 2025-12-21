import React, { useEffect, useState } from 'react';
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

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [purchasedGames, setPurchasedGames] = useState([]);

  useEffect(() => {
    dispatch(fetchCartAsync());
  }, [dispatch]);

  const handleRemoveFromCart = (gameId) => {
    dispatch(removeFromCartAsync(gameId));
  };

  const handleQuantityChange = (gameId, newQuantity) => {
    if (newQuantity < 1) return;
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

  const handleCheckout = async () => {
    try {
      setIsProcessingPayment(true);

      // Create Razorpay order - credentials: 'include' will send the httpOnly cookie
      const orderResponse = await fetch(`${BACKEND_URL}/api/users/payment/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include' // This sends the httpOnly cookie
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        // If unauthorized, redirect to login
        if (orderResponse.status === 401) {
          alert('Please login to continue');
          navigate('/login');
          return;
        }
        throw new Error(orderData.message || 'Failed to create order');
      }

      // Razorpay payment options
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.orderId,
        name: 'Game Store',
        description: 'Purchase Games',
        handler: async function (response) {
          try {
            // Verify payment
            const verifyResponse = await fetch(`${BACKEND_URL}/api/users/payment/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include', // This sends the httpOnly cookie
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              setPurchasedGames(verifyData.purchasedGames);
              setPaymentSuccess(true);
              // Refresh cart
              dispatch(fetchCartAsync());
            } else {
              alert(verifyData.message || 'Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            alert('Payment verification failed. Please contact support.');
          } finally {
            setIsProcessingPayment(false);
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: ''
        },
        theme: {
          color: '#3399cc'
        },
        modal: {
          ondismiss: function() {
            setIsProcessingPayment(false);
          }
        }
      };

      // Load Razorpay script and open payment modal
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        const razorpay = new window.Razorpay(options);
        razorpay.open();
      };
      script.onerror = () => {
        alert('Failed to load payment gateway. Please try again.');
        setIsProcessingPayment(false);
      };
      document.body.appendChild(script);

    } catch (error) {
      console.error('Checkout error:', error);
      alert(error.message || 'Failed to process payment');
      setIsProcessingPayment(false);
    }
  };

  const closeSuccessModal = () => {
    setPaymentSuccess(false);
    navigate('/collection');
  };

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

                    <div className="cart-item-info">
                      <h3 className="item-name">{game.name}</h3>
                      
                      {game.categories && game.categories.length > 0 && (
                        <div className="item-categories">
                          {game.categories.slice(0, 2).map(cat => (
                            <span key={cat} className="category-tag">{cat}</span>
                          ))}
                        </div>
                      )}

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

                    <div className="item-total">
                      ₹{(discountedPrice * item.quantity).toFixed(2)}
                    </div>

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

            <button 
              className="checkout-btn" 
              onClick={handleCheckout}
              disabled={loading || isProcessingPayment}
            >
              {isProcessingPayment ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  Processing...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-credit-card"></i>
                  Proceed to Checkout
                </>
              )}
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

      {/* Payment Success Modal */}
      {paymentSuccess && (
        <div className="payment-modal-overlay">
          <div className="payment-modal">
            <div className="success-icon">
              <i className="fa-solid fa-circle-check"></i>
            </div>
            <h2>Payment Successful!</h2>
            <p>Your games have been added to your collection.</p>
            
            {purchasedGames.length > 0 && (
              <div className="purchased-games-list">
                <h3>Purchased Games:</h3>
                <ul>
                  {purchasedGames.map((game, index) => (
                    <li key={index}>
                      {game.name} {game.quantity > 1 && `(x${game.quantity})`}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="modal-actions">
              <button className="view-collection-btn" onClick={closeSuccessModal}>
                View Collection
              </button>
              <button 
                className="continue-shopping-modal-btn" 
                onClick={() => {
                  setPaymentSuccess(false);
                  navigate('/products');
                }}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;