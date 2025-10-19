import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BACKEND_URL from '../utils/BackendURL';

const AdminGameDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [discountInput, setDiscountInput] = useState(0);

  useEffect(() => {
    fetchGameDetails();
  }, [id]);

  const fetchGameDetails = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/games/${id}`, {
        credentials: 'include'
      });
      
      if (response.status === 401) {
        navigate('/login');
        return;
      }

      const data = await response.json();
      if (response.ok) {
        setGame(data.game);
        setDiscountInput(data.game.discount || 0);
      } else {
        setMessage({ type: 'error', text: 'Failed to load game details' });
      }
    } catch (error) {
      console.error('Error fetching game details:', error);
      setMessage({ type: 'error', text: 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSetDiscount = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/games/${id}/discount`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ discount: parseFloat(discountInput) })
      });

      if (response.status === 401) {
        navigate('/login');
        return;
      }

      if (response.ok) {
        setMessage({ type: 'success', text: 'Discount updated!' });
        fetchGameDetails();
      } else {
        setMessage({ type: 'error', text: 'Failed to update discount' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error' });
      console.error('Set discount error:', error);
    }
  };

  const handleDeleteGame = async () => {
    if (!window.confirm('Are you sure you want to delete this game?')) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/games/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.status === 401) {
        navigate('/login');
        return;
      }

      if (response.ok) {
        setMessage({ type: 'success', text: 'Game deleted!' });
        setTimeout(() => navigate('/admin'), 1500);
      } else {
        setMessage({ type: 'error', text: 'Failed to delete game' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error' });
      console.error('Delete game error:', error);
    }
  };

  const calculateDiscountedPrice = () => {
    if (game.discount > 0) {
      return (game.price - (game.price * game.discount / 100)).toFixed(2);
    }
    return game.price;
  };

  if (loading) {
    return <div className="loading">Loading game details...</div>;
  }

  if (!game) {
    return <div className="error">Game not found</div>;
  }

  return (
    <div className="admin-game-details">
      <div className="details-header">
        <button className="back-btn" onClick={() => navigate('/admin')}>
          ← Back to Admin Panel
        </button>
        <h1>{game.name}</h1>
      </div>

      {message.text && (
        <div className={`message-alert ${message.type === 'success' ? 'message-success' : 'message-error'}`}>
          {message.text}
        </div>
      )}

      <div className="details-content">
        {/* Basic Information */}
        <section className="detail-section">
          <h2>Basic Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <strong>Game Name:</strong>
              <p>{game.name}</p>
            </div>
            {game.developer && (
              <div className="info-item">
                <strong>Developer:</strong>
                <p>{game.developer}</p>
              </div>
            )}
            {game.publisher && (
              <div className="info-item">
                <strong>Publisher:</strong>
                <p>{game.publisher}</p>
              </div>
            )}
            {game.releaseDate && (
              <div className="info-item">
                <strong>Release Date:</strong>
                <p>{new Date(game.releaseDate).toLocaleDateString()}</p>
              </div>
            )}
            {game.version && (
              <div className="info-item">
                <strong>Version:</strong>
                <p>{game.version}</p>
              </div>
            )}
            {game.gameSize && (
              <div className="info-item">
                <strong>Game Size:</strong>
                <p>{game.gameSize} GB</p>
              </div>
            )}
          </div>
          <div className="info-item">
            <strong>Description:</strong>
            <p>{game.description}</p>
          </div>
        </section>

        {/* Media Assets */}
        <section className="detail-section">
          <h2>Media Assets</h2>
          
          {game.coverImage && (
            <div className="media-item">
              <h3>Cover Image</h3>
              <img 
                src={`${BACKEND_URL}/uploads/${game.coverImage}`} 
                alt="Cover"
                className="media-image"
              />
            </div>
          )}

          {game.backgroundPic && (
            <div className="media-item">
              <h3>Background Image</h3>
              <img 
                src={`${BACKEND_URL}/uploads/${game.backgroundPic}`} 
                alt="Background"
                className="media-image"
              />
            </div>
          )}

          {game.additionalImages && game.additionalImages.length > 0 && (
            <div className="media-item">
              <h3>Additional Images</h3>
              <div className="media-grid">
                {game.additionalImages.map((img, index) => (
                  <img 
                    key={index}
                    src={`${BACKEND_URL}/uploads/${img}`} 
                    alt={`Additional ${index + 1}`}
                    className="media-image-small"
                  />
                ))}
              </div>
            </div>
          )}

          {game.gameplayPics && game.gameplayPics.length > 0 && (
            <div className="media-item">
              <h3>Gameplay Screenshots</h3>
              <div className="media-grid">
                {game.gameplayPics.map((pic, index) => (
                  <img 
                    key={index}
                    src={`${BACKEND_URL}/uploads/${pic}`} 
                    alt={`Gameplay ${index + 1}`}
                    className="media-image-small"
                  />
                ))}
              </div>
            </div>
          )}

          {game.trailer && (
            <div className="media-item">
              <h3>Trailer</h3>
              <video 
                controls 
                className="media-video"
                src={`${BACKEND_URL}/uploads/${game.trailer}`}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}
        </section>

        {/* Classification */}
        <section className="detail-section">
          <h2>Classification & Tags</h2>
          
          {game.genre && game.genre.length > 0 && (
            <div className="info-item">
              <strong>Genre:</strong>
              <div className="tags-container">
                {game.genre.map(g => (
                  <span key={g} className="tag-badge">{g}</span>
                ))}
              </div>
            </div>
          )}

          {game.categories && game.categories.length > 0 && (
            <div className="info-item">
              <strong>Categories:</strong>
              <div className="tags-container">
                {game.categories.map(cat => (
                  <span key={cat} className="tag-badge">{cat}</span>
                ))}
              </div>
            </div>
          )}

          {game.ratings && game.ratings.length > 0 && (
            <div className="info-item">
              <strong>Age Ratings:</strong>
              <div className="tags-container">
                {game.ratings.map(rating => (
                  <span key={rating} className="tag-badge rating">{rating}</span>
                ))}
              </div>
            </div>
          )}

          {game.tags && game.tags.length > 0 && (
            <div className="info-item">
              <strong>Custom Tags:</strong>
              <div className="tags-container">
                {game.tags.map(tag => (
                  <span key={tag} className="tag-badge custom">{tag}</span>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Gameplay & Modes */}
        <section className="detail-section">
          <h2>Gameplay & Modes</h2>
          
          {game.modes && game.modes.length > 0 && (
            <div className="info-item">
              <strong>Game Modes:</strong>
              <div className="tags-container">
                {game.modes.map(mode => (
                  <span key={mode} className="tag-badge">{mode}</span>
                ))}
              </div>
            </div>
          )}

          <div className="features-grid">
            <div className="feature-item">
              <strong>Multiplayer:</strong>
              <span className={game.multiplayerSupport ? 'enabled' : 'disabled'}>
                {game.multiplayerSupport ? '✓ Yes' : '✗ No'}
              </span>
            </div>
            <div className="feature-item">
              <strong>Cross-Platform:</strong>
              <span className={game.crossPlatformSupport ? 'enabled' : 'disabled'}>
                {game.crossPlatformSupport ? '✓ Yes' : '✗ No'}
              </span>
            </div>
            <div className="feature-item">
              <strong>Cloud Save:</strong>
              <span className={game.cloudSaveSupport ? 'enabled' : 'disabled'}>
                {game.cloudSaveSupport ? '✓ Yes' : '✗ No'}
              </span>
            </div>
          </div>
        </section>

        {/* Features & Technology */}
        <section className="detail-section">
          <h2>Features & Technology</h2>
          
          {game.gameEngine && (
            <div className="info-item">
              <strong>Game Engine:</strong>
              <p>{game.gameEngine}</p>
            </div>
          )}

          <div className="features-grid">
            <div className="feature-item">
              <strong>Controller Support:</strong>
              <span className={game.controllerSupport ? 'enabled' : 'disabled'}>
                {game.controllerSupport ? '✓ Yes' : '✗ No'}
              </span>
            </div>
            <div className="feature-item">
              <strong>VR Support:</strong>
              <span className={game.vrSupport ? 'enabled' : 'disabled'}>
                {game.vrSupport ? '✓ Yes' : '✗ No'}
              </span>
            </div>
          </div>

          {game.supportedResolutions && game.supportedResolutions.length > 0 && (
            <div className="info-item">
              <strong>Supported Resolutions:</strong>
              <div className="tags-container">
                {game.supportedResolutions.map(res => (
                  <span key={res} className="tag-badge">{res}</span>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Platforms */}
        <section className="detail-section">
          <h2>Available Platforms</h2>
          {game.availablePlatforms && game.availablePlatforms.length > 0 && (
            <div className="tags-container">
              {game.availablePlatforms.map(platform => (
                <span key={platform} className="tag-badge platform">{platform}</span>
              ))}
            </div>
          )}
        </section>

        {/* Languages */}
        <section className="detail-section">
          <h2>Language Support</h2>
          {game.languageSupport && game.languageSupport.length > 0 && (
            <div className="tags-container">
              {game.languageSupport.map(lang => (
                <span key={lang} className="tag-badge">{lang}</span>
              ))}
            </div>
          )}
        </section>

        {/* System Requirements */}
        {(game.minimumRequirements || game.recommendedRequirements) && (
          <section className="detail-section">
            <h2>System Requirements</h2>
            
            {game.minimumRequirements && Object.keys(game.minimumRequirements).length > 0 && (
              <div className="requirements-block">
                <h3>Minimum</h3>
                <div className="requirements-grid">
                  {game.minimumRequirements.os && <div><strong>OS:</strong> {game.minimumRequirements.os}</div>}
                  {game.minimumRequirements.cpu && <div><strong>CPU:</strong> {game.minimumRequirements.cpu}</div>}
                  {game.minimumRequirements.ram && <div><strong>RAM:</strong> {game.minimumRequirements.ram}</div>}
                  {game.minimumRequirements.gpu && <div><strong>GPU:</strong> {game.minimumRequirements.gpu}</div>}
                  {game.minimumRequirements.storage && <div><strong>Storage:</strong> {game.minimumRequirements.storage}</div>}
                  {game.minimumRequirements.directX && <div><strong>DirectX:</strong> {game.minimumRequirements.directX}</div>}
                  {game.minimumRequirements.additional && <div><strong>Notes:</strong> {game.minimumRequirements.additional}</div>}
                </div>
              </div>
            )}

            {game.recommendedRequirements && Object.keys(game.recommendedRequirements).length > 0 && (
              <div className="requirements-block">
                <h3>Recommended</h3>
                <div className="requirements-grid">
                  {game.recommendedRequirements.os && <div><strong>OS:</strong> {game.recommendedRequirements.os}</div>}
                  {game.recommendedRequirements.cpu && <div><strong>CPU:</strong> {game.recommendedRequirements.cpu}</div>}
                  {game.recommendedRequirements.ram && <div><strong>RAM:</strong> {game.recommendedRequirements.ram}</div>}
                  {game.recommendedRequirements.gpu && <div><strong>GPU:</strong> {game.recommendedRequirements.gpu}</div>}
                  {game.recommendedRequirements.storage && <div><strong>Storage:</strong> {game.recommendedRequirements.storage}</div>}
                  {game.recommendedRequirements.directX && <div><strong>DirectX:</strong> {game.recommendedRequirements.directX}</div>}
                  {game.recommendedRequirements.additional && <div><strong>Notes:</strong> {game.recommendedRequirements.additional}</div>}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Pricing */}
        <section className="detail-section">
          <h2>Pricing Information</h2>
          <div className="price-display">
            {game.discount > 0 ? (
              <>
                <span className="original-price">Original: ₹{game.price}</span>
                <span className="discounted-price">Discounted: ₹{calculateDiscountedPrice()}</span>
                <span className="discount-badge">-{game.discount}% OFF</span>
              </>
            ) : (
              <span className="current-price">₹{game.price}</span>
            )}
          </div>

          {game.offerDuration && (game.offerDuration.startDate || game.offerDuration.endDate) && (
            <div className="offer-duration">
              {game.offerDuration.startDate && <p><strong>Offer Start:</strong> {new Date(game.offerDuration.startDate).toLocaleDateString()}</p>}
              {game.offerDuration.endDate && <p><strong>Offer End:</strong> {new Date(game.offerDuration.endDate).toLocaleDateString()}</p>}
            </div>
          )}

          <div className="features-grid">
            <div className="feature-item">
              <strong>In-Game Purchases:</strong>
              <span className={game.inGamePurchases ? 'enabled' : 'disabled'}>
                {game.inGamePurchases ? '✓ Yes' : '✗ No'}
              </span>
            </div>
          </div>

          {game.inGamePurchases && game.inGamePurchasesInfo && (
            <div className="info-item">
              <strong>In-Game Purchases Info:</strong>
              <p>{game.inGamePurchasesInfo}</p>
            </div>
          )}
        </section>

        {/* Audio & Soundtrack */}
        {game.soundtrackAvailability && (
          <section className="detail-section">
            <h2>Audio & Soundtrack</h2>
            <div className="info-item">
              <strong>Soundtrack Available:</strong>
              <p>✓ Yes</p>
              {game.soundtrackUrl && <p><a href={game.soundtrackUrl} target="_blank" rel="noopener noreferrer">View Soundtrack</a></p>}
            </div>
          </section>
        )}

        {/* Popularity */}
        <section className="detail-section">
          <h2>Popularity & Stats</h2>
          <div className="info-grid">
            <div className="info-item">
              <strong>Trending:</strong>
              <p>{game.isTrending ? '✓ Yes' : '✗ No'}</p>
            </div>
            {game.popularityLabel && (
              <div className="info-item">
                <strong>Label:</strong>
                <span className="popularity-badge">{game.popularityLabel}</span>
              </div>
            )}
            <div className="info-item">
              <strong>Purchases:</strong>
              <p>{game.purchaseCount || 0}</p>
            </div>
            <div className="info-item">
              <strong>Average Rating:</strong>
              <p>⭐ {game.averageRating ? game.averageRating.toFixed(1) : '0.0'}/5</p>
            </div>
          </div>
        </section>

        {/* Discount Management */}
        <section className="detail-section">
          <h2>Discount Management</h2>
          <div className="discount-controls">
            <label>Set Discount (%):</label>
            <input 
              type="number" 
              min="0" 
              max="100" 
              value={discountInput}
              onChange={(e) => setDiscountInput(e.target.value)}
              className="discount-input"
            />
            <button className="apply-discount-btn" onClick={handleSetDiscount}>
              Apply Discount
            </button>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button className="edit-btn" onClick={() => navigate(`/admin?edit=${game._id}`)}>
            Edit Game
          </button>
          <button className="delete-btn" onClick={handleDeleteGame}>
            Delete Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminGameDetails;
