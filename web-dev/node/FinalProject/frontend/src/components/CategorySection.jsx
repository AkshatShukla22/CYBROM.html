import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import BACKEND_URL from '../utils/BackendURL';
import '../styles/CategorySection.css';

const CategorySection = ({ title, games, showDiscount }) => {
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const calculateDiscountedPrice = (price, discount) => {
    if (discount > 0) {
      return (price - (price * discount / 100)).toFixed(2);
    }
    return price;
  };

  const handleGameClick = (gameId) => {
    navigate(`/game/${gameId}`);
  };

  if (!games || games.length === 0) {
    return null;
  }

  return (
    <section className="category-section">
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
        <div className="scroll-buttons">
          <button className="scroll-btn" onClick={() => scroll('left')}>
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <button className="scroll-btn" onClick={() => scroll('right')}>
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </div>

      <div className="category-games-scroll" ref={scrollRef}>
        {games.map(game => (
          <div 
            key={game._id} 
            className="category-game-card"
            onClick={() => handleGameClick(game._id)}
          >
            {/* Large Card Design */}
            <div className="category-card-image">
              {game.gamePic ? (
                <img 
                  src={`${BACKEND_URL}/uploads/${game.gamePic}`} 
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
              
              {/* Overlay Info */}
              <div className="category-card-overlay">
                <div className="overlay-content">
                  <h3 className="game-title">{game.name}</h3>
                  
                  {/* Tags */}
                  <div className="game-tags">
                    {game.categories && game.categories.slice(0, 3).map(cat => (
                      <span key={cat} className="tag">{cat}</span>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="game-stats">
                    <div className="stat">
                      <i className="fa-solid fa-star"></i>
                      <span>{game.averageRating ? game.averageRating.toFixed(1) : '0.0'}</span>
                    </div>
                    <div className="stat">
                      <i className="fa-solid fa-users"></i>
                      <span>{game.purchaseCount || 0}</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="game-price-section">
                    {game.price === 0 ? (
                      <span className="free-label">FREE TO PLAY</span>
                    ) : game.discount > 0 ? (
                      <div className="price-with-discount">
                        <span className="original-price">₹{game.price}</span>
                        <div className="discount-info">
                          <span className="discount-percent">-{game.discount}%</span>
                          <span className="final-price">₹{calculateDiscountedPrice(game.price, game.discount)}</span>
                        </div>
                      </div>
                    ) : (
                      <span className="regular-price">₹{game.price}</span>
                    )}
                  </div>

                  {/* Platforms */}
                  {game.consoles && game.consoles.length > 0 && (
                    <div className="platforms">
                      {game.consoles.slice(0, 4).map(console => {
                        let icon = 'fa-gamepad';
                        if (console.includes('PlayStation')) icon = 'fa-playstation';
                        else if (console.includes('Xbox')) icon = 'fa-xbox';
                        else if (console.includes('PC')) icon = 'fa-desktop';
                        
                        return (
                          <i key={console} className={`fa-brands ${icon}`} title={console}></i>
                        );
                      })}
                    </div>
                  )}

                  <button 
                    className="view-game-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGameClick(game._id);
                    }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CategorySection;