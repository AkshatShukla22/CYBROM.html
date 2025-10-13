import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BACKEND_URL from '../utils/BackendURL';
import AdminSupportPanel from '../pages/AdminSupportPanel';
import '../styles/AdminPanel.css';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('games');
  const [games, setGames] = useState([]);
  const [users, setUsers] = useState([]);
  const [news, setNews] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showAddGame, setShowAddGame] = useState(false);
  const [showAddNews, setShowAddNews] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [editingNews, setEditingNews] = useState(null);
  const [purchases, setPurchases] = useState([]);
  
  const [gameForm, setGameForm] = useState({
    name: '',
    description: '',
    price: '',
    discount: 0,
    ratings: [],
    categories: [],
    consoles: [],
    gamePic: null,
    backgroundPic: null,
    gameplayPics: [null, null, null, null],
    video: null
  });

  const [newsForm, setNewsForm] = useState({
    heading: '',
    description: '',
    gameName: '',
    headingImage: null,
    detailImage: null
  });

  const consoleOptions = ['PlayStation 5', 'PlayStation 4', 'Xbox Series X/S', 'Xbox One', 'Nintendo Switch', 'PC'];
  const ratingOptions = ['Everyone', 'Teen', '18+', 'Mature', 'Violence', 'Horror'];
  const categoryOptions = ['Action', 'Adventure', 'RPG', 'Horror', 'Sports', 'Racing', 'Strategy', 'Simulation', 'Puzzle', 'Fighting', 'Shooter', 'Open World'];

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    fetchGames();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'purchases') fetchPurchases();
    if (activeTab === 'news') fetchNews();
  }, [activeTab]);

  const checkAuth = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/verify`, {
        credentials: 'include'
      });
      if (!response.ok) {
        navigate('/login');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      navigate('/login');
    }
  };

  const fetchGames = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/games`, {
        credentials: 'include'
      });
      if (response.status === 401) {
        navigate('/login');
        return;
      }
      const data = await response.json();
      if (response.ok) setGames(data.games);
    } catch (error) {
      console.error('Error fetching games:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/users`, {
        credentials: 'include'
      });
      if (response.status === 401) {
        navigate('/login');
        return;
      }
      const data = await response.json();
      if (response.ok) setUsers(data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchNews = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/news`, {
        credentials: 'include'
      });
      if (response.status === 401) {
        navigate('/login');
        return;
      }
      const data = await response.json();
      if (response.ok) setNews(data.news);
    } catch (error) {
      console.error('Error fetching news:', error);
    }
  };

  const fetchPurchases = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/purchases`, {
        credentials: 'include'
      });
      if (response.status === 401) {
        navigate('/login');
        return;
      }
      const data = await response.json();
      if (response.ok) setPurchases(data.purchases);
    } catch (error) {
      console.error('Error fetching purchases:', error);
    }
  };

  const fetchUserDetails = async (userId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/users/${userId}`, {
        credentials: 'include'
      });
      if (response.status === 401) {
        navigate('/login');
        return;
      }
      const data = await response.json();
      if (response.ok) setSelectedUser(data);
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const handleGameFormChange = (e) => {
    const { name, value } = e.target;
    setGameForm({ ...gameForm, [name]: value });
  };

  const handleNewsFormChange = (e) => {
    const { name, value } = e.target;
    setNewsForm({ ...newsForm, [name]: value });
  };

  const handleMultiSelectToggle = (field, value) => {
    const current = gameForm[field];
    const updated = current.includes(value)
      ? current.filter(item => item !== value)
      : [...current, value];
    setGameForm({ ...gameForm, [field]: updated });
  };

  const handleFileChange = (e, field, index = null) => {
    const file = e.target.files[0];
    if (index !== null) {
      const newPics = [...gameForm.gameplayPics];
      newPics[index] = file;
      setGameForm({ ...gameForm, gameplayPics: newPics });
    } else {
      setGameForm({ ...gameForm, [field]: file });
    }
  };

  const handleNewsImageChange = (e, field) => {
    setNewsForm({ ...newsForm, [field]: e.target.files[0] });
  };

  const handleAddGame = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    const formData = new FormData();
    formData.append('name', gameForm.name);
    formData.append('description', gameForm.description);
    formData.append('price', gameForm.price);
    formData.append('discount', gameForm.discount);
    formData.append('ratings', JSON.stringify(gameForm.ratings));
    formData.append('categories', JSON.stringify(gameForm.categories));
    formData.append('consoles', JSON.stringify(gameForm.consoles));
    
    if (gameForm.gamePic) formData.append('gamePic', gameForm.gamePic);
    if (gameForm.backgroundPic) formData.append('backgroundPic', gameForm.backgroundPic);
    if (gameForm.video) formData.append('video', gameForm.video);
    
    gameForm.gameplayPics.forEach((pic, index) => {
      if (pic) formData.append(`gameplayPic${index}`, pic);
    });

    try {
      const url = editingGame 
        ? `${BACKEND_URL}/api/admin/games/${editingGame._id}`
        : `${BACKEND_URL}/api/admin/games`;
      
      const response = await fetch(url, {
        method: editingGame ? 'PUT' : 'POST',
        credentials: 'include',
        body: formData
      });

      if (response.status === 401) {
        navigate('/login');
        return;
      }

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: editingGame ? 'Game updated!' : 'Game added!' });
        resetGameForm();
        fetchGames();
        setShowAddGame(false);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to save game' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error' });
      console.error('Add/Edit game error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNews = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    const formData = new FormData();
    formData.append('heading', newsForm.heading);
    formData.append('description', newsForm.description);
    formData.append('gameName', newsForm.gameName);
    if (newsForm.headingImage) formData.append('headingImage', newsForm.headingImage);
    if (newsForm.detailImage) formData.append('detailImage', newsForm.detailImage);

    try {
      const url = editingNews 
        ? `${BACKEND_URL}/api/admin/news/${editingNews._id}`
        : `${BACKEND_URL}/api/admin/news`;
      
      const response = await fetch(url, {
        method: editingNews ? 'PUT' : 'POST',
        credentials: 'include',
        body: formData
      });

      if (response.status === 401) {
        navigate('/login');
        return;
      }

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: editingNews ? 'News updated!' : 'News added!' });
        resetNewsForm();
        fetchNews();
        setShowAddNews(false);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to save news' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error' });
      console.error('Add/Edit news error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGame = async (gameId) => {
    if (!window.confirm('Are you sure you want to delete this game?')) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/games/${gameId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.status === 401) {
        navigate('/login');
        return;
      }

      if (response.ok) {
        setMessage({ type: 'success', text: 'Game deleted!' });
        fetchGames();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete game' });
      console.error('Delete game error:', error);
    }
  };

  const handleDeleteNews = async (newsId) => {
    if (!window.confirm('Are you sure you want to delete this news?')) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/news/${newsId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.status === 401) {
        navigate('/login');
        return;
      }

      if (response.ok) {
        setMessage({ type: 'success', text: 'News deleted!' });
        fetchNews();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete news' });
      console.error('Delete news error:', error);
    }
  };

  const handleEditGame = (game) => {
    setEditingGame(game);
    setGameForm({
      name: game.name,
      description: game.description,
      price: game.price,
      discount: game.discount || 0,
      ratings: game.ratings || [],
      categories: game.categories || [],
      consoles: game.consoles,
      gamePic: null,
      backgroundPic: null,
      gameplayPics: [null, null, null, null],
      video: null
    });
    setShowAddGame(true);
  };

  const handleEditNews = (newsItem) => {
    setEditingNews(newsItem);
    setNewsForm({
      heading: newsItem.heading,
      description: newsItem.description,
      gameName: newsItem.gameName || '',
      headingImage: null,
      detailImage: null
    });
    setShowAddNews(true);
  };

  const handleSetDiscount = async (gameId, discount) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/games/${gameId}/discount`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ discount: parseFloat(discount) })
      });

      if (response.status === 401) {
        navigate('/login');
        return;
      }

      if (response.ok) {
        setMessage({ type: 'success', text: 'Discount updated!' });
        fetchGames();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update discount' });
      console.error('Set discount error:', error);
    }
  };

  const resetGameForm = () => {
    setGameForm({
      name: '',
      description: '',
      price: '',
      discount: 0,
      ratings: [],
      categories: [],
      consoles: [],
      gamePic: null,
      backgroundPic: null,
      gameplayPics: [null, null, null, null],
      video: null
    });
    setEditingGame(null);
  };

  const resetNewsForm = () => {
    setNewsForm({
      heading: '',
      description: '',
      gameName: '',
      headingImage: null,
      detailImage: null
    });
    setEditingNews(null);
  };

  const handleLogout = async () => {
    try {
      await fetch(`${BACKEND_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    navigate('/login');
  };

  const calculateDiscountedPrice = (price, discount) => {
    if (discount > 0) {
      return price - (price * discount / 100);
    }
    return price;
  };

  const filteredGames = games.filter(game =>
    game.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredNews = news.filter(n =>
    n.heading.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (n.gameName && n.gameName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const topRatedGames = [...games].sort((a, b) => b.averageRating - a.averageRating).slice(0, 5);
  const topPurchasedGames = [...games].sort((a, b) => b.purchaseCount - a.purchaseCount).slice(0, 5);

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>Admin Panel - Respawn Hub</h1>
        <button className="logout-btn" onClick={handleLogout}>
            <i className="fa-solid fa-right-from-bracket"></i>
        </button>
      </div>

      {message.text && (
        <div className={`message-alert ${message.type === 'success' ? 'message-success' : 'message-error'}`}>
          {message.text}
        </div>
      )}

      <div className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === 'games' ? 'active' : ''}`}
          onClick={() => setActiveTab('games')}
        >
          Games
        </button>
        <button 
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button 
          className={`tab-btn ${activeTab === 'news' ? 'active' : ''}`}
          onClick={() => setActiveTab('news')}
        >
          News
        </button>
        <button 
          className={`tab-btn ${activeTab === 'purchases' ? 'active' : ''}`}
          onClick={() => setActiveTab('purchases')}
        >
          Purchases
        </button>
        <button 
          className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          Statistics
        </button>
        <button 
          className={`tab-btn ${activeTab === 'support' ? 'active' : ''}`}
          onClick={() => setActiveTab('support')}
        >
          Support
        </button>
      </div>

      <div className="content-container">
        {activeTab === 'games' && (
          <div>
            <div className="action-bar">
              <button 
                className="primary-btn"
                onClick={() => { setShowAddGame(!showAddGame); resetGameForm(); }}
              >
                {showAddGame ? 'Cancel' : 'Add New Game'}
              </button>
              <input
                type="text"
                className="search-input-admin"
                placeholder="Search games..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {showAddGame && (
              <div className="form-container">
                <h2>{editingGame ? 'Edit Game' : 'Add New Game'}</h2>
                <form onSubmit={handleAddGame}>
                  <div className="form-group">
                    <label>Game Name:</label>
                    <input 
                      type="text" 
                      name="name" 
                      className="form-input"
                      value={gameForm.name} 
                      onChange={handleGameFormChange} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Description:</label>
                    <textarea 
                      name="description" 
                      className="form-textarea"
                      value={gameForm.description} 
                      onChange={handleGameFormChange} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Price (₹):</label>
                    <input 
                      type="number" 
                      name="price" 
                      className="form-input"
                      value={gameForm.price} 
                      onChange={handleGameFormChange} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Discount (%):</label>
                    <input 
                      type="number" 
                      name="discount" 
                      className="form-input"
                      value={gameForm.discount} 
                      onChange={handleGameFormChange} 
                      min="0" 
                      max="100" 
                    />
                  </div>
                  <div className="form-group">
                    <label>Age Ratings (Multiple):</label>
                    <div className="checkbox-group">
                      {ratingOptions.map(rating => (
                        <label key={rating} className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={gameForm.ratings.includes(rating)}
                            onChange={() => handleMultiSelectToggle('ratings', rating)}
                          />
                          {rating}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Categories (Multiple):</label>
                    <div className="checkbox-group">
                      {categoryOptions.map(category => (
                        <label key={category} className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={gameForm.categories.includes(category)}
                            onChange={() => handleMultiSelectToggle('categories', category)}
                          />
                          {category}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Consoles:</label>
                    <div className="checkbox-group">
                      {consoleOptions.map(console => (
                        <label key={console} className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={gameForm.consoles.includes(console)}
                            onChange={() => handleMultiSelectToggle('consoles', console)}
                          />
                          {console}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Game Picture:</label>
                    <input 
                      type="file" 
                      className="file-input"
                      accept="image/*" 
                      onChange={(e) => handleFileChange(e, 'gamePic')} 
                    />
                  </div>
                  <div className="form-group">
                    <label>Background Picture:</label>
                    <input 
                      type="file" 
                      className="file-input"
                      accept="image/*" 
                      onChange={(e) => handleFileChange(e, 'backgroundPic')} 
                    />
                  </div>
                  <div className="form-group">
                    <label>Gameplay Pictures (4):</label>
                    <div className="file-input-group">
                      {[0, 1, 2, 3].map(i => (
                        <input 
                          key={i} 
                          type="file" 
                          className="file-input"
                          accept="image/*" 
                          onChange={(e) => handleFileChange(e, 'gameplayPics', i)} 
                        />
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Video (Optional):</label>
                    <input 
                      type="file" 
                      className="file-input"
                      accept="video/*" 
                      onChange={(e) => handleFileChange(e, 'video')} 
                    />
                  </div>
                  <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? 'Saving...' : editingGame ? 'Update Game' : 'Add Game'}
                  </button>
                </form>
              </div>
            )}

            <div className="games-list">
              <h2>Games List</h2>
              <div className="games-grid">
                {filteredGames.map(game => (
                  <div 
                    key={game._id} 
                    className="game-card-simple"
                    onClick={() => navigate(`/admin/game/${game._id}`)}
                  >
                    {game.gamePic && (
                      <img 
                        src={`${BACKEND_URL}/uploads/${game.gamePic}`} 
                        alt={game.name}
                        className="game-card-image"
                      />
                    )}
                    <div className="game-card-content">
                      <h3>{game.name}</h3>
                      <div className="game-price-info">
                        {game.discount > 0 ? (
                          <>
                            <span className="original-price">₹{game.price}</span>
                            <span className="discounted-price">
                              ₹{calculateDiscountedPrice(game.price, game.discount).toFixed(2)}
                            </span>
                            <span className="discount-badge">-{game.discount}%</span>
                          </>
                        ) : (
                          <span className="current-price">₹{game.price}</span>
                        )}
                      </div>
                      <div className="game-rating-info">
                        <span className="star-rating">
                          ⭐ {game.averageRating ? game.averageRating.toFixed(1) : '0.0'}/5
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <div className="action-bar">
              <input
                type="text"
                className="search-input-admin"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="users-list">
              <h2>Users List</h2>
              {filteredUsers.map(user => (
                <div key={user._id} className="user-card">
                  <h3>{user.username}</h3>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
                  <button className="view-btn" onClick={() => fetchUserDetails(user._id)}>
                    View Collection
                  </button>
                </div>
              ))}
            </div>

            {selectedUser && (
              <div className="user-details-panel">
                <h2>User Details: {selectedUser.user.username}</h2>
                <p><strong>Email:</strong> {selectedUser.user.email}</p>
                <h3>Game Collection ({selectedUser.collection.length} games)</h3>
                {selectedUser.collection.map(item => (
                  <div key={item._id} className="collection-item">
                    <p>- {item.game.name} (Purchased: {new Date(item.purchasedAt).toLocaleDateString()})</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'news' && (
          <div>
            <div className="action-bar">
              <button 
                className="primary-btn"
                onClick={() => { setShowAddNews(!showAddNews); resetNewsForm(); }}
              >
                {showAddNews ? 'Cancel' : 'Add New News'}
              </button>
              <input
                type="text"
                className="search-input-admin"
                placeholder="Search by heading or game name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {showAddNews && (
              <div className="form-container">
                <h2>{editingNews ? 'Edit News' : 'Add New News'}</h2>
                <form onSubmit={handleAddNews}>
                  <div className="form-group">
                    <label>News Heading:</label>
                    <input 
                      type="text" 
                      name="heading" 
                      className="form-input"
                      value={newsForm.heading} 
                      onChange={handleNewsFormChange} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Game Name (Optional):</label>
                    <input 
                      type="text" 
                      name="gameName" 
                      className="form-input"
                      placeholder="e.g., Grand Theft Auto V"
                      value={newsForm.gameName} 
                      onChange={handleNewsFormChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Description:</label>
                    <textarea 
                      name="description" 
                      className="form-textarea"
                      value={newsForm.description} 
                      onChange={handleNewsFormChange} 
                      required 
                      rows="6"
                    />
                  </div>
                  <div className="form-group">
                    <label>Heading Image (Optional):</label>
                    <input 
                      type="file" 
                      className="file-input"
                      accept="image/*" 
                      onChange={(e) => handleNewsImageChange(e, 'headingImage')}
                    />
                    {editingNews && editingNews.headingImage && (
                      <small>Current: {editingNews.headingImage}</small>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Detail Image (Optional):</label>
                    <input 
                      type="file" 
                      className="file-input"
                      accept="image/*" 
                      onChange={(e) => handleNewsImageChange(e, 'detailImage')}
                    />
                    {editingNews && editingNews.detailImage && (
                      <small>Current: {editingNews.detailImage}</small>
                    )}
                  </div>
                  <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? 'Saving...' : editingNews ? 'Update News' : 'Add News'}
                  </button>
                </form>
              </div>
            )}

            <div className="news-list">
              <h2>News List</h2>
              <div className="news-grid">
                {filteredNews.map(newsItem => (
                  <div key={newsItem._id} className="news-card">
                    {newsItem.headingImage && (
                      <img 
                        src={`${BACKEND_URL}/uploads/${newsItem.headingImage}`} 
                        alt={newsItem.heading}
                        className="news-card-image"
                      />
                    )}
                    <div className="news-card-content">
                      <h3>{newsItem.heading}</h3>
                      {newsItem.gameName && (
                        <p className="news-game-name">🎮 {newsItem.gameName}</p>
                      )}
                      <p className="news-description">{newsItem.description.substring(0, 150)}...</p>
                      <p className="news-date">
                        Posted: {new Date(newsItem.createdAt).toLocaleDateString()}
                      </p>
                      <div className="news-actions">
                        <button 
                          className="edit-btn-small" 
                          onClick={() => handleEditNews(newsItem)}
                        >
                          Edit
                        </button>
                        <button 
                          className="delete-btn-small" 
                          onClick={() => handleDeleteNews(newsItem._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'purchases' && (
          <div>
            <h2>Purchase Tracking</h2>
            {purchases.map(purchase => (
              <div key={purchase._id} className="purchase-card">
                <p><strong>User:</strong> {purchase.user.username}</p>
                <p><strong>Game:</strong> {purchase.game.name}</p>
                <p><strong>Price:</strong> ₹{purchase.price}</p>
                <p><strong>Date:</strong> {new Date(purchase.purchasedAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="stats-container">
            <div className="stats-section">
              <h3>Top Rated Games</h3>
              {topRatedGames.map((game, index) => (
                <div key={game._id} className="stats-item">
                  {index + 1}. {game.name} - Rating: {game.averageRating || 0}/5
                </div>
              ))}
            </div>

            <div className="stats-section">
              <h3>Top Purchased Games</h3>
              {topPurchasedGames.map((game, index) => (
                <div key={game._id} className="stats-item">
                  {index + 1}. {game.name} - Purchases: {game.purchaseCount || 0}
                </div>
              ))}
            </div>

            <div className="stats-section">
              <h3>Overall Stats</h3>
              <div className="overall-stats">
                <div className="stat-card">
                  <p>Total Games</p>
                  <div className="stat-value">{games.length}</div>
                </div>
                <div className="stat-card">
                  <p>Total Users</p>
                  <div className="stat-value">{users.length}</div>
                </div>
                <div className="stat-card">
                  <p>Total Purchases</p>
                  <div className="stat-value">{purchases.length}</div>
                </div>
                <div className="stat-card">
                  <p>Total News</p>
                  <div className="stat-value">{news.length}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'support' && <AdminSupportPanel />}
      </div>
    </div>
  );
}

export default AdminPanel;