import React from 'react';
import { useNavigate } from 'react-router-dom';
import BACKEND_URL from '../utils/BackendURL';
import '../styles/GameCard.css';

const GameCard = ({ game }) => {
  const navigate = useNavigate();

  const calculateDiscountedPrice = () => {
    if (game.discount > 0) {
      return (game.price - (game.price * game.discount / 100)).toFixed(2);
    }
    return game.price;
  };

  const handleCardClick = () => {
    // Navigate to game detail page (you'll create this later)
    navigate(`/game/${game._id}`);
  };

  return (
    <div className="game-card-component" onClick={handleCardClick}>
      {/* Game Image */}
      <div className="game-card-image-container">
        {game.gamePic ? (
          <img 
            src={`${BACKEND_URL}/uploads/${game.gamePic}`} 
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

        {/* Buy Button */}
        <button className="buy-btn" onClick={(e) => {
          e.stopPropagation();
          // Add to cart or buy logic here
          console.log('Buy game:', game._id);
        }}>
          {game.price === 0 ? 'Play Now' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

export default GameCard;