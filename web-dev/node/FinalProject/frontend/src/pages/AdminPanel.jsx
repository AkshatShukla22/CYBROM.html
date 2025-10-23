import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BACKEND_URL from '../utils/BackendURL';
import AdminGamesPanel from '../components/AdminGamesPanel';
import AdminUsersPanel from '../components/AdminUsersPanel';
import AdminNewsPanel from '../components/AdminNewsPanel';
import AdminSupportPanel from './AdminSupportPanel';
import AdminPurchasesPanel from '../components/AdminPurchasesPanel';
import '../styles/AdminPanel.css';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('games');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/verify`, { credentials: 'include' });
      if (!response.ok) navigate('/login');
    } catch (error) {
      console.error('Auth check failed:', error);
      navigate('/login');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${BACKEND_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch (error) {
      console.error('Logout error:', error);
    }
    navigate('/login');
  };

  const renderActivePanel = () => {
    switch (activeTab) {
      case 'games':
        return <AdminGamesPanel setMessage={setMessage} navigate={navigate} />;
      case 'users':
        return <AdminUsersPanel setMessage={setMessage} navigate={navigate} />;
      case 'news':
        return <AdminNewsPanel setMessage={setMessage} navigate={navigate} />;
      case 'support':
        return <AdminSupportPanel setMessage={setMessage} navigate={navigate} />;
      case 'purchases':
        return <AdminPurchasesPanel setMessage={setMessage} navigate={navigate} />;
      default:
        return <AdminGamesPanel setMessage={setMessage} navigate={navigate} />;
    }
  };

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
        <button className={`tab-btn ${activeTab === 'games' ? 'active' : ''}`} onClick={() => setActiveTab('games')}>
          <i className="fas fa-gamepad"></i> Games
        </button>
        <button className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
          <i className="fas fa-users"></i> Users
        </button>
        <button className={`tab-btn ${activeTab === 'news' ? 'active' : ''}`} onClick={() => setActiveTab('news')}>
          <i className="fas fa-newspaper"></i> News
        </button>
        <button className={`tab-btn ${activeTab === 'support' ? 'active' : ''}`} onClick={() => setActiveTab('support')}>
          <i className="fas fa-headset"></i> Support
        </button>
        <button className={`tab-btn ${activeTab === 'purchases' ? 'active' : ''}`} onClick={() => setActiveTab('purchases')}>
          <i className="fas fa-shopping-cart"></i> Purchases
        </button>
      </div>

      <div className="content-container">
        {renderActivePanel()}
      </div>
    </div>
  );
};

export default AdminPanel;