import React, { useState, useEffect } from 'react';
import BACKEND_URL from '../utils/BackendURL';
import '../styles/AdminNewsPanel.css';

const AdminNewsPanel = ({ setMessage, navigate }) => {
  const [news, setNews] = useState([]);
  const [showAddNews, setShowAddNews] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [newsForm, setNewsForm] = useState({
    heading: '',
    description: '',
    gameName: '',
    headingImage: null,
    detailImage: null
  });

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/news`, { credentials: 'include' });
      if (response.status === 401) { navigate('/login'); return; }
      const data = await response.json();
      if (response.ok) setNews(data.news);
    } catch (error) {
      console.error('Error fetching news:', error);
    }
  };

  const handleNewsFormChange = (e) => {
    const { name, value } = e.target;
    setNewsForm({ ...newsForm, [name]: value });
  };

  const handleNewsImageChange = (e, field) => {
    setNewsForm({ ...newsForm, [field]: e.target.files[0] });
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

      if (response.status === 401) { navigate('/login'); return; }

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

  const handleEditNews = (newsItem) => {
    setEditingNews(newsItem);
    setNewsForm({
      heading: newsItem.heading || '',
      description: newsItem.description || '',
      gameName: newsItem.gameName || '',
      headingImage: null,
      detailImage: null
    });
    setShowAddNews(true);
  };

  const handleDeleteNews = async (newsId) => {
    if (!window.confirm('Are you sure you want to delete this news?')) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/news/${newsId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.status === 401) { navigate('/login'); return; }
      if (response.ok) {
        setMessage({ type: 'success', text: 'News deleted!' });
        fetchNews();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete news' });
      console.error('Delete news error:', error);
    }
  };

  const filteredNews = news.filter(item => 
    item.heading.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.gameName && item.gameName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="content-container">
      <div className="action-bar">
        <button className="primary-btn" onClick={() => { setShowAddNews(!showAddNews); resetNewsForm(); }}>
          <i className={`fas fa-${showAddNews ? 'times' : 'plus'}`}></i>
          {showAddNews ? 'Cancel' : 'Add New News'}
        </button>
        <input 
          type="text" 
          className="search-input-admin" 
          placeholder="Search news..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
        />
      </div>

      {showAddNews && (
        <div className="form-container">
          <h2>{editingNews ? 'Edit News' : 'Add New News'}</h2>
          <form onSubmit={handleAddNews}>
            <fieldset>
              <legend><i className="fas fa-newspaper"></i> News Information</legend>
              <div className="form-row">
                <div className="form-group full-width">
                  <label>Heading *</label>
                  <input 
                    type="text" 
                    name="heading" 
                    className="form-input" 
                    value={newsForm.heading} 
                    onChange={handleNewsFormChange} 
                    required 
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group full-width">
                  <label>Description *</label>
                  <textarea 
                    name="description" 
                    className="form-textarea" 
                    value={newsForm.description} 
                    onChange={handleNewsFormChange} 
                    required 
                    rows="6" 
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Game Name (Optional)</label>
                  <input 
                    type="text" 
                    name="gameName" 
                    className="form-input" 
                    value={newsForm.gameName} 
                    onChange={handleNewsFormChange} 
                    placeholder="Enter related game name"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label><i className="fas fa-image"></i> Heading Image</label>
                  <input 
                    type="file" 
                    className="file-input" 
                    accept="image/*" 
                    onChange={(e) => handleNewsImageChange(e, 'headingImage')} 
                  />
                  {editingNews && editingNews.headingImage && (
                    <small className="file-info">Current: {editingNews.headingImage}</small>
                  )}
                </div>
                <div className="form-group">
                  <label><i className="fas fa-image"></i> Detail Image</label>
                  <input 
                    type="file" 
                    className="file-input" 
                    accept="image/*" 
                    onChange={(e) => handleNewsImageChange(e, 'detailImage')} 
                  />
                  {editingNews && editingNews.detailImage && (
                    <small className="file-info">Current: {editingNews.detailImage}</small>
                  )}
                </div>
              </div>
            </fieldset>

            <button type="submit" className="submit-btn" disabled={loading}>
              <i className={`fas fa-${loading ? 'spinner fa-spin' : editingNews ? 'save' : 'plus'}`}></i>
              {loading ? 'Saving...' : editingNews ? 'Update News' : 'Add News'}
            </button>
          </form>
        </div>
      )}

      <div className="news-list-section">
        <h2><i className="fas fa-list"></i> News List</h2>
        <div className="news-list-horizontal">
          {filteredNews.map(newsItem => (
            <div key={newsItem._id} className="news-card-horizontal">
              <div className="news-card-left">
                {newsItem.headingImage ? (
                  <img 
                    src={`${BACKEND_URL}/uploads/${newsItem.headingImage}`} 
                    alt={newsItem.heading} 
                    className="news-thumbnail" 
                  />
                ) : (
                  <div className="news-thumbnail-placeholder">
                    <i className="fas fa-newspaper"></i>
                  </div>
                )}
              </div>

              <div className="news-card-center">
                <h3>{newsItem.heading}</h3>
                {newsItem.gameName && (
                  <p className="news-game-name">
                    <i className="fas fa-gamepad"></i> {newsItem.gameName}
                  </p>
                )}
                <p className="news-description">
                  {newsItem.description.substring(0, 120)}...
                </p>
                <p className="news-date">
                  <i className="far fa-calendar"></i> 
                  {new Date(newsItem.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="news-card-right">
                <button className="edit-btn" onClick={() => handleEditNews(newsItem)}>
                  <i className="fas fa-edit"></i> Edit
                </button>
                <button className="delete-btn" onClick={() => handleDeleteNews(newsItem._id)}>
                  <i className="fas fa-trash"></i> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
        {filteredNews.length === 0 && (
          <div className="no-data">
            <i className="fas fa-newspaper"></i>
            <p>No news found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNewsPanel;