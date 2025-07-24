import React, { useState, useEffect } from 'react';
import { Search, Bell, MessageCircle, Calendar, X, User, Settings, LogOut } from 'lucide-react';
import '../styles/header.css'; 

const Header = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifications = [
    {
      id: 1,
      type: 'task',
      title: 'Task completed',
      message: '[task_name] marked as completed..',
      time: '10 mins ago',
      avatar: '/api/placeholder/40/40'
    },
    {
      id: 2,
      type: 'meeting',
      title: 'Meeting Created',
      message: 'New meeting [meeting_title] is created for [date_time]',
      time: '5 mins ago',
      icon: Calendar
    },
    {
      id: 3,
      type: 'action',
      title: 'Action Item Added',
      message: '[action_item_name] is added in meeting [meeting_title]',
      time: '22 May 2025',
      icon: Calendar
    },
    {
      id: 4,
      type: 'task',
      title: 'Task assigned',
      message: '[task_name] has been assigned to [user_name].',
      time: '2 hours ago',
      avatar: '/api/placeholder/40/40'
    }
  ];

  const chatMessages = [
    {
      id: 1,
      message: 'You have a new messages from [user_name]',
      time: '10 mins ago',
      avatar: '/api/placeholder/40/40'
    },
    {
      id: 2,
      message: 'You have a new messages from [user_name]',
      time: '10 mins ago',
      avatar: '/api/placeholder/40/40'
    },
    {
      id: 3,
      message: 'You have a new messages from [user_name]',
      time: '10 mins ago',
      avatar: '/api/placeholder/40/40'
    },
    {
      id: 4,
      message: 'You have a new messages from [user_name]',
      time: '10 mins ago',
      avatar: '/api/placeholder/40/40'
    }
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('[data-dropdown]')) {
        setShowNotifications(false);
        setShowChat(false);
        setShowUserMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="header">
      <div className="header-container">
        {/* Left side */}

        <div className="logo">
            <div className="logo-icon">
              <span className="logo-text">ATL</span>
            </div>
            <div className="logo-name">
              <span className="company-name">ADAM</span>
              <span className="company-subtitle">EXPORTS</span>
            </div>
        </div>

        <div className="header-left">
          <button className="menu-btn">
            <div className="hamburger">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>
          
          
          
          <div className="search-container">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search anything here..."
              className="search-input"
            />
          </div>
        </div>
        
        {/* Right side */}
        <div className="header-right">
          {/* Chat */}
          <div className="chat-container" data-dropdown="chat">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowChat(!showChat);
                setShowNotifications(false);
                setShowUserMenu(false);
              }}
              className="chat-btn"
            >
              <MessageCircle className="icon" />
              <span className="chat-badge">10</span>
            </button>
            
            {showChat && (
              <div className="dropdown chat-dropdown">
                <div className="dropdown-header">
                  <h3>Chat</h3>
                  <span className="new-badge">5 new</span>
                </div>
                <div className="dropdown-content">
                  {chatMessages.map(message => (
                    <div key={message.id} className="chat-item">
                      <div className="chat-avatar">
                        <div className="avatar-circle blue">U</div>
                      </div>
                      <div className="chat-text">
                        <div className="chat-title">New Message</div>
                        <div className="chat-message">{message.message}</div>
                        <div className="chat-time">{message.time}</div>
                      </div>
                      <button className="close-btn">
                        <X className="close-icon" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="dropdown-footer">
                  <button className="view-all-btn">View All</button>
                </div>
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="notification-container" data-dropdown="notifications">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowNotifications(!showNotifications);
                setShowChat(false);
                setShowUserMenu(false);
              }}
              className="notification-btn"
            >
              <Bell className="icon" />
              <span className="notification-badge">10</span>
            </button>
            
            {showNotifications && (
              <div className="dropdown notification-dropdown">
                <div className="dropdown-header">
                  <h3>Notifications</h3>
                  <span className="new-badge">5 new</span>
                </div>
                <div className="dropdown-content">
                  {notifications.map(notification => (
                    <div key={notification.id} className="notification-item">
                      <div className="notification-avatar">
                        {notification.avatar ? (
                          <div className="avatar-circle purple">U</div>
                        ) : notification.icon ? (
                          <div className="icon-wrapper">
                            <notification.icon className="notification-icon" />
                          </div>
                        ) : (
                          <div className="icon-wrapper">
                            <Calendar className="notification-icon" />
                          </div>
                        )}
                      </div>
                      <div className="notification-text">
                        <div className="notification-title">{notification.title}</div>
                        <div className="notification-message">{notification.message}</div>
                        <div className="notification-time">{notification.time}</div>
                      </div>
                      <button className="close-btn">
                        <X className="close-icon" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="dropdown-footer">
                  <button className="view-all-btn">View All</button>
                </div>
              </div>
            )}
          </div>
          
          
          {/* User Menu */}
          <div className="user-container" data-dropdown="user">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
                setShowChat(false);
              }}
              className="user-btn"
            >
              <div className="user-avatar">
                <div className="avatar-circle green">M</div>
              </div>
              <div className="user-info">
                <div className="user-name">Mohd Saleem</div>
                <div className="user-role">Admin</div>
              </div>
            </button>
            
            {showUserMenu && (
              <div className="dropdown user-dropdown">
                <div className="user-menu-content">
                  <button className="user-menu-item">
                    <User className="menu-icon" />
                    <span>Profile</span>
                  </button>
                  <button className="user-menu-item">
                    <Settings className="menu-icon" />
                    <span>Settings</span>
                  </button>
                  <button className="user-menu-item">
                    <LogOut className="menu-icon" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;