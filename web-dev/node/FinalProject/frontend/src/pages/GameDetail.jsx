import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCartAsync, clearSuccessMessage, clearError } from '../redux/cartSlice';
import BACKEND_URL from '../utils/BackendURL';
import GameCard from '../components/GameCard';
import '../styles/GameDetail.css';

const GameDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
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
        setSelectedImage(gameData.game.coverImage || gameData.game.gamePic);
        
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
    dispatch(addToCartAsync({ gameId: game._id }));
  };

  const handleBuyNow = () => {
    console.log('Buy now:', game._id);
  };

  if (loading) {
    return <div className="loading-container">Loading game details...</div>;
  }

  if (!game) {
    return <div className="error-container">Game not found</div>;
  }

  return (
    <div className="game-detail-page">
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

      <button className="back-button" onClick={() => navigate(-1)}>
        <i className="fa-solid fa-arrow-left"></i>
      </button>

      {/* Hero Section */}
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
            
            {game.developer && <p className="developer-name">by {game.developer}</p>}
            
            {game.popularityLabel && (
              <span className="popularity-badge">{game.popularityLabel}</span>
            )}

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

            <div className="tags-section">
              {game.genre && game.genre.map(g => (
                <span key={g} className="genre-tag">{g}</span>
              ))}
              {game.ratings && game.ratings.map(rating => (
                <span key={rating} className="rating-tag">{rating}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="game-detail-content">
        <div className="content-grid">
          {/* Left Section */}
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
              {game.coverImage && (
                <img
                  src={`${BACKEND_URL}/uploads/${game.coverImage}`}
                  alt="Cover"
                  className={`thumbnail ${selectedImage === game.coverImage ? 'active' : ''}`}
                  onClick={() => setSelectedImage(game.coverImage)}
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

              {game.additionalImages && game.additionalImages.map((img, index) => (
                <img
                  key={index}
                  src={`${BACKEND_URL}/uploads/${img}`}
                  alt={`Additional ${index + 1}`}
                  className={`thumbnail ${selectedImage === img ? 'active' : ''}`}
                  onClick={() => setSelectedImage(img)}
                />
              ))}
              
              {game.gameplayPics && game.gameplayPics.map((pic, index) => (
                <img
                  key={index}
                  src={`${BACKEND_URL}/uploads/${pic}`}
                  alt={`Gameplay ${index + 1}`}
                  className={`thumbnail ${selectedImage === pic ? 'active' : ''}`}
                  onClick={() => setSelectedImage(pic)}
                />
              ))}

              {game.trailer && (
                <div 
                  className="video-thumbnail"
                  onClick={() => setShowVideo(!showVideo)}
                >
                  <i className="fa-solid fa-play"></i>
                  <span>Trailer</span>
                </div>
              )}
            </div>

            {/* Video Player */}
            {showVideo && game.trailer && (
              <div className="video-player-container">
                <video 
                  controls 
                  className="game-video"
                  src={`${BACKEND_URL}/uploads/${game.trailer}`}
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
                  className={`tab-btn ${activeTab === 'requirements' ? 'active' : ''}`}
                  onClick={() => setActiveTab('requirements')}
                >
                  System Requirements
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
                    
                    {game.publisher && (
                      <div className="about-info">
                        <strong>Publisher:</strong> {game.publisher}
                      </div>
                    )}
                    
                    {game.releaseDate && (
                      <div className="about-info">
                        <strong>Release Date:</strong> {new Date(game.releaseDate).toLocaleDateString()}
                      </div>
                    )}

                    {game.gameSize && (
                      <div className="about-info">
                        <strong>Download Size:</strong> {game.gameSize} GB
                      </div>
                    )}

                    {game.tags && game.tags.length > 0 && (
                      <div className="about-info">
                        <strong>Tags:</strong>
                        <div className="tags-display">
                          {game.tags.map(tag => (
                            <span key={tag} className="tag-badge">{tag}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'specs' && (
                  <div className="specs-content">
                    <h3>Game Specifications</h3>
                    
                    {game.availablePlatforms && game.availablePlatforms.length > 0 && (
                      <div className="spec-item">
                        <strong>Platforms:</strong>
                        <div className="platform-list">
                          {game.availablePlatforms.map(platform => (
                            <span key={platform} className="platform-badge">{platform}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {game.categories && game.categories.length > 0 && (
                      <div className="spec-item">
                        <strong>Categories:</strong>
                        <div className="category-list">
                          {game.categories.map(cat => (
                            <span key={cat} className="category-badge">{cat}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {game.modes && game.modes.length > 0 && (
                      <div className="spec-item">
                        <strong>Game Modes:</strong>
                        <div className="mode-list">
                          {game.modes.map(mode => (
                            <span key={mode} className="mode-badge">{mode}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="spec-item">
                      <strong>Features:</strong>
                      <ul className="features-list">
                        {game.multiplayerSupport && <li>✓ Multiplayer Support</li>}
                        {game.crossPlatformSupport && <li>✓ Cross-Platform Play</li>}
                        {game.cloudSaveSupport && <li>✓ Cloud Saves</li>}
                        {game.controllerSupport && <li>✓ Controller Support</li>}
                        {game.vrSupport && <li>✓ VR Support</li>}
                      </ul>
                    </div>

                    {game.languageSupport && game.languageSupport.length > 0 && (
                      <div className="spec-item">
                        <strong>Languages:</strong>
                        <p>{game.languageSupport.join(', ')}</p>
                      </div>
                    )}

                    {game.supportedResolutions && game.supportedResolutions.length > 0 && (
                      <div className="spec-item">
                        <strong>Supported Resolutions:</strong>
                        <p>{game.supportedResolutions.join(', ')}</p>
                      </div>
                    )}

                    {game.gameEngine && (
                      <div className="spec-item">
                        <strong>Game Engine:</strong>
                        <p>{game.gameEngine}</p>
                      </div>
                    )}

                    {game.inGamePurchases && (
                      <div className="spec-item warning">
                        <strong>⚠ In-Game Purchases:</strong>
                        <p>{game.inGamePurchasesInfo || 'This game includes in-game purchases'}</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'requirements' && (
                  <div className="requirements-content">
                    <h3>System Requirements</h3>
                    
                    {game.minimumRequirements && Object.keys(game.minimumRequirements).length > 0 && (
                      <div className="req-section">
                        <h4>Minimum</h4>
                        <table className="req-table">
                          <tbody>
                            {game.minimumRequirements.os && (
                              <tr>
                                <td><strong>OS</strong></td>
                                <td>{game.minimumRequirements.os}</td>
                              </tr>
                            )}
                            {game.minimumRequirements.cpu && (
                              <tr>
                                <td><strong>Processor</strong></td>
                                <td>{game.minimumRequirements.cpu}</td>
                              </tr>
                            )}
                            {game.minimumRequirements.ram && (
                              <tr>
                                <td><strong>Memory</strong></td>
                                <td>{game.minimumRequirements.ram}</td>
                              </tr>
                            )}
                            {game.minimumRequirements.gpu && (
                              <tr>
                                <td><strong>Graphics</strong></td>
                                <td>{game.minimumRequirements.gpu}</td>
                              </tr>
                            )}
                            {game.minimumRequirements.storage && (
                              <tr>
                                <td><strong>Storage</strong></td>
                                <td>{game.minimumRequirements.storage}</td>
                              </tr>
                            )}
                            {game.minimumRequirements.directX && (
                              <tr>
                                <td><strong>DirectX</strong></td>
                                <td>{game.minimumRequirements.directX}</td>
                              </tr>
                            )}
                            {game.minimumRequirements.additional && (
                              <tr>
                                <td><strong>Additional Notes</strong></td>
                                <td>{game.minimumRequirements.additional}</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {game.recommendedRequirements && Object.keys(game.recommendedRequirements).length > 0 && (
                      <div className="req-section">
                        <h4>Recommended</h4>
                        <table className="req-table">
                          <tbody>
                            {game.recommendedRequirements.os && (
                              <tr>
                                <td><strong>OS</strong></td>
                                <td>{game.recommendedRequirements.os}</td>
                              </tr>
                            )}
                            {game.recommendedRequirements.cpu && (
                              <tr>
                                <td><strong>Processor</strong></td>
                                <td>{game.recommendedRequirements.cpu}</td>
                              </tr>
                            )}
                            {game.recommendedRequirements.ram && (
                              <tr>
                                <td><strong>Memory</strong></td>
                                <td>{game.recommendedRequirements.ram}</td>
                              </tr>
                            )}
                            {game.recommendedRequirements.gpu && (
                              <tr>
                                <td><strong>Graphics</strong></td>
                                <td>{game.recommendedRequirements.gpu}</td>
                              </tr>
                            )}
                            {game.recommendedRequirements.storage && (
                              <tr>
                                <td><strong>Storage</strong></td>
                                <td>{game.recommendedRequirements.storage}</td>
                              </tr>
                            )}
                            {game.recommendedRequirements.directX && (
                              <tr>
                                <td><strong>DirectX</strong></td>
                                <td>{game.recommendedRequirements.directX}</td>
                              </tr>
                            )}
                            {game.recommendedRequirements.additional && (
                              <tr>
                                <td><strong>Additional Notes</strong></td>
                                <td>{game.recommendedRequirements.additional}</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
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

              {game.offerDuration && game.offerDuration.endDate && (
                <div className="offer-timer">
                  <i className="fa-solid fa-clock"></i>
                  Offer ends: {new Date(game.offerDuration.endDate).toLocaleDateString()}
                </div>
              )}

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
                {game.cloudSaveSupport && (
                  <div className="info-row">
                    <i className="fa-solid fa-cloud"></i>
                    <span>Cloud Saves</span>
                  </div>
                )}
              </div>

              {game.soundtrackAvailability && (
                <div className="soundtrack-info">
                  <i className="fa-solid fa-music"></i>
                  <span>Includes Soundtrack</span>
                  {game.soundtrackUrl && (
                    <a href={game.soundtrackUrl} target="_blank" rel="noopener noreferrer">View</a>
                  )}
                </div>
              )}
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