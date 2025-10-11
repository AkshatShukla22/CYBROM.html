import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BACKEND_URL from '../utils/BackendURL';
// import '../styles/AdminGameDetails.css';

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
        {/* Main Game Picture */}
        <div className="main-image-section">
          {game.gamePic && (
            <img 
              src={`${BACKEND_URL}/uploads/${game.gamePic}`} 
              alt={game.name}
              className="main-game-image"
            />
          )}
        </div>

        {/* Background Picture */}
        {game.backgroundPic && (
          <div className="background-image-section">
            <h3>Background Image</h3>
            <img 
              src={`${BACKEND_URL}/uploads/${game.backgroundPic}`} 
              alt={`${game.name} background`}
              className="background-image"
            />
          </div>
        )}

        {/* Game Information */}
        <div className="game-info-section">
          <h2>Game Information</h2>
          
          <div className="info-item">
            <strong>Description:</strong>
            <p>{game.description}</p>
          </div>

          <div className="info-item">
            <strong>Price Information:</strong>
            <div className="price-display">
              {game.discount > 0 ? (
                <>
                  <span className="original-price">Original: ₹{game.price}</span>
                  <span className="discounted-price">
                    Discounted: ₹{calculateDiscountedPrice()}
                  </span>
                  <span className="discount-badge">-{game.discount}% OFF</span>
                </>
              ) : (
                <span className="current-price">₹{game.price}</span>
              )}
            </div>
          </div>

          <div className="info-item">
            <strong>Age Ratings:</strong>
            <div className="tags-container">
              {game.ratings && game.ratings.length > 0 ? (
                game.ratings.map(rating => (
                  <span key={rating} className="rating-tag">{rating}</span>
                ))
              ) : (
                <span>No ratings specified</span>
              )}
            </div>
          </div>

          <div className="info-item">
            <strong>Categories:</strong>
            <div className="tags-container">
              {game.categories && game.categories.length > 0 ? (
                game.categories.map(category => (
                  <span key={category} className="category-tag">{category}</span>
                ))
              ) : (
                <span>No categories specified</span>
              )}
            </div>
          </div>

          <div className="info-item">
            <strong>Consoles:</strong>
            <div className="tags-container">
              {game.consoles && game.consoles.length > 0 ? (
                game.consoles.map(console => (
                  <span key={console} className="console-tag">{console}</span>
                ))
              ) : (
                <span>No consoles specified</span>
              )}
            </div>
          </div>

          <div className="info-item">
            <strong>Statistics:</strong>
            <div className="stats-display">
              <span>Purchases: {game.purchaseCount || 0}</span>
              <span>Average Rating: ⭐ {game.averageRating ? game.averageRating.toFixed(1) : '0.0'}/5</span>
            </div>
          </div>
        </div>

        {/* Gameplay Pictures */}
        {game.gameplayPics && game.gameplayPics.length > 0 && (
          <div className="gameplay-section">
            <h3>Gameplay Screenshots</h3>
            <div className="gameplay-grid">
              {game.gameplayPics.map((pic, index) => (
                <img 
                  key={index}
                  src={`${BACKEND_URL}/uploads/${pic}`} 
                  alt={`${game.name} gameplay ${index + 1}`}
                  className="gameplay-image"
                />
              ))}
            </div>
          </div>
        )}

        {/* Video */}
        {game.video && (
          <div className="video-section">
            <h3>Gameplay Video</h3>
            <video 
              controls 
              className="gameplay-video"
              src={`${BACKEND_URL}/uploads/${game.video}`}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        )}

        {/* Discount Management */}
        <div className="discount-management">
          <h3>Discount Management</h3>
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
            <button 
              className="apply-discount-btn"
              onClick={handleSetDiscount}
            >
              Apply Discount
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button 
            className="edit-btn"
            onClick={() => navigate(`/admin?edit=${game._id}`)}
          >
            Edit Game
          </button>
          <button 
            className="delete-btn"
            onClick={handleDeleteGame}
          >
            Delete Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminGameDetails;