import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCartAsync, clearSuccessMessage, clearError } from '../redux/cartSlice';
import BACKEND_URL from '../utils/BackendURL';
import GameCard from '../components/GameCard';

const GameDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get cart state from Redux
  const cartLoading = useSelector(state => state.cart.loading);
  const cartError = useSelector(state => state.cart.error);
  const successMessage = useSelector(state => state.cart.successMessage);
  
  const [game, setGame] = useState(null);
  const [relatedGames, setRelatedGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeTab, setActiveTab] = useState('about');
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    fetchGameDetails();
    window.scrollTo(0, 0);
  }, [id]);

  // Clear messages after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        dispatch(clearSuccessMessage());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, dispatch]);

  useEffect(() => {
    if (cartError) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [cartError, dispatch]);

  const fetchGameDetails = async () => {
    setLoading(true);
    try {
      const gameRes = await fetch(`${BACKEND_URL}/api/user/games/${id}`);
      const gameData = await gameRes.json();
      
      if (gameRes.ok) {
        setGame(gameData.game);
        setSelectedImage(gameData.game.gamePic);
        
        if (gameData.game.categories && gameData.game.categories.length > 0) {
          const category = gameData.game.categories[0];
          const relatedRes = await fetch(`${BACKEND_URL}/api/user/games/category/${category}`);
          const relatedData = await relatedRes.json();
          
          const filtered = relatedData.games
            .filter(g => g._id !== id)
            .slice(0, 8);
          setRelatedGames(filtered);
        }
      } else {
        console.error('Game not found');
        navigate('/products');
      }
    } catch (error) {
      console.error('Error fetching game details:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDiscountedPrice = () => {
    if (game.discount > 0) {
      return (game.price - (game.price * game.discount / 100)).toFixed(2);
    }
    return game.price;
  };

  const handleAddToCart = async () => {
    // Dispatch the async thunk - cookies are handled automatically by credentials: 'include'
    dispatch(addToCartAsync({ gameId: game._id }));
  };

  const handleBuyNow = () => {
    console.log('Buy now:', game._id);
    // Navigate to checkout with game details
  };

  if (loading) {
    return <div className="loading-container">Loading game details...</div>;
  }

  if (!game) {
    return <div className="error-container">Game not found</div>;
  }

  return (
    <div className="game-detail-page">
      {/* Success/Error Messages */}
      {successMessage && (
        <div className="toast-message success">
          <i className="fa-solid fa-check-circle"></i>
          {successMessage}
        </div>
      )}
      {cartError && (
        <div className="toast-message error">
          <i className="fa-solid fa-exclamation-circle"></i>
          {cartError}
        </div>
      )}

      {/* Back Button */}
      <button className="back-button" onClick={() => navigate(-1)}>
        <i className="fa-solid fa-arrow-left"></i> Back
      </button>

      {/* Hero Section with Background */}
      <div 
        className="game-hero"
        style={{
          backgroundImage: game.backgroundPic 
            ? `url(${BACKEND_URL}/uploads/${game.backgroundPic})` 
            : 'none'
        }}
      >
        <div className="hero-overlay">
          <div className="hero-content">
            <h1 className="game-title">{game.name}</h1>
            
            {/* Game Stats */}
            <div className="game-stats-bar">
              <div className="stat-item">
                <i className="fa-solid fa-star"></i>
                <span>{game.averageRating ? game.averageRating.toFixed(1) : '0.0'} / 5</span>
              </div>
              <div className="stat-item">
                <i className="fa-solid fa-users"></i>
                <span>{game.purchaseCount || 0} purchases</span>
              </div>
              <div className="stat-item">
                <i className="fa-solid fa-comment"></i>
                <span>{game.reviews ? game.reviews.length : 0} reviews</span>
              </div>
            </div>

            {/* Categories and Ratings Tags */}
            <div className="tags-section">
              {game.categories && game.categories.map(cat => (
                <span key={cat} className="category-tag">{cat}</span>
              ))}
              {game.ratings && game.ratings.map(rating => (
                <span key={rating} className="rating-tag">{rating}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="game-detail-content">
        <div className="content-grid">
          {/* Left Section - Media & Info */}
          <div className="left-section">
            {/* Main Image Display */}
            <div className="main-image-container">
              {selectedImage ? (
                <img 
                  src={`${BACKEND_URL}/uploads/${selectedImage}`} 
                  alt={game.name}
                  className="main-image"
                />
              ) : (
                <div className="no-image-placeholder">
                  <i className="fa-solid fa-gamepad"></i>
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            <div className="thumbnail-gallery">
              {game.gamePic && (
                <img
                  src={`${BACKEND_URL}/uploads/${game.gamePic}`}
                  alt="Main"
                  className={`thumbnail ${selectedImage === game.gamePic ? 'active' : ''}`}
                  onClick={() => setSelectedImage(game.gamePic)}
                />
              )}
              
              {game.backgroundPic && (
                <img
                  src={`${BACKEND_URL}/uploads/${game.backgroundPic}`}
                  alt="Background"
                  className={`thumbnail ${selectedImage === game.backgroundPic ? 'active' : ''}`}
                  onClick={() => setSelectedImage(game.backgroundPic)}
                />
              )}
              
              {game.gameplayPics && game.gameplayPics.map((pic, index) => (
                <img
                  key={index}
                  src={`${BACKEND_URL}/uploads/${pic}`}
                  alt={`Gameplay ${index + 1}`}
                  className={`thumbnail ${selectedImage === pic ? 'active' : ''}`}
                  onClick={() => setSelectedImage(pic)}
                />
              ))}

              {game.video && (
                <div 
                  className="video-thumbnail"
                  onClick={() => setShowVideo(!showVideo)}
                >
                  <i className="fa-solid fa-play"></i>
                  <span>Video</span>
                </div>
              )}
            </div>

            {/* Video Player */}
            {showVideo && game.video && (
              <div className="video-player-container">
                <video 
                  controls 
                  className="game-video"
                  src={`${BACKEND_URL}/uploads/${game.video}`}
                  autoPlay
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            )}

            {/* Tabs Section */}
            <div className="info-tabs">
              <div className="tab-buttons">
                <button 
                  className={`tab-btn ${activeTab === 'about' ? 'active' : ''}`}
                  onClick={() => setActiveTab('about')}
                >
                  About
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'specs' ? 'active' : ''}`}
                  onClick={() => setActiveTab('specs')}
                >
                  Specifications
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                  onClick={() => setActiveTab('reviews')}
                >
                  Reviews ({game.reviews ? game.reviews.length : 0})
                </button>
              </div>

              <div className="tab-content">
                {activeTab === 'about' && (
                  <div className="about-content">
                    <h3>Description</h3>
                    <p>{game.description}</p>
                  </div>
                )}

                {activeTab === 'specs' && (
                  <div className="specs-content">
                    <h3>Game Specifications</h3>
                    <div className="spec-item">
                      <strong>Platforms:</strong>
                      <div className="platform-list">
                        {game.consoles && game.consoles.map(console => (
                          <span key={console} className="platform-badge">{console}</span>
                        ))}
                      </div>
                    </div>
                    <div className="spec-item">
                      <strong>Categories:</strong>
                      <div className="category-list">
                        {game.categories && game.categories.map(cat => (
                          <span key={cat} className="category-badge">{cat}</span>
                        ))}
                      </div>
                    </div>
                    <div className="spec-item">
                      <strong>Age Ratings:</strong>
                      <div className="rating-list">
                        {game.ratings && game.ratings.map(rating => (
                          <span key={rating} className="age-rating-badge">{rating}</span>
                        ))}
                      </div>
                    </div>
                    <div className="spec-item">
                      <strong>Release Date:</strong>
                      <span>{new Date(game.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="reviews-content">
                    {game.reviews && game.reviews.length > 0 ? (
                      game.reviews.map((review, index) => (
                        <div key={index} className="review-item">
                          <div className="review-header">
                            <div className="review-rating">
                              {[...Array(5)].map((_, i) => (
                                <i 
                                  key={i} 
                                  className={`fa-solid fa-star ${i < review.rating ? 'filled' : ''}`}
                                ></i>
                              ))}
                            </div>
                            <span className="review-date">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="review-comment">{review.comment}</p>
                        </div>
                      ))
                    ) : (
                      <p className="no-reviews">No reviews yet. Be the first to review!</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Section - Purchase Card */}
          <div className="right-section">
            <div className="purchase-card">
              <div className="price-section">
                {game.price === 0 ? (
                  <div className="free-game">
                    <span className="free-label">FREE TO PLAY</span>
                  </div>
                ) : game.discount > 0 ? (
                  <div className="discounted-price-section">
                    <div className="discount-badge-large">-{game.discount}%</div>
                    <div className="price-info">
                      <span className="original-price-large">₹{game.price}</span>
                      <span className="final-price-large">₹{calculateDiscountedPrice()}</span>
                    </div>
                    <span className="savings">You save ₹{(game.price - calculateDiscountedPrice()).toFixed(2)}</span>
                  </div>
                ) : (
                  <div className="regular-price-section">
                    <span className="price-large">₹{game.price}</span>
                  </div>
                )}
              </div>

              <div className="purchase-buttons">
                <button className="btn-buy-now" onClick={handleBuyNow}>
                  <i className="fa-solid fa-bolt"></i>
                  {game.price === 0 ? 'Play Now' : 'Buy Now'}
                </button>
                <button 
                  className="btn-add-cart" 
                  onClick={handleAddToCart}
                  disabled={cartLoading}
                >
                  <i className="fa-solid fa-cart-shopping"></i>
                  {cartLoading ? 'Adding...' : 'Add to Cart'}
                </button>
              </div>

              <div className="additional-info">
                <div className="info-row">
                  <i className="fa-solid fa-shield-halved"></i>
                  <span>Secure Payment</span>
                </div>
                <div className="info-row">
                  <i className="fa-solid fa-download"></i>
                  <span>Instant Download</span>
                </div>
                <div className="info-row">
                  <i className="fa-solid fa-headset"></i>
                  <span>24/7 Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Games Section */}
        {relatedGames.length > 0 && (
          <div className="related-games-section">
            <h2 className="section-title">You May Also Like</h2>
            <div className="related-games-grid">
              {relatedGames.map(relatedGame => (
                <GameCard key={relatedGame._id} game={relatedGame} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameDetail;