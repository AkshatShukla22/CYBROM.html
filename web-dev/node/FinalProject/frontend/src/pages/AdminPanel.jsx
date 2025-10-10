import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminPanel.css';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('games');
  const [games, setGames] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showAddGame, setShowAddGame] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [purchases, setPurchases] = useState([]);
  
  const [gameForm, setGameForm] = useState({
    name: '',
    description: '',
    price: '',
    discount: 0,
    rating: '',
    consoles: [],
    gamePic: null,
    backgroundPic: null,
    gameplayPics: [null, null, null, null],
    video: null
  });

  const consoleOptions = ['PlayStation 5', 'PlayStation 4', 'Xbox Series X/S', 'Xbox One', 'Nintendo Switch', 'PC'];
  const ratingOptions = ['Everyone', 'Teen', '18+', 'Mature', 'Violence', 'Horror'];

  useEffect(() => {
    fetchGames();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'purchases') fetchPurchases();
  }, [activeTab]);

  const fetchGames = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/games', {
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok) setGames(data.games);
    } catch (error) {
      console.error('Error fetching games:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/users', {
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok) setUsers(data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchPurchases = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/purchases', {
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok) setPurchases(data.purchases);
    } catch (error) {
      console.error('Error fetching purchases:', error);
    }
  };

  const fetchUserDetails = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        credentials: 'include'
      });
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

  const handleConsoleToggle = (console) => {
    const consoles = gameForm.consoles.includes(console)
      ? gameForm.consoles.filter(c => c !== console)
      : [...gameForm.consoles, console];
    setGameForm({ ...gameForm, consoles });
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

  const handleAddGame = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    const formData = new FormData();
    formData.append('name', gameForm.name);
    formData.append('description', gameForm.description);
    formData.append('price', gameForm.price);
    formData.append('discount', gameForm.discount);
    formData.append('rating', gameForm.rating);
    formData.append('consoles', JSON.stringify(gameForm.consoles));
    
    if (gameForm.gamePic) formData.append('gamePic', gameForm.gamePic);
    if (gameForm.backgroundPic) formData.append('backgroundPic', gameForm.backgroundPic);
    if (gameForm.video) formData.append('video', gameForm.video);
    
    gameForm.gameplayPics.forEach((pic, index) => {
      if (pic) formData.append(`gameplayPic${index}`, pic);
    });

    try {
      const url = editingGame 
        ? `http://localhost:5000/api/admin/games/${editingGame._id}`
        : 'http://localhost:5000/api/admin/games';
      
      const response = await fetch(url, {
        method: editingGame ? 'PUT' : 'POST',
        credentials: 'include',
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: editingGame ? 'Game updated!' : 'Game added!' });
        resetForm();
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

  const handleDeleteGame = async (gameId) => {
    if (!window.confirm('Are you sure you want to delete this game?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/admin/games/${gameId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Game deleted!' });
        fetchGames();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete game' });
      console.error('Delete game error:', error);
    }
  };

  const handleEditGame = (game) => {
    setEditingGame(game);
    setGameForm({
      name: game.name,
      description: game.description,
      price: game.price,
      discount: game.discount || 0,
      rating: game.rating,
      consoles: game.consoles,
      gamePic: null,
      backgroundPic: null,
      gameplayPics: [null, null, null, null],
      video: null
    });
    setShowAddGame(true);
  };

  const handleSetDiscount = async (gameId, discount) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/games/${gameId}/discount`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ discount: parseFloat(discount) })
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Discount updated!' });
        fetchGames();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update discount' });
      console.error('Set discount error:', error);
    }
  };

  const resetForm = () => {
    setGameForm({
      name: '',
      description: '',
      price: '',
      discount: 0,
      rating: '',
      consoles: [],
      gamePic: null,
      backgroundPic: null,
      gameplayPics: [null, null, null, null],
      video: null
    });
    setEditingGame(null);
  };

  const handleLogout = () => {
    navigate('/login');
  };

  const filteredGames = games.filter(game =>
    game.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
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
      </div>

      <div className="content-container">
        {activeTab === 'games' && (
          <div>
            <div className="action-bar">
              <button 
                className="primary-btn"
                onClick={() => { setShowAddGame(!showAddGame); resetForm(); }}
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
                    <label>Rating:</label>
                    <select 
                      name="rating" 
                      className="form-select"
                      value={gameForm.rating} 
                      onChange={handleGameFormChange} 
                      required
                    >
                      <option value="">Select rating</option>
                      {ratingOptions.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Consoles:</label>
                    <div className="checkbox-group">
                      {consoleOptions.map(console => (
                        <label key={console} className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={gameForm.consoles.includes(console)}
                            onChange={() => handleConsoleToggle(console)}
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
                    <label>Video:</label>
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
              {filteredGames.map(game => (
                <div key={game._id} className="game-card">
                  <h3>{game.name}</h3>
                  <p>{game.description}</p>
                  <div className="game-info-row">
                    <span className="game-info-item"><strong>Price:</strong> ₹{game.price}</span>
                    <span className="game-info-item"><strong>Discount:</strong> {game.discount}%</span>
                    <span className="game-info-item"><strong>Rating:</strong> {game.rating}</span>
                  </div>
                  <div className="game-info-row">
                    <span className="game-info-item"><strong>Consoles:</strong> {game.consoles.join(', ')}</span>
                  </div>
                  <div className="game-info-row">
                    <span className="game-info-item"><strong>Purchases:</strong> {game.purchaseCount || 0}</span>
                    <span className="game-info-item"><strong>Avg Rating:</strong> {game.averageRating || 0}/5</span>
                  </div>
                  <div className="discount-group">
                    <label>Set Discount:</label>
                    <input 
                      type="number" 
                      className="discount-input"
                      min="0" 
                      max="100" 
                      defaultValue={game.discount} 
                      onBlur={(e) => handleSetDiscount(game._id, e.target.value)}
                    />
                    <span>%</span>
                  </div>
                  <div className="action-buttons">
                    <button className="edit-btn" onClick={() => handleEditGame(game)}>Edit</button>
                    <button className="delete-btn" onClick={() => handleDeleteGame(game._id)}>Delete</button>
                  </div>
                </div>
              ))}
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
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;