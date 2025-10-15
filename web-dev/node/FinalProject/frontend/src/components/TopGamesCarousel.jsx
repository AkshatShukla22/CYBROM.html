import React, { useState, useRef, useEffect } from 'react';
import BACKEND_URL from '../utils/BackendURL';
import '../styles/TopGamesCarousel.css';

const TopGamesCarousel = ({ games }) => {
  const [centerIndex, setCenterIndex] = useState(0);
  const carouselRef = useRef(null);

  const handleScroll = () => {
    if (carouselRef.current) {
      const scrollLeft = carouselRef.current.scrollLeft;
      const cardWidth = carouselRef.current.offsetWidth * 0.6; // Approximate card width
      const newIndex = Math.round(scrollLeft / cardWidth);
      setCenterIndex(newIndex);
    }
  };

  const scrollToCard = (index) => {
    if (carouselRef.current) {
      const cardWidth = carouselRef.current.offsetWidth * 0.6;
      carouselRef.current.scrollTo({
        left: cardWidth * index,
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

  if (!games || games.length === 0) {
    return null;
  }

  return (
    <div className="top-games-carousel-container">
      {/* Navigation Arrows */}
      <button 
        className="carousel-nav prev"
        onClick={() => scrollToCard(Math.max(0, centerIndex - 1))}
        disabled={centerIndex === 0}
      >
        <i className="fa-solid fa-chevron-left"></i>
      </button>

      <div 
        className="top-games-carousel"
        ref={carouselRef}
        onScroll={handleScroll}
      >
        {games.map((game, index) => {
          const distanceFromCenter = Math.abs(index - centerIndex);
          const zIndex = games.length - distanceFromCenter;
          const scale = distanceFromCenter === 0 ? 1 : distanceFromCenter === 1 ? 0.85 : 0.7;
          const opacity = distanceFromCenter === 0 ? 1 : distanceFromCenter === 1 ? 0.8 : 0.6;

          return (
            <div
              key={game._id}
              className={`carousel-card ${distanceFromCenter === 0 ? 'center' : ''}`}
              style={{
                zIndex: zIndex,
                transform: `scale(${scale})`,
                opacity: opacity
              }}
              onClick={() => scrollToCard(index)}
            >
              {/* FIXED: Changed from game.gamePic to game.coverImage */}
              {game.coverImage ? (
                <img 
                  src={`${BACKEND_URL}/uploads/${game.coverImage}`} 
                  alt={game.name}
                  className="carousel-card-bg"
                />
              ) : game.backgroundPic ? (
                <img 
                  src={`${BACKEND_URL}/uploads/${game.backgroundPic}`} 
                  alt={game.name}
                  className="carousel-card-bg"
                />
              ) : (
                <div className="carousel-card-bg-placeholder"></div>
              )}
              
              <div className="carousel-card-overlay">
                <div className="carousel-card-content">
                  <h3 className="carousel-card-title">{game.name}</h3>
                  
                  <div className="carousel-card-info">
                    <div className="carousel-rating">
                      <i className="fa-solid fa-star"></i>
                      <span>{game.averageRating ? game.averageRating.toFixed(1) : '0.0'}</span>
                    </div>
                    
                    <div className="carousel-purchases">
                      <i className="fa-solid fa-shopping-cart"></i>
                      <span>{game.purchaseCount || 0} purchases</span>
                    </div>
                  </div>

                  <div className="carousel-price">
                    {game.price === 0 ? (
                      <span className="free-tag">FREE</span>
                    ) : game.discount > 0 ? (
                      <>
                        <span className="original-price">₹{game.price}</span>
                        <span className="discounted-price">₹{calculateDiscountedPrice(game.price, game.discount)}</span>
                        <span className="discount-badge">-{game.discount}%</span>
                      </>
                    ) : (
                      <span className="current-price">₹{game.price}</span>
                    )}
                  </div>

                  {game.categories && game.categories.length > 0 && (
                    <div className="carousel-tags">
                      {game.categories.slice(0, 3).map(cat => (
                        <span key={cat} className="tag">{cat}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button 
        className="carousel-nav next"
        onClick={() => scrollToCard(Math.min(games.length - 1, centerIndex + 1))}
        disabled={centerIndex === games.length - 1}
      >
        <i className="fa-solid fa-chevron-right"></i>
      </button>

      {/* Dots Indicator */}
      <div className="carousel-dots">
        {games.map((_, index) => (
          <button
            key={index}
            className={`dot ${index === centerIndex ? 'active' : ''}`}
            onClick={() => scrollToCard(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default TopGamesCarousel;