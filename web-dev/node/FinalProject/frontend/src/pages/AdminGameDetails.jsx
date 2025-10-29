import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BACKEND_URL from '../utils/BackendURL';
import "../styles/AdminGameDetails.css";

const AdminGameDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [discountInput, setDiscountInput] = useState(0);
  
  // NEW: Featured/Trending States
  const [featuredInput, setFeaturedInput] = useState({ isFeatured: false, order: 0 });
  const [trendingInput, setTrendingInput] = useState({ isTrending: false, order: 0 });
  
  // Edit mode states
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(null);
  const [filePreview, setFilePreview] = useState({});
  const [uploadProgress, setUploadProgress] = useState(0);

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
        
        // NEW: Set featured/trending states
        setFeaturedInput({
          isFeatured: data.game.isFeatured || false,
          order: data.game.featuredOrder || 0
        });
        setTrendingInput({
          isTrending: data.game.isTrending || false,
          order: data.game.trendingOrder || 0
        });
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

  const handleStartEdit = () => {
    setEditData({
      name: game.name,
      description: game.description,
      developer: game.developer || '',
      publisher: game.publisher || '',
      releaseDate: game.releaseDate ? game.releaseDate.split('T')[0] : '',
      version: game.version || '',
      genre: game.genre || [],
      categories: game.categories || [],
      tags: game.tags || [],
      ratings: game.ratings || [],
      modes: game.modes || [],
      price: game.price,
      discount: game.discount || 0,
      offerDuration: game.offerDuration || { startDate: '', endDate: '' },
      multiplayerSupport: game.multiplayerSupport || false,
      crossPlatformSupport: game.crossPlatformSupport || false,
      cloudSaveSupport: game.cloudSaveSupport || false,
      controllerSupport: game.controllerSupport || false,
      vrSupport: game.vrSupport || false,
      gameEngine: game.gameEngine || '',
      gameSize: game.gameSize || 0,
      availablePlatforms: game.availablePlatforms || [],
      consoles: game.consoles || [],
      languageSupport: game.languageSupport || [],
      subtitleLanguages: game.subtitleLanguages || [],
      audioLanguages: game.audioLanguages || [],
      minimumRequirements: game.minimumRequirements || {
        os: '', cpu: '', ram: '', gpu: '', storage: '', directX: '', additional: ''
      },
      recommendedRequirements: game.recommendedRequirements || {
        os: '', cpu: '', ram: '', gpu: '', storage: '', directX: '', additional: ''
      },
      supportedResolutions: game.supportedResolutions || [],
      soundtrackAvailability: game.soundtrackAvailability || false,
      soundtrackUrl: game.soundtrackUrl || '',
      inGamePurchases: game.inGamePurchases || false,
      inGamePurchasesInfo: game.inGamePurchasesInfo || '',
      isTrending: game.isTrending || false,
      popularityLabel: game.popularityLabel || '',
      gameFile: game.gameFile || '',
      files: {}
    });
    setIsEditing(true);
    setMessage({ type: '', text: '' });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData(null);
    setFilePreview({});
    setMessage({ type: '', text: '' });
    setUploadProgress(0);
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field, value) => {
    const arr = value.split(',').map(item => item.trim()).filter(item => item);
    setEditData(prev => ({
      ...prev,
      [field]: arr
    }));
  };

  const handleObjectChange = (field, subfield, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [subfield]: value
      }
    }));
  };

  const handleFileChange = (field, file) => {
    if (file) {
      setEditData(prev => ({
        ...prev,
        files: {
          ...prev.files,
          [field]: file
        }
      }));

      // Create preview for images and videos only
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(prev => ({
            ...prev,
            [field]: reader.result
          }));
        };
        reader.readAsDataURL(file);
      } else {
        // For game files, just show the filename
        setFilePreview(prev => ({
          ...prev,
          [field]: file.name
        }));
      }
    }
  };

  const handleSubmitEdit = async () => {
    try {
      setMessage({ type: '', text: '' });
      setUploadProgress(0);
      
      const formData = new FormData();

      // Basic fields
      formData.append('name', editData.name);
      formData.append('description', editData.description);
      formData.append('developer', editData.developer);
      formData.append('publisher', editData.publisher);
      if (editData.releaseDate) formData.append('releaseDate', editData.releaseDate);
      formData.append('version', editData.version);

      // Arrays
      formData.append('genre', JSON.stringify(editData.genre));
      formData.append('categories', JSON.stringify(editData.categories));
      formData.append('tags', JSON.stringify(editData.tags));
      formData.append('ratings', JSON.stringify(editData.ratings));
      formData.append('modes', JSON.stringify(editData.modes));

      // Pricing
      formData.append('price', editData.price);
      formData.append('discount', editData.discount);
      formData.append('offerDuration', JSON.stringify(editData.offerDuration));

      // Boolean features
      formData.append('multiplayerSupport', editData.multiplayerSupport.toString());
      formData.append('crossPlatformSupport', editData.crossPlatformSupport.toString());
      formData.append('cloudSaveSupport', editData.cloudSaveSupport.toString());
      formData.append('controllerSupport', editData.controllerSupport.toString());
      formData.append('vrSupport', editData.vrSupport.toString());

      formData.append('gameEngine', editData.gameEngine);
      formData.append('gameSize', editData.gameSize);

      // Platforms and languages
      formData.append('availablePlatforms', JSON.stringify(editData.availablePlatforms));
      formData.append('consoles', JSON.stringify(editData.consoles));
      formData.append('languageSupport', JSON.stringify(editData.languageSupport));
      formData.append('subtitleLanguages', JSON.stringify(editData.subtitleLanguages));
      formData.append('audioLanguages', JSON.stringify(editData.audioLanguages));

      // System requirements
      formData.append('minimumRequirements', JSON.stringify(editData.minimumRequirements));
      formData.append('recommendedRequirements', JSON.stringify(editData.recommendedRequirements));
      formData.append('supportedResolutions', JSON.stringify(editData.supportedResolutions));

      // Soundtrack
      formData.append('soundtrackAvailability', editData.soundtrackAvailability.toString());
      formData.append('soundtrackUrl', editData.soundtrackUrl);

      // Monetization
      formData.append('inGamePurchases', editData.inGamePurchases.toString());
      formData.append('inGamePurchasesInfo', editData.inGamePurchasesInfo);

      // Popularity
      formData.append('isTrending', editData.isTrending.toString());
      formData.append('popularityLabel', editData.popularityLabel);

      // Add files
      Object.keys(editData.files).forEach(key => {
        formData.append(key, editData.files[key]);
      });

      // Use XMLHttpRequest for upload progress
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setUploadProgress(Math.round(percentComplete));
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          setMessage({ type: 'success', text: 'Game updated successfully!' });
          setIsEditing(false);
          setEditData(null);
          setFilePreview({});
          setUploadProgress(0);
          fetchGameDetails();
        } else if (xhr.status === 401) {
          navigate('/login');
        } else {
          const data = JSON.parse(xhr.responseText);
          setMessage({ type: 'error', text: data.message || 'Failed to update game' });
          setUploadProgress(0);
        }
      });

      xhr.addEventListener('error', () => {
        setMessage({ type: 'error', text: 'Network error occurred' });
        setUploadProgress(0);
      });

      xhr.open('PUT', `${BACKEND_URL}/api/admin/games/${id}`);
      xhr.withCredentials = true;
      xhr.send(formData);

    } catch (error) {
      console.error('Update error:', error);
      setMessage({ type: 'error', text: 'Network error occurred' });
      setUploadProgress(0);
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

  // NEW: Handle Featured Status
  const handleSetFeatured = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/games/${id}/featured`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          isFeatured: featuredInput.isFeatured,
          featuredOrder: parseInt(featuredInput.order) || 0
        })
      });

      if (response.status === 401) {
        navigate('/login');
        return;
      }

      if (response.ok) {
        setMessage({ type: 'success', text: `Game ${featuredInput.isFeatured ? 'added to' : 'removed from'} featured!` });
        fetchGameDetails();
      } else {
        setMessage({ type: 'error', text: 'Failed to update featured status' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error' });
      console.error('Set featured error:', error);
    }
  };

  // NEW: Handle Trending Status
  const handleSetTrending = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/games/${id}/trending`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          isTrending: trendingInput.isTrending,
          trendingOrder: parseInt(trendingInput.order) || 0
        })
      });

      if (response.status === 401) {
        navigate('/login');
        return;
      }

      if (response.ok) {
        setMessage({ type: 'success', text: `Game ${trendingInput.isTrending ? 'added to' : 'removed from'} trending!` });
        fetchGameDetails();
      } else {
        setMessage({ type: 'error', text: 'Failed to update trending status' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error' });
      console.error('Set trending error:', error);
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

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return <div className="loading">Loading game details...</div>;
  }

  if (!game) {
    return <div className="error">Game not found</div>;
  }

  // Edit Mode JSX
  if (isEditing && editData) {
    return (
      <div className="admin-game-details">
        <div className="details-header">
          <button className="back-btn" onClick={() => navigate('/admin')}>
            ←
          </button>
          <h1>Edit: {game.name}</h1>
        </div>

        {message.text && (
          <div className={`message-alert ${message.type === 'success' ? 'message-success' : 'message-error'}`}>
            {message.text}
          </div>
        )}

        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="upload-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
            </div>
            <p>Uploading: {uploadProgress}%</p>
          </div>
        )}

        <div className="edit-content">
          {/* Basic Information */}
          <section className="detail-section">
            <h2>Basic Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Game Name *</label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group full-width">
                <label>Description *</label>
                <textarea
                  value={editData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="form-textarea"
                  rows="5"
                />
              </div>

              <div className="form-group">
                <label>Developer</label>
                <input
                  type="text"
                  value={editData.developer}
                  onChange={(e) => handleInputChange('developer', e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Publisher</label>
                <input
                  type="text"
                  value={editData.publisher}
                  onChange={(e) => handleInputChange('publisher', e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Release Date</label>
                <input
                  type="date"
                  value={editData.releaseDate}
                  onChange={(e) => handleInputChange('releaseDate', e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Version</label>
                <input
                  type="text"
                  value={editData.version}
                  onChange={(e) => handleInputChange('version', e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Price (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={editData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Discount (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editData.discount}
                  onChange={(e) => handleInputChange('discount', e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Game Size (GB)</label>
                <input
                  type="number"
                  step="0.1"
                  value={editData.gameSize}
                  onChange={(e) => handleInputChange('gameSize', e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Game Engine</label>
                <input
                  type="text"
                  value={editData.gameEngine}
                  onChange={(e) => handleInputChange('gameEngine', e.target.value)}
                  className="form-input"
                  placeholder="e.g., Unreal Engine 5"
                />
              </div>
            </div>
          </section>

          {/* Game File Upload */}
          <section className="detail-section">
            <h2>Game File Upload</h2>
            <div className="form-group">
              <label>Upload Game File (.zip, .rar, .7z, .exe, etc.)</label>
              <input
                type="file"
                accept=".zip,.rar,.7z,.exe,.msi,.pkg,.dmg"
                onChange={(e) => handleFileChange('gameFile', e.target.files[0])}
                className="form-input"
              />
              {editData.files.gameFile && (
                <div className="file-info">
                  <p>Selected: {editData.files.gameFile.name}</p>
                  <p>Size: {formatFileSize(editData.files.gameFile.size)}</p>
                </div>
              )}
              {!editData.files.gameFile && game.gameFile && (
                <div className="current-file">
                  <p>Current Game File: {game.gameFile}</p>
                </div>
              )}
            </div>
          </section>

          {/* Media Assets */}
          <section className="detail-section">
            <h2>Media Assets</h2>
            
            <div className="form-group">
              <label>Cover Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange('coverImage', e.target.files[0])}
                className="form-input"
              />
              {filePreview.coverImage ? (
                <img src={filePreview.coverImage} alt="Preview" className="media-preview" />
              ) : game.coverImage && (
                <img src={`${BACKEND_URL}/uploads/${game.coverImage}`} alt="Current" className="media-preview" />
              )}
            </div>

            <div className="form-group">
              <label>Background Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange('backgroundPic', e.target.files[0])}
                className="form-input"
              />
              {filePreview.backgroundPic ? (
                <img src={filePreview.backgroundPic} alt="Preview" className="media-preview" />
              ) : game.backgroundPic && (
                <img src={`${BACKEND_URL}/uploads/${game.backgroundPic}`} alt="Current" className="media-preview" />
              )}
            </div>

            <div className="form-group">
              <label>Trailer Video</label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => handleFileChange('trailer', e.target.files[0])}
                className="form-input"
              />
              {filePreview.trailer ? (
                <video controls className="media-preview" src={filePreview.trailer} />
              ) : game.trailer && (
                <video controls className="media-preview" src={`${BACKEND_URL}/uploads/${game.trailer}`} />
              )}
            </div>

            <h3>Additional Images</h3>
            {[0, 1, 2].map(i => (
              <div key={i} className="form-group">
                <label>Additional Image {i + 1}</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(`additionalImage${i}`, e.target.files[0])}
                  className="form-input"
                />
                {filePreview[`additionalImage${i}`] ? (
                  <img src={filePreview[`additionalImage${i}`]} alt="Preview" className="media-preview-small" />
                ) : game.additionalImages && game.additionalImages[i] && (
                  <img src={`${BACKEND_URL}/uploads/${game.additionalImages[i]}`} alt="Current" className="media-preview-small" />
                )}
              </div>
            ))}

            <h3>Gameplay Screenshots</h3>
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="form-group">
                <label>Gameplay Screenshot {i + 1}</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(`gameplayPic${i}`, e.target.files[0])}
                  className="form-input"
                />
                {filePreview[`gameplayPic${i}`] ? (
                  <img src={filePreview[`gameplayPic${i}`]} alt="Preview" className="media-preview-small" />
                ) : game.gameplayPics && game.gameplayPics[i] && (
                  <img src={`${BACKEND_URL}/uploads/${game.gameplayPics[i]}`} alt="Current" className="media-preview-small" />
                )}
              </div>
            ))}
          </section>

          {/* Categories & Tags */}
          <section className="detail-section">
            <h2>Categories & Tags</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Genre (comma-separated)</label>
                <input
                  type="text"
                  value={editData.genre.join(', ')}
                  onChange={(e) => handleArrayChange('genre', e.target.value)}
                  className="form-input"
                  placeholder="Action, Adventure, RPG"
                />
              </div>

              <div className="form-group">
                <label>Categories (comma-separated)</label>
                <input
                  type="text"
                  value={editData.categories.join(', ')}
                  onChange={(e) => handleArrayChange('categories', e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Tags (comma-separated)</label>
                <input
                  type="text"
                  value={editData.tags.join(', ')}
                  onChange={(e) => handleArrayChange('tags', e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Age Ratings (comma-separated)</label>
                <input
                  type="text"
                  value={editData.ratings.join(', ')}
                  onChange={(e) => handleArrayChange('ratings', e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Game Modes (comma-separated)</label>
                <input
                  type="text"
                  value={editData.modes.join(', ')}
                  onChange={(e) => handleArrayChange('modes', e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Platforms (comma-separated)</label>
                <input
                  type="text"
                  value={editData.availablePlatforms.join(', ')}
                  onChange={(e) => handleArrayChange('availablePlatforms', e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Languages (comma-separated)</label>
                <input
                  type="text"
                  value={editData.languageSupport.join(', ')}
                  onChange={(e) => handleArrayChange('languageSupport', e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Resolutions (comma-separated)</label>
                <input
                  type="text"
                  value={editData.supportedResolutions.join(', ')}
                  onChange={(e) => handleArrayChange('supportedResolutions', e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="detail-section">
            <h2>Features</h2>
            <div className="checkbox-grid">
              <label>
                <input
                  type="checkbox"
                  checked={editData.multiplayerSupport}
                  onChange={(e) => handleInputChange('multiplayerSupport', e.target.checked)}
                />
                Multiplayer Support
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={editData.crossPlatformSupport}
                  onChange={(e) => handleInputChange('crossPlatformSupport', e.target.checked)}
                />
                Cross-Platform
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={editData.cloudSaveSupport}
                  onChange={(e) => handleInputChange('cloudSaveSupport', e.target.checked)}
                />
                Cloud Save
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={editData.controllerSupport}
                  onChange={(e) => handleInputChange('controllerSupport', e.target.checked)}
                />
                Controller Support
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={editData.vrSupport}
                  onChange={(e) => handleInputChange('vrSupport', e.target.checked)}
                />
                VR Support
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={editData.soundtrackAvailability}
                  onChange={(e) => handleInputChange('soundtrackAvailability', e.target.checked)}
                />
                Soundtrack Available
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={editData.inGamePurchases}
                  onChange={(e) => handleInputChange('inGamePurchases', e.target.checked)}
                />
                In-Game Purchases
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={editData.isTrending}
                  onChange={(e) => handleInputChange('isTrending', e.target.checked)}
                />
                Trending
              </label>
            </div>

            {editData.soundtrackAvailability && (
              <div className="form-group">
                <label>Soundtrack URL</label>
                <input
                  type="url"
                  value={editData.soundtrackUrl}
                  onChange={(e) => handleInputChange('soundtrackUrl', e.target.value)}
                  className="form-input"
                />
              </div>
            )}

            {editData.inGamePurchases && (
              <div className="form-group">
                <label>In-Game Purchases Info</label>
                <textarea
                  value={editData.inGamePurchasesInfo}
                  onChange={(e) => handleInputChange('inGamePurchasesInfo', e.target.value)}
                  className="form-textarea"
                  rows="3"
                />
              </div>
            )}

            <div className="form-group">
              <label>Popularity Label</label>
              <input
                type="text"
                value={editData.popularityLabel}
                onChange={(e) => handleInputChange('popularityLabel', e.target.value)}
                className="form-input"
              />
            </div>
          </section>

          {/* System Requirements */}
          <section className="detail-section">
            <h2>System Requirements</h2>
            
            <h3>Minimum Requirements</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>OS</label>
                <input
                  type="text"
                  value={editData.minimumRequirements.os || ''}
                  onChange={(e) => handleObjectChange('minimumRequirements', 'os', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>CPU</label>
                <input
                  type="text"
                  value={editData.minimumRequirements.cpu || ''}
                  onChange={(e) => handleObjectChange('minimumRequirements', 'cpu', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>RAM</label>
                <input
                  type="text"
                  value={editData.minimumRequirements.ram || ''}
                  onChange={(e) => handleObjectChange('minimumRequirements', 'ram', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>GPU</label>
                <input
                  type="text"
                  value={editData.minimumRequirements.gpu || ''}
                  onChange={(e) => handleObjectChange('minimumRequirements', 'gpu', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Storage</label>
                <input
                  type="text"
                  value={editData.minimumRequirements.storage || ''}
                  onChange={(e) => handleObjectChange('minimumRequirements', 'storage', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>DirectX</label>
                <input
                  type="text"
                  value={editData.minimumRequirements.directX || ''}
                  onChange={(e) => handleObjectChange('minimumRequirements', 'directX', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group full-width">
                <label>Additional Notes</label>
                <input
                  type="text"
                  value={editData.minimumRequirements.additional || ''}
                  onChange={(e) => handleObjectChange('minimumRequirements', 'additional', e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            <h3>Recommended Requirements</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>OS</label>
                <input
                  type="text"
                  value={editData.recommendedRequirements.os || ''}
                  onChange={(e) => handleObjectChange('recommendedRequirements', 'os', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>CPU</label>
                <input
                  type="text"
                  value={editData.recommendedRequirements.cpu || ''}
                  onChange={(e) => handleObjectChange('recommendedRequirements', 'cpu', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>RAM</label>
                <input
                  type="text"
                  value={editData.recommendedRequirements.ram || ''}
                  onChange={(e) => handleObjectChange('recommendedRequirements', 'ram', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>GPU</label>
                <input
                  type="text"
                  value={editData.recommendedRequirements.gpu || ''}
                  onChange={(e) => handleObjectChange('recommendedRequirements', 'gpu', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Storage</label>
                <input
                  type="text"
                  value={editData.recommendedRequirements.storage || ''}
                  onChange={(e) => handleObjectChange('recommendedRequirements', 'storage', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>DirectX</label>
                <input
                  type="text"
                  value={editData.recommendedRequirements.directX || ''}
                  onChange={(e) => handleObjectChange('recommendedRequirements', 'directX', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group full-width">
                <label>Additional Notes</label>
                <input
                  type="text"
                  value={editData.recommendedRequirements.additional || ''}
                  onChange={(e) => handleObjectChange('recommendedRequirements', 'additional', e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
          </section>

          {/* Offer Duration */}
          <section className="detail-section">
            <h2>Offer Duration</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Offer Start Date</label>
                <input
                  type="date"
                  value={editData.offerDuration.startDate ? editData.offerDuration.startDate.split('T')[0] : ''}
                  onChange={(e) => handleObjectChange('offerDuration', 'startDate', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Offer End Date</label>
                <input
                  type="date"
                  value={editData.offerDuration.endDate ? editData.offerDuration.endDate.split('T')[0] : ''}
                  onChange={(e) => handleObjectChange('offerDuration', 'endDate', e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
          </section>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button className="save-btn" onClick={handleSubmitEdit} disabled={uploadProgress > 0 && uploadProgress < 100}>
              {uploadProgress > 0 && uploadProgress < 100 ? 'Uploading...' : 'Save Changes'}
            </button>
            <button className="cancel-btn" onClick={handleCancelEdit} disabled={uploadProgress > 0 && uploadProgress < 100}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // View Mode JSX
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
        {/* NEW: Featured & Trending Management Section */}
        <section className="detail-section featured-trending-section">
          <h2>🌟 Featured & Trending Management</h2>
          
          <div className="management-grid">
            {/* Featured Management */}
            <div className="management-card">
              <h3>Featured Game</h3>
              <div className="status-badge">
                {game.isFeatured ? (
                  <span className="badge-active">✓ Featured</span>
                ) : (
                  <span className="badge-inactive">Not Featured</span>
                )}
              </div>
              
              <div className="management-controls">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={featuredInput.isFeatured}
                    onChange={(e) => setFeaturedInput(prev => ({ ...prev, isFeatured: e.target.checked }))}
                  />
                  <span>Set as Featured</span>
                </label>
                
                {featuredInput.isFeatured && (
                  <div className="order-input-group">
                    <label>Display Order:</label>
                    <input
                      type="number"
                      min="0"
                      value={featuredInput.order}
                      onChange={(e) => setFeaturedInput(prev => ({ ...prev, order: e.target.value }))}
                      className="order-input"
                      placeholder="0"
                    />
                    <small>Lower numbers appear first</small>
                  </div>
                )}
                
                <button 
                  className="apply-btn featured-btn" 
                  onClick={handleSetFeatured}
                >
                  {featuredInput.isFeatured ? 'Add to Featured' : 'Remove from Featured'}
                </button>
              </div>
              
              {game.isFeatured && (
                <div className="current-status">
                  <small>Current Order: {game.featuredOrder || 0}</small>
                </div>
              )}
            </div>

            {/* Trending Management */}
            <div className="management-card">
              <h3>Trending Game</h3>
              <div className="status-badge">
                {game.isTrending ? (
                  <span className="badge-active">🔥 Trending</span>
                ) : (
                  <span className="badge-inactive">Not Trending</span>
                )}
              </div>
              
              <div className="management-controls">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={trendingInput.isTrending}
                    onChange={(e) => setTrendingInput(prev => ({ ...prev, isTrending: e.target.checked }))}
                  />
                  <span>Set as Trending</span>
                </label>
                
                {trendingInput.isTrending && (
                  <div className="order-input-group">
                    <label>Display Order:</label>
                    <input
                      type="number"
                      min="0"
                      value={trendingInput.order}
                      onChange={(e) => setTrendingInput(prev => ({ ...prev, order: e.target.value }))}
                      className="order-input"
                      placeholder="0"
                    />
                    <small>Lower numbers appear first</small>
                  </div>
                )}
                
                <button 
                  className="apply-btn trending-btn" 
                  onClick={handleSetTrending}
                >
                  {trendingInput.isTrending ? 'Add to Trending' : 'Remove from Trending'}
                </button>
              </div>
              
              {game.isTrending && (
                <div className="current-status">
                  <small>Current Order: {game.trendingOrder || 0}</small>
                  <small>Views: {game.viewCount || 0}</small>
                </div>
              )}
            </div>
          </div>
        </section>

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

        {/* Game File */}
        {game.gameFile && (
          <section className="detail-section">
            <h2>Game File</h2>
            <div className="info-item">
              <strong>File:</strong>
              <p>{game.gameFile}</p>
              <a href={`${BACKEND_URL}/uploads/${game.gameFile}`} target="_blank" rel="noopener noreferrer" className="download-link">
                Download Game File
              </a>
            </div>
          </section>
        )}

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
              <strong>Featured:</strong>
              <p>{game.isFeatured ? `✓ Yes (Order: ${game.featuredOrder || 0})` : '✗ No'}</p>
            </div>
            <div className="info-item">
              <strong>Trending:</strong>
              <p>{game.isTrending ? `🔥 Yes (Order: ${game.trendingOrder || 0})` : '✗ No'}</p>
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
              <strong>Views:</strong>
              <p>{game.viewCount || 0}</p>
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
          <button className="edit-btn" onClick={handleStartEdit}>
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