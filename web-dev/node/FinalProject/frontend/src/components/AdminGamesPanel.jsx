import React, { useState, useEffect } from 'react';
import BACKEND_URL from '../utils/BackendURL';
import '../styles/AdminGamesPanel.css';

const AdminGamesPanel = ({ setMessage, navigate }) => {
  const [games, setGames] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAddGame, setShowAddGame] = useState(false);
  const [editingGame, setEditingGame] = useState(null);

  const [gameForm, setGameForm] = useState({
    name: '', description: '', developer: '', publisher: '', releaseDate: '', version: '1.0.0',
    coverImage: null, additionalImages: [null, null, null], trailer: null, 
    gameplayPics: [null, null, null, null], backgroundPic: null,
    genre: [], categories: [], tags: [], ratings: [], modes: [],
    price: '', discount: 0, offerStartDate: '', offerEndDate: '',
    multiplayerSupport: false, crossPlatformSupport: false, cloudSaveSupport: false, 
    controllerSupport: false, vrSupport: false, gameEngine: '', gameSize: '',
    availablePlatforms: [], consoles: [], languageSupport: [], subtitleLanguages: [], audioLanguages: [],
    minimumRequirements: { os: '', cpu: '', ram: '', gpu: '', storage: '', directX: '', additional: '' },
    recommendedRequirements: { os: '', cpu: '', ram: '', gpu: '', storage: '', directX: '', additional: '' },
    supportedResolutions: [], soundtrackAvailability: false, soundtrackUrl: '',
    inGamePurchases: false, inGamePurchasesInfo: '', isTrending: false, popularityLabel: ''
  });

  const genreOptions = ['Action', 'Adventure', 'RPG', 'Horror', 'Sports', 'Racing', 'Strategy', 'Simulation', 'Puzzle', 'Fighting', 'Shooter', 'Open World', 'Indie', 'Casual', 'Educational'];
  const ratingOptions = ['Everyone', 'Teen', '10+', '12+', '16+', '18+', 'Mature', 'Violence', 'Horror', 'Sexual Content'];
  const platformOptions = ['PlayStation 5', 'PlayStation 4', 'Xbox Series X/S', 'Xbox One', 'Nintendo Switch', 'PC', 'Mac', 'Linux', 'Mobile', 'Cloud Gaming'];
  const modeOptions = ['Single Player', 'Multiplayer', 'Co-op', 'PvP', 'Online', 'Local'];
  const engineOptions = ['Unreal Engine', 'Unity', 'Godot', 'Proprietary', 'Custom', 'Other'];
  const resolutionOptions = ['1080p', '1440p', '2160p (4K)', '3440x1440 (Ultrawide)', '5120x1440 (Dual Ultrawide)'];
  const languageOptions = ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Russian', 'Japanese', 'Chinese', 'Korean', 'Arabic', 'Hindi', 'Dutch', 'Polish', 'Turkish', 'Thai', 'Vietnamese', 'Swedish', 'Norwegian', 'Danish', 'Finnish'];
  const popularityOptions = ['New Release', 'Trending', 'Best Seller', 'Editor\'s Choice', 'Hidden Gem', 'Classic'];

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/games`, { credentials: 'include' });
      if (response.status === 401) { navigate('/login'); return; }
      const data = await response.json();
      if (response.ok) setGames(data.games);
    } catch (error) {
      console.error('Error fetching games:', error);
    }
  };

  const handleGameFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setGameForm({ ...gameForm, [name]: checked });
    } else if (name.startsWith('min_') || name.startsWith('rec_')) {
      const reqType = name.startsWith('min_') ? 'minimumRequirements' : 'recommendedRequirements';
      const field = name.replace(/^(min_|rec_)/, '');
      setGameForm({
        ...gameForm,
        [reqType]: { ...gameForm[reqType], [field]: value }
      });
    } else {
      setGameForm({ ...gameForm, [name]: value });
    }
  };

  const handleMultiSelectToggle = (field, value) => {
    const current = gameForm[field];
    const updated = current.includes(value)
      ? current.filter(item => item !== value)
      : [...current, value];
    setGameForm({ ...gameForm, [field]: updated });
  };

  const handleAddTagInput = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      const newTag = e.target.value.trim();
      if (!gameForm.tags.includes(newTag)) {
        setGameForm({ ...gameForm, tags: [...gameForm.tags, newTag] });
      }
      e.target.value = '';
    }
  };

  const removeTag = (tagToRemove) => {
    setGameForm({ ...gameForm, tags: gameForm.tags.filter(tag => tag !== tagToRemove) });
  };

  const handleFileChange = (e, field, index = null) => {
    const file = e.target.files[0];
    if (index !== null) {
      if (field === 'additionalImages') {
        const newImages = [...gameForm.additionalImages];
        newImages[index] = file;
        setGameForm({ ...gameForm, additionalImages: newImages });
      } else if (field === 'gameplayPics') {
        const newPics = [...gameForm.gameplayPics];
        newPics[index] = file;
        setGameForm({ ...gameForm, gameplayPics: newPics });
      }
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
    formData.append('developer', gameForm.developer);
    formData.append('publisher', gameForm.publisher);
    formData.append('releaseDate', gameForm.releaseDate);
    formData.append('version', gameForm.version);

    if (gameForm.coverImage) formData.append('coverImage', gameForm.coverImage);
    gameForm.additionalImages.forEach((img, idx) => {
      if (img) formData.append(`additionalImage${idx}`, img);
    });
    if (gameForm.trailer) formData.append('trailer', gameForm.trailer);
    gameForm.gameplayPics.forEach((pic, idx) => {
      if (pic) formData.append(`gameplayPic${idx}`, pic);
    });
    if (gameForm.backgroundPic) formData.append('backgroundPic', gameForm.backgroundPic);

    formData.append('genre', JSON.stringify(gameForm.genre));
    formData.append('categories', JSON.stringify(gameForm.categories));
    formData.append('tags', JSON.stringify(gameForm.tags));
    formData.append('ratings', JSON.stringify(gameForm.ratings));
    formData.append('modes', JSON.stringify(gameForm.modes));
    formData.append('price', gameForm.price);
    formData.append('discount', gameForm.discount);
    formData.append('offerDuration', JSON.stringify({
      startDate: gameForm.offerStartDate,
      endDate: gameForm.offerEndDate
    }));

    formData.append('multiplayerSupport', gameForm.multiplayerSupport);
    formData.append('crossPlatformSupport', gameForm.crossPlatformSupport);
    formData.append('cloudSaveSupport', gameForm.cloudSaveSupport);
    formData.append('controllerSupport', gameForm.controllerSupport);
    formData.append('vrSupport', gameForm.vrSupport);
    formData.append('gameEngine', gameForm.gameEngine);
    formData.append('gameSize', gameForm.gameSize);

    formData.append('availablePlatforms', JSON.stringify(gameForm.availablePlatforms));
    formData.append('consoles', JSON.stringify(gameForm.consoles));
    formData.append('languageSupport', JSON.stringify(gameForm.languageSupport));
    formData.append('subtitleLanguages', JSON.stringify(gameForm.subtitleLanguages));
    formData.append('audioLanguages', JSON.stringify(gameForm.audioLanguages));

    formData.append('minimumRequirements', JSON.stringify(gameForm.minimumRequirements));
    formData.append('recommendedRequirements', JSON.stringify(gameForm.recommendedRequirements));

    formData.append('supportedResolutions', JSON.stringify(gameForm.supportedResolutions));
    formData.append('soundtrackAvailability', gameForm.soundtrackAvailability);
    formData.append('soundtrackUrl', gameForm.soundtrackUrl);

    formData.append('inGamePurchases', gameForm.inGamePurchases);
    formData.append('inGamePurchasesInfo', gameForm.inGamePurchasesInfo);

    formData.append('isTrending', gameForm.isTrending);
    formData.append('popularityLabel', gameForm.popularityLabel);

    try {
      const url = editingGame 
        ? `${BACKEND_URL}/api/admin/games/${editingGame._id}`
        : `${BACKEND_URL}/api/admin/games`;
      
      const response = await fetch(url, {
        method: editingGame ? 'PUT' : 'POST',
        credentials: 'include',
        body: formData
      });

      if (response.status === 401) { navigate('/login'); return; }

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

  const resetGameForm = () => {
    setGameForm({
      name: '', description: '', developer: '', publisher: '', releaseDate: '', version: '1.0.0',
      coverImage: null, additionalImages: [null, null, null], trailer: null, gameplayPics: [null, null, null, null],
      backgroundPic: null, genre: [], categories: [], tags: [], ratings: [], modes: [],
      price: '', discount: 0, offerStartDate: '', offerEndDate: '',
      multiplayerSupport: false, crossPlatformSupport: false, cloudSaveSupport: false, controllerSupport: false,
      vrSupport: false, gameEngine: '', gameSize: '', availablePlatforms: [], consoles: [], languageSupport: [],
      subtitleLanguages: [], audioLanguages: [],
      minimumRequirements: { os: '', cpu: '', ram: '', gpu: '', storage: '', directX: '', additional: '' },
      recommendedRequirements: { os: '', cpu: '', ram: '', gpu: '', storage: '', directX: '', additional: '' },
      supportedResolutions: [], soundtrackAvailability: false, soundtrackUrl: '',
      inGamePurchases: false, inGamePurchasesInfo: '', isTrending: false, popularityLabel: ''
    });
    setEditingGame(null);
  };

  const calculateDiscountedPrice = (price, discount) => {
    return discount > 0 ? price - (price * discount / 100) : price;
  };

  const filteredGames = games.filter(game => game.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div>
      <div className="action-bar">
        <button className="primary-btn" onClick={() => { setShowAddGame(!showAddGame); resetGameForm(); }}>
          {showAddGame ? 'Cancel' : 'Add New Game'}
        </button>
        <input type="text" className="search-input-admin" placeholder="Search games..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      {showAddGame && (
        <div className="form-container">
          <h2>{editingGame ? 'Edit Game' : 'Add New Game'}</h2>
          <form onSubmit={handleAddGame}>
            {/* BASIC INFORMATION */}
            <fieldset>
              <legend>Basic Information</legend>
              <div className="form-row">
                <div className="form-group">
                  <label>Game Name *</label>
                  <input type="text" name="name" className="form-input" value={gameForm.name} onChange={handleGameFormChange} required />
                </div>
                <div className="form-group">
                  <label>Developer</label>
                  <input type="text" name="developer" className="form-input" value={gameForm.developer} onChange={handleGameFormChange} />
                </div>
                <div className="form-group">
                  <label>Publisher</label>
                  <input type="text" name="publisher" className="form-input" value={gameForm.publisher} onChange={handleGameFormChange} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Release Date</label>
                  <input type="date" name="releaseDate" className="form-input" value={gameForm.releaseDate} onChange={handleGameFormChange} />
                </div>
                <div className="form-group">
                  <label>Version</label>
                  <input type="text" name="version" className="form-input" value={gameForm.version} onChange={handleGameFormChange} />
                </div>
                <div className="form-group">
                  <label>Game Size (GB)</label>
                  <input type="number" name="gameSize" className="form-input" step="0.1" value={gameForm.gameSize} onChange={handleGameFormChange} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group full-width">
                  <label>Description *</label>
                  <textarea name="description" className="form-textarea" value={gameForm.description} onChange={handleGameFormChange} required rows="4" />
                </div>
              </div>
            </fieldset>

            {/* MEDIA */}
            <fieldset>
              <legend>Media Assets</legend>
              <div className="form-row">
                <div className="form-group">
                  <label>Cover Image</label>
                  <input type="file" className="file-input" accept="image/*" onChange={(e) => handleFileChange(e, 'coverImage')} />
                </div>
                <div className="form-group">
                  <label>Background Image</label>
                  <input type="file" className="file-input" accept="image/*" onChange={(e) => handleFileChange(e, 'backgroundPic')} />
                </div>
                <div className="form-group">
                  <label>Trailer Video</label>
                  <input type="file" className="file-input" accept="video/*" onChange={(e) => handleFileChange(e, 'trailer')} />
                </div>
              </div>
              <div className="form-group">
                <label>Additional Images (up to 3)</label>
                <div className="file-input-group">
                  {[0, 1, 2].map(i => (
                    <input key={i} type="file" className="file-input" accept="image/*" onChange={(e) => handleFileChange(e, 'additionalImages', i)} />
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Gameplay Pictures (up to 4)</label>
                <div className="file-input-group">
                  {[0, 1, 2, 3].map(i => (
                    <input key={i} type="file" className="file-input" accept="image/*" onChange={(e) => handleFileChange(e, 'gameplayPics', i)} />
                  ))}
                </div>
              </div>
            </fieldset>

            {/* CLASSIFICATION */}
            <fieldset>
              <legend>Classification & Tags</legend>
              <div className="form-group">
                <label>Genre</label>
                <div className="checkbox-group">
                  {genreOptions.map(genre => (
                    <label key={genre} className="checkbox-label">
                      <input type="checkbox" checked={gameForm.genre.includes(genre)} onChange={() => handleMultiSelectToggle('genre', genre)} />
                      {genre}
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Categories</label>
                <div className="checkbox-group">
                  {genreOptions.map(cat => (
                    <label key={cat} className="checkbox-label">
                      <input type="checkbox" checked={gameForm.categories.includes(cat)} onChange={() => handleMultiSelectToggle('categories', cat)} />
                      {cat}
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Age Ratings</label>
                <div className="checkbox-group">
                  {ratingOptions.map(rating => (
                    <label key={rating} className="checkbox-label">
                      <input type="checkbox" checked={gameForm.ratings.includes(rating)} onChange={() => handleMultiSelectToggle('ratings', rating)} />
                      {rating}
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Custom Tags</label>
                <input type="text" className="form-input" placeholder="Add tag and press Enter" onKeyDown={handleAddTagInput} />
                <div className="tags-display">
                  {gameForm.tags.map(tag => (
                    <span key={tag} className="tag-badge">
                      {tag} <button type="button" onClick={() => removeTag(tag)}>✕</button>
                    </span>
                  ))}
                </div>
              </div>
            </fieldset>

            {/* GAMEPLAY & MODES */}
            <fieldset>
              <legend>Gameplay & Modes</legend>
              <div className="form-group">
                <label>Game Modes</label>
                <div className="checkbox-group">
                  {modeOptions.map(mode => (
                    <label key={mode} className="checkbox-label">
                      <input type="checkbox" checked={gameForm.modes.includes(mode)} onChange={() => handleMultiSelectToggle('modes', mode)} />
                      {mode}
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input type="checkbox" name="multiplayerSupport" checked={gameForm.multiplayerSupport} onChange={handleGameFormChange} />
                    Multiplayer Support
                  </label>
                </div>
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input type="checkbox" name="crossPlatformSupport" checked={gameForm.crossPlatformSupport} onChange={handleGameFormChange} />
                    Cross-Platform Support
                  </label>
                </div>
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input type="checkbox" name="cloudSaveSupport" checked={gameForm.cloudSaveSupport} onChange={handleGameFormChange} />
                    Cloud Save Support
                  </label>
                </div>
              </div>
            </fieldset>

            {/* FEATURES & TECH */}
            <fieldset>
              <legend>Features & Technology</legend>
              <div className="form-row">
                <div className="form-group">
                  <label>Game Engine</label>
                  <select name="gameEngine" className="form-input" value={gameForm.gameEngine} onChange={handleGameFormChange}>
                    <option value="">Select Engine</option>
                    {engineOptions.map(engine => <option key={engine} value={engine}>{engine}</option>)}
                  </select>
                </div>
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input type="checkbox" name="controllerSupport" checked={gameForm.controllerSupport} onChange={handleGameFormChange} />
                    Controller Support
                  </label>
                </div>
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input type="checkbox" name="vrSupport" checked={gameForm.vrSupport} onChange={handleGameFormChange} />
                    VR Support
                  </label>
                </div>
              </div>
              <div className="form-group">
                <label>Supported Resolutions</label>
                <div className="checkbox-group">
                  {resolutionOptions.map(res => (
                    <label key={res} className="checkbox-label">
                      <input type="checkbox" checked={gameForm.supportedResolutions.includes(res)} onChange={() => handleMultiSelectToggle('supportedResolutions', res)} />
                      {res}
                    </label>
                  ))}
                </div>
              </div>
            </fieldset>

            {/* PLATFORMS */}
            <fieldset>
              <legend>Available Platforms</legend>
              <div className="form-group">
                <label>Platforms</label>
                <div className="checkbox-group">
                  {platformOptions.map(platform => (
                    <label key={platform} className="checkbox-label">
                      <input type="checkbox" checked={gameForm.availablePlatforms.includes(platform)} onChange={() => handleMultiSelectToggle('availablePlatforms', platform)} />
                      {platform}
                    </label>
                  ))}
                </div>
              </div>
            </fieldset>

            {/* LANGUAGES */}
            <fieldset>
              <legend>Language Support</legend>
              <div className="form-group">
                <label>Supported Languages</label>
                <div className="checkbox-group">
                  {languageOptions.map(lang => (
                    <label key={lang} className="checkbox-label">
                      <input type="checkbox" checked={gameForm.languageSupport.includes(lang)} onChange={() => handleMultiSelectToggle('languageSupport', lang)} />
                      {lang}
                    </label>
                  ))}
                </div>
              </div>
            </fieldset>

            {/* SYSTEM REQUIREMENTS */}
            <fieldset>
              <legend>System Requirements</legend>
              <h4>Minimum Requirements</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>OS</label>
                  <input type="text" name="min_os" className="form-input" value={gameForm.minimumRequirements.os} onChange={handleGameFormChange} placeholder="e.g., Windows 10 64-bit" />
                </div>
                <div className="form-group">
                  <label>CPU</label>
                  <input type="text" name="min_cpu" className="form-input" value={gameForm.minimumRequirements.cpu} onChange={handleGameFormChange} placeholder="e.g., Intel Core i5-6600K" />
                </div>
                <div className="form-group">
                  <label>RAM</label>
                  <input type="text" name="min_ram" className="form-input" value={gameForm.minimumRequirements.ram} onChange={handleGameFormChange} placeholder="e.g., 8 GB" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>GPU</label>
                  <input type="text" name="min_gpu" className="form-input" value={gameForm.minimumRequirements.gpu} onChange={handleGameFormChange} placeholder="e.g., NVIDIA GTX 1060" />
                </div>
                <div className="form-group">
                  <label>Storage</label>
                  <input type="text" name="min_storage" className="form-input" value={gameForm.minimumRequirements.storage} onChange={handleGameFormChange} placeholder="e.g., 50 GB" />
                </div>
                <div className="form-group">
                  <label>DirectX</label>
                  <input type="text" name="min_directX" className="form-input" value={gameForm.minimumRequirements.directX} onChange={handleGameFormChange} placeholder="e.g., Version 11" />
                </div>
              </div>
              <div className="form-group">
                <label>Additional Notes</label>
                <textarea name="min_additional" className="form-textarea" value={gameForm.minimumRequirements.additional} onChange={handleGameFormChange} rows="2" />
              </div>

              <h4>Recommended Requirements</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>OS</label>
                  <input type="text" name="rec_os" className="form-input" value={gameForm.recommendedRequirements.os} onChange={handleGameFormChange} placeholder="e.g., Windows 11 64-bit" />
                </div>
                <div className="form-group">
                  <label>CPU</label>
                  <input type="text" name="rec_cpu" className="form-input" value={gameForm.recommendedRequirements.cpu} onChange={handleGameFormChange} placeholder="e.g., Intel Core i7-8700K" />
                </div>
                <div className="form-group">
                  <label>RAM</label>
                  <input type="text" name="rec_ram" className="form-input" value={gameForm.recommendedRequirements.ram} onChange={handleGameFormChange} placeholder="e.g., 16 GB" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>GPU</label>
                  <input type="text" name="rec_gpu" className="form-input" value={gameForm.recommendedRequirements.gpu} onChange={handleGameFormChange} placeholder="e.g., NVIDIA RTX 2070" />
                </div>
                <div className="form-group">
                  <label>Storage</label>
                  <input type="text" name="rec_storage" className="form-input" value={gameForm.recommendedRequirements.storage} onChange={handleGameFormChange} placeholder="e.g., 50 GB SSD" />
                </div>
                <div className="form-group">
                  <label>DirectX</label>
                  <input type="text" name="rec_directX" className="form-input" value={gameForm.recommendedRequirements.directX} onChange={handleGameFormChange} placeholder="e.g., Version 12" />
                </div>
              </div>
              <div className="form-group">
                <label>Additional Notes</label>
                <textarea name="rec_additional" className="form-textarea" value={gameForm.recommendedRequirements.additional} onChange={handleGameFormChange} rows="2" />
              </div>
            </fieldset>

            {/* PRICING */}
            <fieldset>
              <legend>Pricing & Offers</legend>
              <div className="form-row">
                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input type="number" name="price" className="form-input" value={gameForm.price} onChange={handleGameFormChange} required min="0" />
                </div>
                <div className="form-group">
                  <label>Discount (%)</label>
                  <input type="number" name="discount" className="form-input" value={gameForm.discount} onChange={handleGameFormChange} min="0" max="100" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Offer Start Date</label>
                  <input type="date" name="offerStartDate" className="form-input" value={gameForm.offerStartDate} onChange={handleGameFormChange} />
                </div>
                <div className="form-group">
                  <label>Offer End Date</label>
                  <input type="date" name="offerEndDate" className="form-input" value={gameForm.offerEndDate} onChange={handleGameFormChange} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input type="checkbox" name="inGamePurchases" checked={gameForm.inGamePurchases} onChange={handleGameFormChange} />
                    In-Game Purchases
                  </label>
                </div>
              </div>
              {gameForm.inGamePurchases && (
                <div className="form-group">
                  <label>In-Game Purchases Info</label>
                  <textarea name="inGamePurchasesInfo" className="form-textarea" value={gameForm.inGamePurchasesInfo} onChange={handleGameFormChange} rows="2" placeholder="Describe available in-game purchases" />
                </div>
              )}
            </fieldset>

            {/* AUDIO & SOUNDTRACK */}
            <fieldset>
              <legend>Audio & Soundtrack</legend>
              <div className="form-row">
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input type="checkbox" name="soundtrackAvailability" checked={gameForm.soundtrackAvailability} onChange={handleGameFormChange} />
                    Soundtrack Available
                  </label>
                </div>
              </div>
              {gameForm.soundtrackAvailability && (
                <div className="form-group">
                  <label>Soundtrack URL</label>
                  <input type="text" name="soundtrackUrl" className="form-input" value={gameForm.soundtrackUrl} onChange={handleGameFormChange} placeholder="Link to soundtrack" />
                </div>
              )}
            </fieldset>

            {/* POPULARITY */}
            <fieldset>
              <legend>Popularity & Trending</legend>
              <div className="form-row">
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input type="checkbox" name="isTrending" checked={gameForm.isTrending} onChange={handleGameFormChange} />
                    Mark as Trending
                  </label>
                </div>
                <div className="form-group">
                  <label>Popularity Label</label>
                  <select name="popularityLabel" className="form-input" value={gameForm.popularityLabel} onChange={handleGameFormChange}>
                    <option value="">None</option>
                    {popularityOptions.map(label => <option key={label} value={label}>{label}</option>)}
                  </select>
                </div>
              </div>
            </fieldset>

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
              style={{ cursor: 'pointer' }}
            >
              {game.coverImage ? (
                <img src={`${BACKEND_URL}/uploads/${game.coverImage}`} alt={game.name} className="game-card-image" />
              ) : game.gamePic ? (
                <img src={`${BACKEND_URL}/uploads/${game.gamePic}`} alt={game.name} className="game-card-image" />
              ) : null}
              <div className="game-card-content">
                <h3>{game.name}</h3>
                {game.developer && <p className="developer-name">{game.developer}</p>}
                <div className="game-price-info">
                  {game.discount > 0 ? (
                    <>
                      <span className="original-price">₹{game.price}</span>
                      <span className="discounted-price">₹{calculateDiscountedPrice(game.price, game.discount).toFixed(2)}</span>
                      <span className="discount-badge">-{game.discount}%</span>
                    </>
                  ) : (
                    <span className="current-price">₹{game.price}</span>
                  )}
                </div>
                <div className="game-rating-info">
                  <span className="star-rating">⭐ {game.averageRating ? game.averageRating.toFixed(1) : '0.0'}/5</span>
                </div>
                {game.popularityLabel && <span className="popularity-badge">{game.popularityLabel}</span>}
              </div>
            </div>
          ))}
        </div>
        {filteredGames.length === 0 && (
          <div className="no-data">
            <i className="fas fa-gamepad"></i>
            <p>No games found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminGamesPanel