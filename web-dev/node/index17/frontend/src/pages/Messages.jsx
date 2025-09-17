// Messages.jsx - Main messaging page with fixed image handling
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import backendUrl from '../utils/BackendURl';
import '../styles/Messages.css';

const Messages = () => {
  const navigate = useNavigate();
  const { socket, onlineUsers } = useSocket();
  
  const [conversations, setConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showSearch, setShowSearch] = useState(false);

  // Helper function to check if URL is a Cloudinary URL
  const isCloudinaryUrl = (url) => {
    return url && (url.startsWith('https://res.cloudinary.com') || url.startsWith('http://res.cloudinary.com'));
  };

  // Helper function to get correct image URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    
    // If it's a Cloudinary URL, return as-is
    if (isCloudinaryUrl(imageUrl)) {
      return imageUrl;
    }
    
    // If it's a relative path (legacy), prepend backend URL
    return `${backendUrl}${imageUrl}`;
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchConversations();
    
    if (socket) {
      socket.on('newMessage', handleNewMessage);
      socket.on('conversationUpdate', handleConversationUpdate);
      
      return () => {
        socket.off('newMessage', handleNewMessage);
        socket.off('conversationUpdate', handleConversationUpdate);
      };
    }
  }, [socket]);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await fetch(`${backendUrl}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setCurrentUser(data.user);
        }
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${backendUrl}/api/messages/conversations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    setSearching(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${backendUrl}/api/messages/search-users?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.users || []);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleNewMessage = (messageData) => {
    // Update conversations list when receiving a new message
    setConversations(prev => {
      const existingIndex = prev.findIndex(conv => conv.userId === messageData.senderId);
      
      if (existingIndex !== -1) {
        // Update existing conversation
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          lastMessage: {
            content: messageData.content,
            timestamp: messageData.timestamp,
            senderId: messageData.senderId,
            isRead: false
          },
          unreadCount: updated[existingIndex].unreadCount + 1
        };
        
        // Move to top
        const conversation = updated.splice(existingIndex, 1)[0];
        return [conversation, ...updated];
      } else {
        // Create new conversation entry
        const newConversation = {
          userId: messageData.senderId,
          name: messageData.senderName,
          profileImage: messageData.senderImage,
          userType: 'unknown',
          isOnline: onlineUsers.has(messageData.senderId),
          lastMessage: {
            content: messageData.content,
            timestamp: messageData.timestamp,
            senderId: messageData.senderId,
            isRead: false
          },
          unreadCount: 1
        };
        
        return [newConversation, ...prev];
      }
    });
  };

  const handleConversationUpdate = (updateData) => {
    setConversations(prev => {
      const existingIndex = prev.findIndex(conv => conv.userId === updateData.userId);
      
      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          lastMessage: {
            content: updateData.lastMessage,
            timestamp: updateData.timestamp,
            senderId: currentUser?.id,
            isRead: true
          },
          unreadCount: 0
        };
        
        // Move to top
        const conversation = updated.splice(existingIndex, 1)[0];
        return [conversation, ...updated];
      }
      
      return prev;
    });
  };

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.length >= 2) {
      searchUsers(value);
    } else {
      setSearchResults([]);
    }
  };

  const startConversation = (user) => {
    navigate(`/messages/${user.id}`);
  };

  const openConversation = (conversation) => {
    navigate(`/messages/${conversation.userId}`);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else if (diffInHours < 168) { // 1 week
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const formatUserType = (userType, specialization) => {
    if (userType === 'doctor') {
      const specializations = {
        'cardiology': 'Cardiologist',
        'dermatology': 'Dermatologist',
        'neurology': 'Neurologist',
        'pediatrics': 'Pediatrician',
        'orthopedics': 'Orthopedic Surgeon',
        'psychiatry': 'Psychiatrist',
        'general': 'General Physician',
        'other': 'Specialist'
      };
      return specializations[specialization] || 'Doctor';
    }
    return 'Patient';
  };

  if (loading) {
    return (
      <div className="messages-container">
        <div className="messages-header">
          <h1>Messages</h1>
        </div>
        <div className="messages-loading">
          <i className="fas fa-spinner fa-spin"></i>
          <span>Loading conversations...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="messages-container">
      <div className="messages-header">
        <h1>Messages</h1>
        <button 
          className="new-message-btn"
          onClick={() => setShowSearch(!showSearch)}
        >
          <i className="fas fa-plus"></i>
          New Message
        </button>
      </div>

      {/* Search Section */}
      {showSearch && (
        <div className="messages-search-section">
          <div className="search-input-container">
            <i className="fas fa-search search-icon"></i>
            <input
              type="text"
              placeholder="Search for doctors or patients..."
              value={searchQuery}
              onChange={handleSearchInputChange}
              className="messages-search-input"
            />
            {searchQuery && (
              <button 
                className="clear-search-btn"
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
          
          {searching && (
            <div className="search-loading">
              <i className="fas fa-spinner fa-spin"></i>
              <span>Searching...</span>
            </div>
          )}
          
          {searchResults.length > 0 && (
            <div className="search-results">
              <h3>Search Results</h3>
              {searchResults.map(user => (
                <div 
                  key={user.id} 
                  className="search-result-item"
                  onClick={() => startConversation(user)}
                >
                  <div className="search-result-avatar">
                    {user.profileImage ? (
                      <img 
                        src={getImageUrl(user.profileImage)} 
                        alt={user.name} 
                        onError={(e) => {
                          // Fallback to placeholder if image fails to load
                          e.target.style.display = 'none';
                          e.target.parentElement.querySelector('.avatar-placeholder').style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className="avatar-placeholder"
                      style={{ display: user.profileImage ? 'none' : 'flex' }}
                    >
                      <i className={`fas ${user.userType === 'doctor' ? 'fa-user-md' : 'fa-user'}`}></i>
                    </div>
                    {onlineUsers.has(user.id) && (
                      <div className="online-indicator"></div>
                    )}
                  </div>
                  <div className="search-result-info">
                    <div className="search-result-name">{user.name}</div>
                    <div className="search-result-type">
                      {formatUserType(user.userType, user.specialization)}
                    </div>
                  </div>
                  <div className="search-result-action">
                    <i className="fas fa-comment"></i>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Conversations List */}
      <div className="conversations-list">
        {conversations.length === 0 ? (
          <div className="no-conversations">
            <i className="fas fa-comments"></i>
            <h3>No conversations yet</h3>
            <p>Start a conversation by searching for doctors or patients above.</p>
          </div>
        ) : (
          conversations.map(conversation => (
            <div 
              key={conversation.userId} 
              className="conversation-item"
              onClick={() => openConversation(conversation)}
            >
              <div className="conversation-avatar">
                {conversation.profileImage ? (
                  <img 
                    src={getImageUrl(conversation.profileImage)} 
                    alt={conversation.name} 
                    onError={(e) => {
                      // Fallback to placeholder if image fails to load
                      e.target.style.display = 'none';
                      e.target.parentElement.querySelector('.avatar-placeholder').style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className="avatar-placeholder"
                  style={{ display: conversation.profileImage ? 'none' : 'flex' }}
                >
                  <i className={`fas ${conversation.userType === 'doctor' ? 'fa-user-md' : 'fa-user'}`}></i>
                </div>
                {onlineUsers.has(conversation.userId) && (
                  <div className="online-indicator"></div>
                )}
              </div>
              
              <div className="conversation-info">
                <div className="conversation-header">
                  <div className="conversation-name">{conversation.name}</div>
                  <div className="conversation-time">
                    {formatTime(conversation.lastMessage.timestamp)}
                  </div>
                </div>
                
                <div className="conversation-preview">
                  <div className="last-message">
                    {conversation.lastMessage.senderId === currentUser?.id && (
                      <span className="you-indicator">You: </span>
                    )}
                    {conversation.lastMessage.content.length > 50 
                      ? `${conversation.lastMessage.content.substring(0, 50)}...`
                      : conversation.lastMessage.content
                    }
                  </div>
                  {conversation.unreadCount > 0 && (
                    <div className="unread-badge">
                      {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                    </div>
                  )}
                </div>
                
                <div className="conversation-meta">
                  <span className="user-type">
                    {formatUserType(conversation.userType, conversation.specialization)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Messages;