// Chat.jsx - Individual chat interface with fixed image handling
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import backendUrl from '../utils/BackendURl';
import '../styles/Chat.css';

const Chat = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { socket, onlineUsers } = useSocket();
  
  const [messages, setMessages] = useState([]);
  const [otherUser, setOtherUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState('');
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

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
    fetchMessages();
    
    if (socket) {
      socket.on('newMessage', handleNewMessage);
      socket.on('messageSent', handleMessageSent);
      socket.on('messageError', handleMessageError);
      socket.on('userTyping', handleUserTyping);
      socket.on('userStoppedTyping', handleUserStoppedTyping);
      
      return () => {
        socket.off('newMessage', handleNewMessage);
        socket.off('messageSent', handleMessageSent);
        socket.off('messageError', handleMessageError);
        socket.off('userTyping', handleUserTyping);
        socket.off('userStoppedTyping', handleUserStoppedTyping);
      };
    }
  }, [socket, userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Mark messages as read when component mounts or userId changes
    if (otherUser && currentUser) {
      markMessagesAsRead();
    }
  }, [otherUser, currentUser]);

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

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${backendUrl}/api/messages/conversation/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
        setOtherUser(data.otherUser);
      } else {
        setError('Failed to load conversation');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Network error while loading conversation');
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${backendUrl}/api/messages/read/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const handleNewMessage = (messageData) => {
    if (messageData.senderId === userId) {
      setMessages(prev => [...prev, {
        _id: messageData.messageId,
        senderId: messageData.senderId,
        content: messageData.content,
        createdAt: messageData.timestamp,
        senderName: messageData.senderName,
        senderImage: messageData.senderImage,
        isRead: false
      }]);
      
      // Mark as read immediately since user is viewing the conversation
      setTimeout(() => {
        if (socket) {
          socket.emit('markAsRead', [messageData.messageId]);
        }
      }, 500);
    }
  };

  const handleMessageSent = (data) => {
    setSending(false);
    // Message should already be in the list from the socket event
  };

  const handleMessageError = (error) => {
    setSending(false);
    setError(error.error || 'Failed to send message');
  };

  const handleUserTyping = (typingUserId) => {
    if (typingUserId === userId) {
      setIsTyping(true);
    }
  };

  const handleUserStoppedTyping = (typingUserId) => {
    if (typingUserId === userId) {
      setIsTyping(false);
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim() || sending || !currentUser) return;
    
    setSending(true);
    setError('');
    
    const tempMessage = {
      _id: Date.now(), // Temporary ID
      senderId: currentUser.id,
      content: messageText.trim(),
      createdAt: new Date(),
      senderName: currentUser.name,
      senderImage: currentUser.profileImage,
      isRead: false,
      isTemporary: true
    };
    
    setMessages(prev => [...prev, tempMessage]);
    const messageContent = messageText.trim();
    setMessageText('');
    
    if (socket) {
      socket.emit('sendMessage', {
        receiverId: userId,
        content: messageContent,
        senderName: currentUser.name,
        senderImage: currentUser.profileImage
      });
    } else {
      // Fallback to HTTP request if socket is not available
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${backendUrl}/api/messages/send`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            receiverId: userId,
            content: messageContent
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          // Remove temporary message and add real one
          setMessages(prev => {
            const filtered = prev.filter(msg => msg._id !== tempMessage._id);
            return [...filtered, {
              _id: data.data.messageId,
              senderId: currentUser.id,
              content: data.data.content,
              createdAt: data.data.timestamp,
              senderName: data.data.senderName,
              senderImage: data.data.senderImage,
              isRead: false
            }];
          });
        } else {
          setError('Failed to send message');
          // Remove temporary message on error
          setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id));
        }
      } catch (error) {
        setError('Network error while sending message');
        setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id));
        console.error('Error sending message:', error);
      }
      setSending(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setMessageText(value);
    
    // Handle typing indicators
    if (socket && value.trim()) {
      socket.emit('typing', userId);
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set timeout to stop typing
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stopTyping', userId);
      }, 3000);
    } else if (socket) {
      socket.emit('stopTyping', userId);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
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
      <div className="chat-container">
        <div className="chat-loading">
          <i className="fas fa-spinner fa-spin"></i>
          <span>Loading conversation...</span>
        </div>
      </div>
    );
  }

  if (error && !otherUser) {
    return (
      <div className="chat-container">
        <div className="chat-error">
          <i className="fas fa-exclamation-triangle"></i>
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={() => navigate('/messages')} className="back-btn">
            Back to Messages
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      {/* Chat Header */}
      <div className="chat-header">
        <button 
          className="back-button"
          onClick={() => navigate('/messages')}
        >
          <i className="fas fa-arrow-left"></i>
        </button>
        
        <div className="chat-user-info">
          <div className="chat-user-avatar">
            {otherUser?.profileImage ? (
              <img 
                src={getImageUrl(otherUser.profileImage)} 
                alt={otherUser.name}
                onError={(e) => {
                  // Fallback to placeholder if image fails to load
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className="avatar-placeholder"
              style={{ display: otherUser?.profileImage ? 'none' : 'flex' }}
            >
              <i className={`fas ${otherUser?.userType === 'doctor' ? 'fa-user-md' : 'fa-user'}`}></i>
            </div>
            {onlineUsers.has(userId) && (
              <div className="online-indicator"></div>
            )}
          </div>
          
          <div className="chat-user-details">
            <div className="chat-user-name">{otherUser?.name}</div>
            <div className="chat-user-status">
              {onlineUsers.has(userId) ? 'Online' : 'Offline'} • {formatUserType(otherUser?.userType, otherUser?.specialization)}
            </div>
          </div>
        </div>
        
        {otherUser?.userType === 'doctor' && (
          <button 
            className="profile-button"
            onClick={() => navigate(`/doctor/${userId}`)}
          >
            <i className="fas fa-user-md"></i>
            Profile
          </button>
        )}
      </div>

      {/* Messages Area */}
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="no-messages">
            <i className="fas fa-comments"></i>
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div 
              key={message._id} 
              className={`message ${message.senderId === currentUser?.id ? 'sent' : 'received'} ${message.isTemporary ? 'sending' : ''}`}
            >
              <div className="message-avatar">
                {message.senderId === currentUser?.id ? (
                  // Current user's avatar
                  <>
                    {currentUser.profileImage ? (
                      <img 
                        src={getImageUrl(currentUser.profileImage)} 
                        alt={currentUser.name}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className="avatar-placeholder"
                      style={{ display: currentUser.profileImage ? 'none' : 'flex' }}
                    >
                      <i className={`fas ${currentUser.userType === 'doctor' ? 'fa-user-md' : 'fa-user'}`}></i>
                    </div>
                  </>
                ) : (
                  // Other user's avatar
                  <>
                    {otherUser?.profileImage ? (
                      <img 
                        src={getImageUrl(otherUser.profileImage)} 
                        alt={otherUser.name}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className="avatar-placeholder"
                      style={{ display: otherUser?.profileImage ? 'none' : 'flex' }}
                    >
                      <i className={`fas ${otherUser?.userType === 'doctor' ? 'fa-user-md' : 'fa-user'}`}></i>
                    </div>
                  </>
                )}
              </div>
              
              <div className="message-content">
                <div className="message-bubble">
                  <div className="message-text">{message.content}</div>
                </div>
                <div className="message-time">
                  {formatTime(message.createdAt)}
                  {message.senderId === currentUser?.id && message.isTemporary && (
                    <i className="fas fa-clock sending-icon"></i>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        
        {isTyping && (
          <div className="typing-indicator">
            <div className="typing-avatar">
              {otherUser?.profileImage ? (
                <img 
                  src={getImageUrl(otherUser.profileImage)} 
                  alt={otherUser.name}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className="avatar-placeholder"
                style={{ display: otherUser?.profileImage ? 'none' : 'flex' }}
              >
                <i className={`fas ${otherUser?.userType === 'doctor' ? 'fa-user-md' : 'fa-user'}`}></i>
              </div>
            </div>
            <div className="typing-bubble">
              <div className="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="chat-input-container">
        {error && (
          <div className="chat-error-message">
            <i className="fas fa-exclamation-triangle"></i>
            <span>{error}</span>
            <button onClick={() => setError('')}>
              <i className="fas fa-times"></i>
            </button>
          </div>
        )}
        
        <div className="chat-input">
          <textarea
            value={messageText}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            rows={1}
            disabled={sending}
            maxLength={1000}
          />
          <button 
            onClick={sendMessage}
            disabled={!messageText.trim() || sending}
            className="send-button"
          >
            {sending ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : (
              <i className="fas fa-paper-plane"></i>
            )}
          </button>
        </div>
        
        <div className="message-length-counter">
          {messageText.length}/1000
        </div>
      </div>
    </div>
  );
};

export default Chat;