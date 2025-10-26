import React, { useState, useEffect } from 'react';
import BACKEND_URL from '../utils/BackendURL';
import '../styles/userProfile.css';

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState(null);
  const [collection, setCollection] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showSecurityDropdown, setShowSecurityDropdown] = useState(false);
  const [securityAction, setSecurityAction] = useState('');
  
  const [editForm, setEditForm] = useState({
    username: '',
    profilePic: null,
    previewUrl: ''
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [emailForm, setEmailForm] = useState({
    newEmail: '',
    password: ''
  });

  useEffect(() => {
    fetchUserData();
    fetchUserCollection();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/user`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setUser(data.user);
        setEditForm({
          ...editForm,
          username: data.user.username
        });
        setError('');
      } else {
        setError(data.message || 'Failed to load user data');
        setUser(null);
      }
    } catch (err) {
      setError('Error fetching user data: ' + err.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserCollection = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/user/collection`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCollection(data.collection || []);
      } else {
        setCollection([]);
      }
    } catch (err) {
      setCollection([]);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setEditForm({
        username: user.username,
        profilePic: null,
        previewUrl: ''
      });
    }
    setIsEditing(!isEditing);
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed');
        return;
      }

      setEditForm({
        ...editForm,
        profilePic: file
      });
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm(prev => ({
          ...prev,
          previewUrl: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    setError('');
    setSuccess('');

    try {
      if (editForm.username !== user.username) {
        const response = await fetch(`${BACKEND_URL}/api/user/update-username`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({ username: editForm.username })
        });

        const data = await response.json();
        if (!response.ok) {
          setError(data.message || 'Failed to update username');
          return;
        }
      }

      if (editForm.profilePic) {
        const formData = new FormData();
        formData.append('profilePic', editForm.profilePic);

        const response = await fetch(`${BACKEND_URL}/api/user/upload-profile-pic`, {
          method: 'POST',
          credentials: 'include',
          body: formData
        });

        const data = await response.json();
        if (!response.ok) {
          setError(data.message || 'Failed to upload profile picture');
          return;
        }
      }

      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      setEditForm({
        ...editForm,
        profilePic: null,
        previewUrl: ''
      });
      fetchUserData();
    } catch (err) {
      setError('Error updating profile');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/user/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Password changed successfully!');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setSecurityAction('');
      } else {
        setError(data.message || 'Failed to change password');
      }
    } catch (err) {
      setError('Error changing password');
    }
  };

  const handleEmailChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailForm.newEmail)) {
      setError('Invalid email format');
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/user/change-email`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          newEmail: emailForm.newEmail,
          password: emailForm.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Email changed successfully!');
        setEmailForm({ newEmail: '', password: '' });
        setSecurityAction('');
        fetchUserData();
      } else {
        setError(data.message || 'Failed to change email');
      }
    } catch (err) {
      setError('Error changing email');
    }
  };

  const getCollectionStats = () => {
    const totalGames = collection.length;
    const totalSpent = collection.reduce((sum, item) => sum + (item.price || 0), 0);
    const genres = [...new Set(collection.map(item => item.game?.genre).flat().filter(Boolean))];
    const platforms = [...new Set(collection.map(item => item.game?.availablePlatforms).flat().filter(Boolean))];

    return {
      totalGames,
      totalSpent: totalSpent.toFixed(2),
      uniqueGenres: genres.length,
      uniquePlatforms: platforms.length
    };
  };

  if (loading) {
    return (
      <div className="up-profile-page">
        <div className="up-loading-container">
          <div className="up-loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="up-profile-page">
        <div className="up-error-container">
          <i className="fas fa-exclamation-triangle"></i>
          <p>Please log in to view your profile</p>
        </div>
      </div>
    );
  }

  const stats = getCollectionStats();

  return (
    <div className="up-profile-page">
      <div className="up-profile-container">
        {error && (
          <div className="up-alert up-alert-error">
            <i className="fas fa-exclamation-circle"></i>
            <span>{error}</span>
            <button onClick={() => setError('')} className="up-alert-close">
              <i className="fas fa-times"></i>
            </button>
          </div>
        )}

        {success && (
          <div className="up-alert up-alert-success">
            <i className="fas fa-check-circle"></i>
            <span>{success}</span>
            <button onClick={() => setSuccess('')} className="up-alert-close">
              <i className="fas fa-times"></i>
            </button>
          </div>
        )}

        <div className="up-profile-tabs">
          <button
            className={`up-profile-tab ${activeTab === 'overview' ? 'up-active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <i className="fas fa-user"></i>
            <span>Profile</span>
          </button>
          <button
            className={`up-profile-tab ${activeTab === 'statistics' ? 'up-active' : ''}`}
            onClick={() => setActiveTab('statistics')}
          >
            <i className="fas fa-chart-line"></i>
            <span>Statistics</span>
          </button>
        </div>

        {activeTab === 'overview' && (
          <div className="up-profile-content">
            <div className="up-profile-header-section">
              <div className="up-profile-info-card">
                <div className="up-profile-avatar-section">
                  <div className="up-profile-avatar">
                    {editForm.previewUrl ? (
                      <img src={editForm.previewUrl} alt="Preview" />
                    ) : user.profilePicUrl ? (
                      <img 
                        src={user.profilePicUrl.startsWith('http') ? user.profilePicUrl : `${BACKEND_URL}${user.profilePicUrl}`} 
                        alt="Profile"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = `<div class="up-avatar-placeholder">${user.username.charAt(0).toUpperCase()}</div>`;
                        }}
                      />
                    ) : (
                      <div className="up-avatar-placeholder">{user.username.charAt(0).toUpperCase()}</div>
                    )}
                  </div>
                  {isEditing && (
                    <div className="up-avatar-upload">
                      <label htmlFor="up-profile-pic-input" className="up-upload-label">
                        <i className="fas fa-camera"></i>
                        <span>Change Photo</span>
                      </label>
                      <input
                        id="up-profile-pic-input"
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePicChange}
                        className="up-file-input"
                      />
                    </div>
                  )}
                </div>

                <div className="up-profile-details">
                  {isEditing ? (
                    <div className="up-edit-username">
                      <label>Username</label>
                      <input
                        type="text"
                        value={editForm.username}
                        onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                        className="up-username-input"
                        placeholder="Enter username"
                      />
                    </div>
                  ) : (
                    <h2 className="up-profile-username">{user.username}</h2>
                  )}
                  <p className="up-profile-email">
                    <i className="fas fa-envelope"></i>
                    {user.email}
                  </p>
                  <p className="up-profile-joined">
                    <i className="fas fa-calendar-alt"></i>
                    Member since {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                </div>

                <div className="up-profile-actions">
                  {isEditing ? (
                    <>
                      <button className="up-btn up-btn-save" onClick={handleSaveProfile}>
                        <i className="fas fa-check"></i>
                        Save Changes
                      </button>
                      <button className="up-btn up-btn-cancel" onClick={handleEditToggle}>
                        <i className="fas fa-times"></i>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button className="up-btn up-btn-edit" onClick={handleEditToggle}>
                      <i className="fas fa-edit"></i>
                      Edit Profile
                    </button>
                  )}
                </div>
              </div>

              <div className="up-security-section">
                <button 
                  className="up-security-dropdown-btn"
                  onClick={() => setShowSecurityDropdown(!showSecurityDropdown)}
                >
                  <i className="fas fa-shield-alt"></i>
                  <span>Security Settings</span>
                  <i className={`fas fa-chevron-${showSecurityDropdown ? 'up' : 'down'}`}></i>
                </button>

                {showSecurityDropdown && (
                  <div className="up-security-dropdown">
                    <button 
                      className="up-security-option"
                      onClick={() => setSecurityAction(securityAction === 'password' ? '' : 'password')}
                    >
                      <i className="fas fa-key"></i>
                      <span>Change Password</span>
                      <i className={`fas fa-chevron-${securityAction === 'password' ? 'up' : 'down'}`}></i>
                    </button>

                    {securityAction === 'password' && (
                      <div className="up-security-form">
                        <div className="up-form-group">
                          <label>Current Password</label>
                          <input
                            type="password"
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                            placeholder="Enter current password"
                          />
                        </div>
                        <div className="up-form-group">
                          <label>New Password</label>
                          <input
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                            placeholder="Enter new password"
                          />
                        </div>
                        <div className="up-form-group">
                          <label>Confirm New Password</label>
                          <input
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                            placeholder="Confirm new password"
                          />
                        </div>
                        <button className="up-btn up-btn-primary" onClick={handlePasswordChange}>
                          <i className="fas fa-save"></i>
                          Update Password
                        </button>
                      </div>
                    )}

                    <button 
                      className="up-security-option"
                      onClick={() => setSecurityAction(securityAction === 'email' ? '' : 'email')}
                    >
                      <i className="fas fa-envelope"></i>
                      <span>Change Email</span>
                      <i className={`fas fa-chevron-${securityAction === 'email' ? 'up' : 'down'}`}></i>
                    </button>

                    {securityAction === 'email' && (
                      <div className="up-security-form">
                        <div className="up-form-group">
                          <label>New Email Address</label>
                          <input
                            type="email"
                            value={emailForm.newEmail}
                            onChange={(e) => setEmailForm({...emailForm, newEmail: e.target.value})}
                            placeholder="Enter new email"
                          />
                        </div>
                        <div className="up-form-group">
                          <label>Confirm Password</label>
                          <input
                            type="password"
                            value={emailForm.password}
                            onChange={(e) => setEmailForm({...emailForm, password: e.target.value})}
                            placeholder="Enter your password"
                          />
                        </div>
                        <button className="up-btn up-btn-primary" onClick={handleEmailChange}>
                          <i className="fas fa-save"></i>
                          Update Email
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="up-quick-stats">
                <div className="up-stat-card">
                  <i className="fas fa-gamepad"></i>
                  <div className="up-stat-info">
                    <span className="up-stat-value">{stats.totalGames}</span>
                    <span className="up-stat-label">Games Owned</span>
                  </div>
                </div>
                <div className="up-stat-card">
                  <i className="fas fa-rupee-sign"></i>
                  <div className="up-stat-info">
                    <span className="up-stat-value">₹{stats.totalSpent}</span>
                    <span className="up-stat-label">Total Spent</span>
                  </div>
                </div>
              </div>

              <div className="up-collection-header">
                <h2 className="up-section-title">
                  <i className="fas fa-gamepad"></i>
                  My Game Collection
                </h2>
                <span className="up-collection-count">{collection.length} Games</span>
              </div>

              {collection.length === 0 ? (
                <div className="up-empty-state">
                  <i className="fas fa-inbox"></i>
                  <h3>No Games Yet</h3>
                  <p>Start building your gaming library today!</p>
                  <button className="up-btn up-btn-primary" onClick={() => window.location.href = '/products'}>
                    <i className="fas fa-shopping-cart"></i>
                    Browse Games
                  </button>
                </div>
              ) : (
                <div className="up-collection-grid">
                  {collection.map((item) => (
                    <div key={item._id} className="up-collection-card">
                      <div className="up-collection-card-image">
                        {item.game?.imageUrl ? (
                          <img src={item.game.imageUrl} alt={item.game.name} />
                        ) : (
                          <div className="up-image-placeholder">
                            <i className="fas fa-gamepad"></i>
                          </div>
                        )}
                      </div>
                      <div className="up-collection-card-content">
                        <h4 className="up-game-title">{item.game?.name || 'Unknown Game'}</h4>
                        <div className="up-game-meta">
                          <span className="up-purchase-date">
                            <i className="fas fa-calendar"></i>
                            {new Date(item.purchasedAt).toLocaleDateString()}
                          </span>
                          <span className="up-game-price">
                            <i className="fas fa-tag"></i>
                            ₹{item.price.toFixed(2)}
                          </span>
                        </div>
                        <button 
                          className="up-btn up-btn-play"
                          onClick={() => window.location.href = `/game/${item.game._id}`}
                        >
                          <i className="fas fa-play"></i>
                          View Game
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'statistics' && (
          <div className="up-profile-content">
            <h2 className="up-section-title">
              <i className="fas fa-chart-line"></i>
              Gaming Statistics
            </h2>

            <div className="up-stats-grid">
              <div className="up-stat-card-large">
                <div className="up-stat-icon">
                  <i className="fas fa-gamepad"></i>
                </div>
                <div className="up-stat-content">
                  <h3 className="up-stat-number">{stats.totalGames}</h3>
                  <p className="up-stat-title">Total Games</p>
                </div>
              </div>

              <div className="up-stat-card-large">
                <div className="up-stat-icon up-green">
                  <i className="fas fa-rupee-sign"></i>
                </div>
                <div className="up-stat-content">
                  <h3 className="up-stat-number">₹{stats.totalSpent}</h3>
                  <p className="up-stat-title">Total Spent</p>
                </div>
              </div>

              <div className="up-stat-card-large">
                <div className="up-stat-icon up-yellow">
                  <i className="fas fa-layer-group"></i>
                </div>
                <div className="up-stat-content">
                  <h3 className="up-stat-number">{stats.uniqueGenres}</h3>
                  <p className="up-stat-title">Unique Genres</p>
                </div>
              </div>

              <div className="up-stat-card-large">
                <div className="up-stat-icon up-red">
                  <i className="fas fa-desktop"></i>
                </div>
                <div className="up-stat-content">
                  <h3 className="up-stat-number">{stats.uniquePlatforms}</h3>
                  <p className="up-stat-title">Platforms</p>
                </div>
              </div>
            </div>

            <div className="up-recent-activity">
              <h3 className="up-subsection-title">
                <i className="fas fa-history"></i>
                Recent Purchases
              </h3>
              {collection.length > 0 ? (
                <div className="up-activity-list">
                  {collection.slice(0, 5).map((item) => (
                    <div key={item._id} className="up-activity-item">
                      <div className="up-activity-icon">
                        <i className="fas fa-shopping-bag"></i>
                      </div>
                      <div className="up-activity-details">
                        <h4>{item.game?.name || 'Unknown Game'}</h4>
                        <p>{new Date(item.purchasedAt).toLocaleDateString('en-US', { 
                          month: 'long', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}</p>
                      </div>
                      <div className="up-activity-price">₹{item.price.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="up-empty-activity">
                  <p>No purchase history yet</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;