import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCartAsync, clearSuccessMessage } from '../redux/cartSlice';
import BACKEND_URL from '../utils/BackendURL';
import '../styles/GameCard.css';

const GameCard = ({ game }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cartLoading = useSelector(state => state.cart.loading);
  const [showToast, setShowToast] = useState(false);

  const calculateDiscountedPrice = () => {
    if (game.discount > 0) {
      return (game.price - (game.price * game.discount / 100)).toFixed(2);
    }
    return game.price;
  };

  const handleCardClick = () => {
    navigate(`/game/${game._id}`);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    
    // Dispatch the async thunk - cookies are handled automatically
    dispatch(addToCartAsync({ gameId: game._id }));
    setShowToast(true);
    
    setTimeout(() => {
      setShowToast(false);
      dispatch(clearSuccessMessage());
    }, 2000);
  };

  return (
    <div className="game-card-component" onClick={handleCardClick}>
      {/* Game Image */}
      <div className="game-card-image-container">
        {/* FIXED: Changed from game.gamePic to game.coverImage */}
        {game.coverImage ? (
          <img 
            src={`${BACKEND_URL}/uploads/${game.coverImage}`} 
            alt={game.name}
            className="game-card-image"
          />
        ) : game.backgroundPic ? (
          <img 
            src={`${BACKEND_URL}/uploads/${game.backgroundPic}`} 
            alt={game.name}
            className="game-card-image"
          />
        ) : (
          <div className="game-card-image-placeholder">
            <i className="fa-solid fa-gamepad"></i>
          </div>
        )}
        
        {/* Discount Badge */}
        {game.discount > 0 && (
          <div className="discount-badge-overlay">-{game.discount}%</div>
        )}

        {/* Free Badge */}
        {game.price === 0 && (
          <div className="free-badge-overlay">FREE</div>
        )}
      </div>

      {/* Game Info */}
      <div className="game-card-body">
        <h3 className="game-card-title">{game.name}</h3>
        
        {/* Categories */}
        {game.categories && game.categories.length > 0 && (
          <div className="game-card-categories">
            {game.categories.slice(0, 2).map(cat => (
              <span key={cat} className="category-badge">{cat}</span>
            ))}
          </div>
        )}

        {/* Rating and Purchases */}
        <div className="game-card-stats">
          <div className="stat-item">
            <i className="fa-solid fa-star"></i>
            <span>{game.averageRating ? game.averageRating.toFixed(1) : '0.0'}</span>
          </div>
          <div className="stat-item">
            <i className="fa-solid fa-users"></i>
            <span>{game.purchaseCount || 0}</span>
          </div>
        </div>

        {/* Platforms */}
        {game.consoles && game.consoles.length > 0 && (
          <div className="game-card-platforms">
            {game.consoles.slice(0, 3).map(console => {
              let icon = 'fa-gamepad';
              if (console.includes('PlayStation')) icon = 'fa-playstation';
              else if (console.includes('Xbox')) icon = 'fa-xbox';
              else if (console.includes('PC')) icon = 'fa-desktop';
              else if (console.includes('Switch')) icon = 'fa-gamepad';
              
              return (
                <i key={console} className={`fa-brands ${icon} platform-icon`} title={console}></i>
              );
            })}
          </div>
        )}

        {/* Price */}
        <div className="game-card-price">
          {game.price === 0 ? (
            <span className="price-free">FREE TO PLAY</span>
          ) : game.discount > 0 ? (
            <div className="price-discounted">
              <span className="price-original">₹{game.price}</span>
              <span className="price-current">₹{calculateDiscountedPrice()}</span>
            </div>
          ) : (
            <span className="price-regular">₹{game.price}</span>
          )}
        </div>

        {/* Buy Button - FIXED: Removed duplicate cart icon */}
        <button 
          className="buy-btn" 
          onClick={handleAddToCart}
          disabled={cartLoading}
        >
          {cartLoading ? (
            <>
              <i className="fa-solid fa-spinner fa-spin"></i>
              Adding...
            </>
          ) : game.price === 0 ? (
            <>
              <i className="fa-solid fa-play"></i>
              Play Now
            </>
          ) : (
            <>
              <i className="fa-solid fa-cart-shopping"></i>
              Add to Cart
            </>
          )}
        </button>

        {/* Toast Message */}
        {showToast && (
          <div className="toast-notification">
            <i className="fa-solid fa-check"></i>
            Added to cart!
          </div>
        )}
      </div>
    </div>
  );
};

export default GameCard;