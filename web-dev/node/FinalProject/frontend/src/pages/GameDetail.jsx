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
  const [selectedType, setSelectedType] = useState('image'); // 'image' or 'video'
  const [activeTab, setActiveTab] = useState('about');

  // Review states
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });
  const [userReview, setUserReview] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Review form states
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchGameDetails();
    checkAuth();
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

  useEffect(() => {
    if (activeTab === 'reviews') {
      fetchReviews();
    }
  }, [activeTab, currentPage, sortBy]);

  useEffect(() => {
    if (isAuthenticated && !isAdmin && activeTab === 'reviews') {
      fetchUserReview();
    }
  }, [isAuthenticated, isAdmin, activeTab]);

  const checkAuth = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/verify`, {
        credentials: 'include'
      });
      const data = await response.json();
      setIsAuthenticated(data.authenticated);
      setIsAdmin(data.user?.isAdmin || false);
    } catch (error) {
      setIsAuthenticated(false);
      setIsAdmin(false);
    }
  };

  // NEW: Track game view
  const trackGameView = async (gameId) => {
    try {
      await fetch(`${BACKEND_URL}/api/user/games/${gameId}/view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Error tracking game view:', error);
    }
  };

  const fetchGameDetails = async () => {
    setLoading(true);
    try {
      const gameRes = await fetch(`${BACKEND_URL}/api/user/games/${id}`);
      const gameData = await gameRes.json();
      
      if (gameRes.ok) {
        setGame(gameData.game);
        
        // NEW: Track view when game details are loaded
        trackGameView(id);
        
        // PRIORITY: Set trailer as default if it exists, otherwise use cover image
        if (gameData.game.trailer) {
          setSelectedImage(gameData.game.trailer);
          setSelectedType('video');
        } else {
          setSelectedImage(gameData.game.coverImage || gameData.game.gamePic);
          setSelectedType('image');
        }
        
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

  const fetchReviews = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/user/games/${id}/reviews?page=${currentPage}&limit=10&sortBy=${sortBy}`
      );
      const data = await response.json();
      
      if (response.ok) {
        setReviews(data.reviews);
        setReviewStats({
          totalReviews: data.totalReviews,
          averageRating: data.averageRating,
          ratingDistribution: data.ratingDistribution
        });
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const fetchUserReview = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/user/games/${id}/reviews/my-review`,
        { credentials: 'include' }
      );
      
      if (response.ok) {
        const data = await response.json();
        setUserReview(data.review);
        setRating(data.review.rating);
        setComment(data.review.comment);
      } else {
        setUserReview(null);
      }
    } catch (error) {
      setUserReview(null);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setReviewError('Please select a rating');
      return;
    }

    setReviewLoading(true);
    setReviewError('');
    setReviewSuccess('');

    try {
      const url = `${BACKEND_URL}/api/user/games/${id}/reviews`;
      const method = isEditMode ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ rating, comment })
      });

      const data = await response.json();

      if (response.ok) {
        setReviewSuccess(isEditMode ? 'Review updated successfully!' : 'Review submitted successfully!');
        setShowReviewForm(false);
        setIsEditMode(false);
        
        await fetchReviews();
        await fetchUserReview();
        await fetchGameDetails();
        
        setTimeout(() => setReviewSuccess(''), 3000);
      } else {
        setReviewError(data.message || 'Failed to submit review');
      }
    } catch (error) {
      setReviewError('Failed to submit review');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleEditReview = () => {
    setIsEditMode(true);
    setShowReviewForm(true);
    setRating(userReview.rating);
    setComment(userReview.comment);
  };

  const handleDeleteReview = async () => {
    if (!window.confirm('Are you sure you want to delete your review?')) {
      return;
    }

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/user/games/${id}/reviews`,
        {
          method: 'DELETE',
          credentials: 'include'
        }
      );

      if (response.ok) {
        setUserReview(null);
        setRating(0);
        setComment('');
        setReviewSuccess('Review deleted successfully!');
        
        await fetchReviews();
        await fetchGameDetails();
        
        setTimeout(() => setReviewSuccess(''), 3000);
      } else {
        const data = await response.json();
        setReviewError(data.message || 'Failed to delete review');
      }
    } catch (error) {
      setReviewError('Failed to delete review');
    }
  };

  const handleCancelReview = () => {
    setShowReviewForm(false);
    setIsEditMode(false);
    setRating(userReview?.rating || 0);
    setComment(userReview?.comment || '');
    setReviewError('');
  };

  const renderStars = (ratingValue, interactive = false, size = 24) => {
    return (
      <div className={`gd-star-rating-wrapper gd-star-size-${size}`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`gd-star-icon ${
              star <= (interactive ? (hoverRating || ratingValue) : ratingValue)
                ? 'gd-star-filled'
                : ''
            } ${interactive ? 'gd-star-interactive' : ''}`}
            onClick={() => interactive && setRating(star)}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  // Handle thumbnail click - switch between image and video
  const handleThumbnailClick = (media, type) => {
    setSelectedImage(media);
    setSelectedType(type);
  };

  if (loading) {
    return <div className="gd-loading-container">Loading game details...</div>;
  }

  if (!game) {
    return <div className="gd-error-container">Game not found</div>;
  }

  return (
    <div className="gd-game-detail-page">
      {successMessage && (
        <div className="gd-toast-message gd-toast-success">
          <i className="fa-solid fa-check-circle"></i>
          {successMessage}
        </div>
      )}
      {cartError && (
        <div className="gd-toast-message gd-toast-error">
          <i className="fa-solid fa-exclamation-circle"></i>
          {cartError}
        </div>
      )}
      {reviewSuccess && (
        <div className="gd-toast-message gd-toast-success">
          <i className="fa-solid fa-check-circle"></i>
          {reviewSuccess}
        </div>
      )}
      {reviewError && (
        <div className="gd-toast-message gd-toast-error">
          <i className="fa-solid fa-exclamation-circle"></i>
          {reviewError}
        </div>
      )}

      <button className="gd-back-button" onClick={() => navigate(-1)}>
        <i className="fa-solid fa-arrow-left"></i>
      </button>

      {/* Hero Section */}
      <div 
        className="gd-game-hero"
        style={{
          backgroundImage: game.backgroundPic 
            ? `url(${BACKEND_URL}/uploads/${game.backgroundPic})` 
            : 'none'
        }}
      >
        <div className="gd-hero-overlay">
          <div className="gd-hero-content">
            <h1 className="gd-game-title">{game.name}</h1>
            
            {game.developer && <p className="gd-developer-name">by {game.developer}</p>}
            
            {game.popularityLabel && (
              <span className="gd-popularity-badge">{game.popularityLabel}</span>
            )}

            <div className="gd-game-stats-bar">
              <div className="gd-stat-item">
                <i className="fa-solid fa-star"></i>
                <span>{game.averageRating ? game.averageRating.toFixed(1) : '0.0'} / 5</span>
              </div>
              <div className="gd-stat-item">
                <i className="fa-solid fa-users"></i>
                <span>{game.purchaseCount || 0} purchases</span>
              </div>
              <div className="gd-stat-item">
                <i className="fa-solid fa-eye"></i>
                <span>{game.viewCount || 0} views</span>
              </div>
              <div className="gd-stat-item">
                <i className="fa-solid fa-comment"></i>
                <span>{reviewStats.totalReviews || 0} reviews</span>
              </div>
            </div>

            <div className="gd-tags-section">
              {game.isFeatured && (
                <span className="gd-badge-featured">
                  <i className="fa-solid fa-crown"></i> Featured
                </span>
              )}
              {game.isTrending && (
                <span className="gd-badge-trending">
                  <i className="fa-solid fa-fire"></i> Trending
                </span>
              )}
              {game.genre && game.genre.map(g => (
                <span key={g} className="gd-genre-tag">{g}</span>
              ))}
              {game.ratings && game.ratings.map(rating => (
                <span key={rating} className="gd-rating-tag">{rating}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="gd-game-detail-content">
        <div className="gd-content-grid">
          {/* Left Section */}
          <div className="gd-left-section">
            {/* Main Image/Video Display */}
            <div className="gd-main-image-container">
              {selectedImage ? (
                selectedType === 'video' ? (
                  <video 
                    controls 
                    className="gd-game-video"
                    src={`${BACKEND_URL}/uploads/${selectedImage}`}
                    muted
                    autoPlay
                    loop
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <img 
                    src={`${BACKEND_URL}/uploads/${selectedImage}`} 
                    alt={game.name}
                    className="gd-main-image"
                  />
                )
              ) : (
                <div className="gd-no-image-placeholder">
                  <i className="fa-solid fa-gamepad"></i>
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            <div className="gd-thumbnail-gallery">
              {/* Video Thumbnail - Show FIRST if trailer exists */}
              {game.trailer && (
                <div 
                  className={`gd-video-thumbnail ${selectedImage === game.trailer && selectedType === 'video' ? 'gd-thumbnail-active' : ''}`}
                  onClick={() => handleThumbnailClick(game.trailer, 'video')}
                >
                  <i className="fa-solid fa-play"></i>
                  <span>Trailer</span>
                </div>
              )}

              {game.coverImage && (
                <img
                  src={`${BACKEND_URL}/uploads/${game.coverImage}`}
                  alt="Cover"
                  className={`gd-thumbnail ${selectedImage === game.coverImage && selectedType === 'image' ? 'gd-thumbnail-active' : ''}`}
                  onClick={() => handleThumbnailClick(game.coverImage, 'image')}
                />
              )}
              
              {game.backgroundPic && (
                <img
                  src={`${BACKEND_URL}/uploads/${game.backgroundPic}`}
                  alt="Background"
                  className={`gd-thumbnail ${selectedImage === game.backgroundPic && selectedType === 'image' ? 'gd-thumbnail-active' : ''}`}
                  onClick={() => handleThumbnailClick(game.backgroundPic, 'image')}
                />
              )}

              {game.additionalImages && game.additionalImages.map((img, index) => (
                <img
                  key={index}
                  src={`${BACKEND_URL}/uploads/${img}`}
                  alt={`Additional ${index + 1}`}
                  className={`gd-thumbnail ${selectedImage === img && selectedType === 'image' ? 'gd-thumbnail-active' : ''}`}
                  onClick={() => handleThumbnailClick(img, 'image')}
                />
              ))}
              
              {game.gameplayPics && game.gameplayPics.map((pic, index) => (
                <img
                  key={index}
                  src={`${BACKEND_URL}/uploads/${pic}`}
                  alt={`Gameplay ${index + 1}`}
                  className={`gd-thumbnail ${selectedImage === pic && selectedType === 'image' ? 'gd-thumbnail-active' : ''}`}
                  onClick={() => handleThumbnailClick(pic, 'image')}
                />
              ))}
            </div>

            {/* Tabs Section */}
            <div className="gd-info-tabs">
              <div className="gd-tab-buttons">
                <button 
                  className={`gd-tab-btn ${activeTab === 'about' ? 'gd-tab-btn-active' : ''}`}
                  onClick={() => setActiveTab('about')}
                >
                  About
                </button>
                <button 
                  className={`gd-tab-btn ${activeTab === 'specs' ? 'gd-tab-btn-active' : ''}`}
                  onClick={() => setActiveTab('specs')}
                >
                  Specifications
                </button>
                <button 
                  className={`gd-tab-btn ${activeTab === 'requirements' ? 'gd-tab-btn-active' : ''}`}
                  onClick={() => setActiveTab('requirements')}
                >
                  System Requirements
                </button>
                <button 
                  className={`gd-tab-btn ${activeTab === 'reviews' ? 'gd-tab-btn-active' : ''}`}
                  onClick={() => setActiveTab('reviews')}
                >
                  Reviews ({reviewStats.totalReviews || 0})
                </button>
              </div>

              <div className="gd-tab-content">
                {activeTab === 'about' && (
                  <div className="gd-about-content">
                    <h3>Description</h3>
                    <p>{game.description}</p>
                    
                    {game.publisher && (
                      <div className="gd-about-info">
                        <strong>Publisher:</strong> {game.publisher}
                      </div>
                    )}
                    
                    {game.releaseDate && (
                      <div className="gd-about-info">
                        <strong>Release Date:</strong> {new Date(game.releaseDate).toLocaleDateString()}
                      </div>
                    )}

                    {game.gameSize && (
                      <div className="gd-about-info">
                        <strong>Download Size:</strong> {game.gameSize} GB
                      </div>
                    )}

                    {game.tags && game.tags.length > 0 && (
                      <div className="gd-about-info">
                        <strong>Tags:</strong>
                        <div className="gd-tags-display">
                          {game.tags.map(tag => (
                            <span key={tag} className="gd-tag-badge">{tag}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'specs' && (
                  <div className="gd-specs-content">
                    <h3>Game Specifications</h3>
                    
                    {game.availablePlatforms && game.availablePlatforms.length > 0 && (
                      <div className="gd-spec-item">
                        <strong>Platforms:</strong>
                        <div className="gd-platform-list">
                          {game.availablePlatforms.map(platform => (
                            <span key={platform} className="gd-platform-badge">{platform}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {game.categories && game.categories.length > 0 && (
                      <div className="gd-spec-item">
                        <strong>Categories:</strong>
                        <div className="gd-category-list">
                          {game.categories.map(cat => (
                            <span key={cat} className="gd-category-badge">{cat}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {game.modes && game.modes.length > 0 && (
                      <div className="gd-spec-item">
                        <strong>Game Modes:</strong>
                        <div className="gd-mode-list">
                          {game.modes.map(mode => (
                            <span key={mode} className="gd-mode-badge">{mode}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="gd-spec-item">
                      <strong>Features:</strong>
                      <ul className="gd-features-list">
                        {game.multiplayerSupport && <li>✓ Multiplayer Support</li>}
                        {game.crossPlatformSupport && <li>✓ Cross-Platform Play</li>}
                        {game.cloudSaveSupport && <li>✓ Cloud Saves</li>}
                        {game.controllerSupport && <li>✓ Controller Support</li>}
                        {game.vrSupport && <li>✓ VR Support</li>}
                      </ul>
                    </div>

                    {game.languageSupport && game.languageSupport.length > 0 && (
                      <div className="gd-spec-item">
                        <strong>Languages:</strong>
                        <p>{game.languageSupport.join(', ')}</p>
                      </div>
                    )}

                    {game.supportedResolutions && game.supportedResolutions.length > 0 && (
                      <div className="gd-spec-item">
                        <strong>Supported Resolutions:</strong>
                        <p>{game.supportedResolutions.join(', ')}</p>
                      </div>
                    )}

                    {game.gameEngine && (
                      <div className="gd-spec-item">
                        <strong>Game Engine:</strong>
                        <p>{game.gameEngine}</p>
                      </div>
                    )}

                    {game.inGamePurchases && (
                      <div className="gd-spec-item gd-spec-warning">
                        <strong>⚠ In-Game Purchases:</strong>
                        <p>{game.inGamePurchasesInfo || 'This game includes in-game purchases'}</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'requirements' && (
                  <div className="gd-requirements-content">
                    <h3>System Requirements</h3>
                    
                    {game.minimumRequirements && Object.keys(game.minimumRequirements).length > 0 && (
                      <div className="gd-req-section">
                        <h4>Minimum</h4>
                        <table className="gd-req-table">
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
                      <div className="gd-req-section">
                        <h4>Recommended</h4>
                        <table className="gd-req-table">
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
                  <div className="gd-reviews-content">
                    {/* Review Stats Overview */}
                    <div className="gd-review-stats-overview">
                      <div className="gd-average-rating-box">
                        <div className="gd-rating-number-large">
                          {reviewStats.averageRating ? reviewStats.averageRating.toFixed(1) : '0.0'}
                        </div>
                        {renderStars(Math.round(reviewStats.averageRating || 0), false, 28)}
                        <div className="gd-total-reviews-text">
                          {reviewStats.totalReviews} review{reviewStats.totalReviews !== 1 ? 's' : ''}
                        </div>
                      </div>

                      <div className="gd-rating-distribution-box">
                        {[5, 4, 3, 2, 1].map((star) => {
                          const count = reviewStats.ratingDistribution[star] || 0;
                          const percentage = reviewStats.totalReviews > 0
                            ? (count / reviewStats.totalReviews) * 100
                            : 0;
                          
                          return (
                            <div key={star} className="gd-rating-bar-row">
                              <span className="gd-star-label">{star} ★</span>
                              <div className="gd-bar-container">
                                <div 
                                  className="gd-bar-fill" 
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="gd-count-label">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* User Review Section */}
                    {isAuthenticated && !isAdmin && (
                      <div className="gd-user-review-section">
                        {userReview && !showReviewForm && (
                          <div className="gd-user-existing-review">
                            <h3>Your Review</h3>
                            <div className="gd-review-card gd-user-review-card">
                              <div className="gd-review-header-row">
                                {renderStars(userReview.rating, false, 20)}
                                <span className="gd-review-date">
                                  {formatDate(userReview.createdAt)}
                                </span>
                              </div>
                              {userReview.comment && (
                                <p className="gd-review-comment">{userReview.comment}</p>
                              )}
                              <div className="gd-review-actions">
                                <button 
                                  className="gd-btn-edit"
                                  onClick={handleEditReview}
                                >
                                  <i className="fa-solid fa-edit"></i> Edit
                                </button>
                                <button 
                                  className="gd-btn-delete"
                                  onClick={handleDeleteReview}
                                >
                                  <i className="fa-solid fa-trash"></i> Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {!userReview && !showReviewForm && (
                          <button
                            className="gd-btn-write-review"
                            onClick={() => setShowReviewForm(true)}
                          >
                            <i className="fa-solid fa-pen"></i> Write a Review
                          </button>
                        )}

                        {showReviewForm && (
                          <div className="gd-review-form-container">
                            <h3>{isEditMode ? 'Edit Your Review' : 'Write a Review'}</h3>
                            <form onSubmit={handleSubmitReview}>
                              <div className="gd-form-group">
                                <label>Rating *</label>
                                {renderStars(rating, true, 32)}
                              </div>

                              <div className="gd-form-group">
                                <label htmlFor="comment">Your Review (Optional)</label>
                                <textarea
                                  id="comment"
                                  value={comment}
                                  onChange={(e) => setComment(e.target.value)}
                                  placeholder="Share your thoughts about this game..."
                                  rows="5"
                                  maxLength="1000"
                                  className="gd-review-textarea"
                                />
                                <small>{comment.length}/1000 characters</small>
                              </div>

                              <div className="gd-form-actions">
                                <button 
                                  type="submit"
                                  className="gd-btn-submit-review"
                                  disabled={reviewLoading || rating === 0}
                                >
                                  {reviewLoading ? (
                                    <>
                                      <i className="fa-solid fa-spinner fa-spin"></i> Submitting...
                                    </>
                                  ) : (
                                    <>
                                      <i className="fa-solid fa-check"></i> {isEditMode ? 'Update Review' : 'Submit Review'}
                                    </>
                                  )}
                                </button>
                                <button 
                                  type="button"
                                  className="gd-btn-cancel-review"
                                  onClick={handleCancelReview}
                                  disabled={reviewLoading}
                                >
                                  <i className="fa-solid fa-times"></i> Cancel
                                </button>
                              </div>
                            </form>
                          </div>
                        )}
                      </div>
                    )}

                    {!isAuthenticated && (
                      <div className="gd-login-prompt">
                        <i className="fa-solid fa-lock"></i>
                        <p>Please log in to write a review</p>
                        <button 
                          className="gd-btn-login"
                          onClick={() => navigate('/login')}
                        >
                          Log In
                        </button>
                      </div>
                    )}

                    {isAdmin && (
                      <div className="gd-admin-notice">
                        <i className="fa-solid fa-info-circle"></i>
                        <p>Admins cannot review games</p>
                      </div>
                    )}

                    {/* Reviews List */}
                    <div className="gd-reviews-list-section">
                      <div className="gd-reviews-header">
                        <h3>All Reviews</h3>
                        <div className="gd-sort-controls">
                          <label>Sort by:</label>
                          <select 
                            value={sortBy} 
                            onChange={(e) => {
                              setSortBy(e.target.value);
                              setCurrentPage(1);
                            }}
                            className="gd-sort-select"
                          >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="highest">Highest Rating</option>
                            <option value="lowest">Lowest Rating</option>
                          </select>
                        </div>
                      </div>

                      {reviews.length > 0 ? (
                        <>
                          <div className="gd-reviews-list">
                            {reviews.map((review) => (
                              <div key={review._id} className="gd-review-item">
                                <div className="gd-review-header">
                                  <div className="gd-reviewer-info">
                                    <div className="gd-reviewer-avatar">
                                      {review.user?.profilePicUrl ? (
                                        <img 
                                          src={review.user.profilePicUrl.startsWith('http') 
                                            ? review.user.profilePicUrl 
                                            : `${BACKEND_URL}${review.user.profilePicUrl}`
                                          } 
                                          alt={review.user.username || 'User'}
                                          onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextElementSibling.style.display = 'flex';
                                          }}
                                        />
                                      ) : null}
                                      <div 
                                        className="gd-avatar-placeholder" 
                                        style={{ 
                                          display: review.user?.profilePicUrl ? 'none' : 'flex',
                                          width: '40px',
                                          height: '40px',
                                          borderRadius: '50%',
                                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                          color: 'white',
                                          fontSize: '18px',
                                          fontWeight: 'bold',
                                          alignItems: 'center',
                                          justifyContent: 'center'
                                        }}
                                      >
                                        {review.user?.username?.charAt(0).toUpperCase() || 'U'}
                                      </div>
                                    </div>
                                    <div className="gd-reviewer-details">
                                      <span className="gd-reviewer-name">
                                        {review.user?.username || 'Anonymous'}
                                      </span>
                                      <span className="gd-review-date">
                                        {formatDate(review.createdAt)}
                                      </span>
                                    </div>
                                  </div>
                                  {renderStars(review.rating, false, 18)}
                                </div>
                                {review.comment && (
                                  <p className="gd-review-comment">{review.comment}</p>
                                )}
                                {review.updatedAt && review.updatedAt !== review.createdAt && (
                                  <div className="gd-review-edited">
                                    <i className="fa-solid fa-pencil"></i>
                                    <span>Edited on {formatDate(review.updatedAt)}</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Pagination */}
                          {totalPages > 1 && (
                            <div className="gd-pagination">
                              <button
                                className="gd-pagination-btn"
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                              >
                                <i className="fa-solid fa-chevron-left"></i> Previous
                              </button>
                              
                              <div className="gd-pagination-info">
                                Page {currentPage} of {totalPages}
                              </div>

                              <button
                                className="gd-pagination-btn"
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                              >
                                Next <i className="fa-solid fa-chevron-right"></i>
                              </button>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="gd-no-reviews">
                          <i className="fa-solid fa-comment-slash"></i>
                          <p>No reviews yet. Be the first to review this game!</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Section - Purchase Card */}
          <div className="gd-right-section">
            <div className="gd-purchase-card">
              <div className="gd-price-section">
                {game.price === 0 ? (
                  <div className="gd-free-game">
                    <span className="gd-free-label">FREE TO PLAY</span>
                  </div>
                ) : game.discount > 0 ? (
                  <div className="gd-discounted-price-section">
                    <div className="gd-discount-badge-large">-{game.discount}%</div>
                    <div className="gd-price-info">
                      <span className="gd-original-price-large">₹{game.price}</span>
                      <span className="gd-final-price-large">₹{calculateDiscountedPrice()}</span>
                    </div>
                    <span className="gd-savings">You save ₹{(game.price - calculateDiscountedPrice()).toFixed(2)}</span>
                  </div>
                ) : (
                  <div className="gd-regular-price-section">
                    <span className="gd-price-large">₹{game.price}</span>
                  </div>
                )}
              </div>

              {game.offerDuration && game.offerDuration.endDate && (
                <div className="gd-offer-timer">
                  <i className="fa-solid fa-clock"></i>
                  Offer ends: {new Date(game.offerDuration.endDate).toLocaleDateString()}
                </div>
              )}

              <div className="gd-purchase-buttons">
                <button className="gd-btn-buy-now" onClick={handleBuyNow}>
                  <i className="fa-solid fa-bolt"></i>
                  {game.price === 0 ? 'Play Now' : 'Buy Now'}
                </button>
                <button 
                  className="gd-btn-add-cart" 
                  onClick={handleAddToCart}
                  disabled={cartLoading}
                >
                  <i className="fa-solid fa-cart-shopping"></i>
                  {cartLoading ? 'Adding...' : 'Add to Cart'}
                </button>
              </div>

              <div className="gd-additional-info">
                <div className="gd-info-row">
                  <i className="fa-solid fa-shield-halved"></i>
                  <span>Secure Payment</span>
                </div>
                <div className="gd-info-row">
                  <i className="fa-solid fa-download"></i>
                  <span>Instant Download</span>
                </div>
                <div className="gd-info-row">
                  <i className="fa-solid fa-headset"></i>
                  <span>24/7 Support</span>
                </div>
                {game.cloudSaveSupport && (
                  <div className="gd-info-row">
                    <i className="fa-solid fa-cloud"></i>
                    <span>Cloud Saves</span>
                  </div>
                )}
              </div>

              {game.soundtrackAvailability && (
                <div className="gd-soundtrack-info">
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
          <div className="gd-related-games-section">
            <h2 className="gd-section-title">You May Also Like</h2>
            <div className="gd-related-games-grid">
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
