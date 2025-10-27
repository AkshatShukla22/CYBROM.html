import React, { useState, useEffect } from 'react';
import BACKEND_URL from '../utils/BackendURL';
import '../styles/AdminUsersPanel.css';

const AdminUsersPanel = ({ setMessage, navigate }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/users`, { credentials: 'include' });
      if (response.status === 401) { navigate('/login'); return; }
      const data = await response.json();
      if (response.ok) setUsers(data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchUserDetails = async (userId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/users/${userId}`, { credentials: 'include' });
      if (response.status === 401) { navigate('/login'); return; }
      const data = await response.json();
      if (response.ok) setSelectedUser(data);
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const getProfilePicUrl = (profilePicUrl) => {
    if (!profilePicUrl) return null;
    
    // Handle full URLs (Google OAuth, etc.)
    if (profilePicUrl.startsWith('http')) {
      return profilePicUrl;
    }
    
    // Handle relative URLs from backend
    return `${BACKEND_URL}${profilePicUrl}`;
  };

  const getUserInitial = (username) => {
    return username?.charAt(0).toUpperCase() || 'U';
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
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
            <div className="user-avatar-section">
              {user.profilePicUrl && !user.profilePicUrl.includes('undefined') ? (
                <img 
                  src={getProfilePicUrl(user.profilePicUrl)}
                  alt={user.username}
                  className="user-avatar-img"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className="user-avatar-placeholder"
                style={{
                  display: user.profilePicUrl && !user.profilePicUrl.includes('undefined') ? 'none' : 'flex'
                }}
              >
                {getUserInitial(user.username)}
              </div>
            </div>
            <div className="user-info">
              <h3>{user.username}</h3>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
            <button className="view-btn" onClick={() => fetchUserDetails(user._id)}>
              View Collection
            </button>
          </div>
        ))}
        {filteredUsers.length === 0 && (
          <div className="no-data">
            <i className="fas fa-users"></i>
            <p>No users found</p>
          </div>
        )}
      </div>
      
      {selectedUser && (
        <div className="user-details-panel">
          <div className="user-details-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div className="user-detail-avatar-section">
                {selectedUser.user.profilePicUrl && !selectedUser.user.profilePicUrl.includes('undefined') ? (
                  <img 
                    src={getProfilePicUrl(selectedUser.user.profilePicUrl)}
                    alt={selectedUser.user.username}
                    className="user-detail-avatar-img"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className="user-detail-avatar-placeholder"
                  style={{
                    display: selectedUser.user.profilePicUrl && !selectedUser.user.profilePicUrl.includes('undefined') ? 'none' : 'flex'
                  }}
                >
                  {getUserInitial(selectedUser.user.username)}
                </div>
              </div>
              <div>
                <h2>User Details: {selectedUser.user.username}</h2>
                <p><strong>Email:</strong> {selectedUser.user.email}</p>
              </div>
            </div>
            <button className="close-btn" onClick={() => setSelectedUser(null)}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <h3>Game Collection ({selectedUser.collection.length} games)</h3>
          <div className="collection-list">
            {selectedUser.collection.map(item => (
              <div key={item._id} className="collection-item">
                <i className="fas fa-gamepad"></i>
                <span>{item.game.name}</span>
                <span className="purchase-date">
                  Purchased: {new Date(item.purchasedAt).toLocaleDateString()}
                </span>
              </div>
            ))}
            {selectedUser.collection.length === 0 && (
              <p className="no-games">No games in collection</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPanel;