import React, { useState, useEffect } from 'react';
import BACKEND_URL from '../utils/BackendURL';
import '../styles/NewsPage.css';

const NewsPage = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/news`);
      const data = await response.json();
      
      if (response.ok) {
        setNews(data.news);
      } else {
        setError('Failed to load news');
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      setError('Network error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filteredNews = news.filter(n =>
    n.heading.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (n.gameName && n.gameName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="rh-news-page">
        <div className="rh-news-loading-spinner">Loading news...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rh-news-page">
        <div className="rh-news-error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="rh-news-page">
      <div className="rh-news-header">
        <h1>Latest Gaming News</h1>
        <p>Stay updated with the latest news from Respawn Hub</p>
        <input
          type="text"
          className="rh-news-search-input"
          placeholder="Search by heading or game name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="rh-news-container">
        {filteredNews.length === 0 ? (
          <div className="rh-news-no-news">
            <p>No news found matching your search.</p>
          </div>
        ) : (
          filteredNews.map((newsItem, index) => (
            <details key={newsItem._id} className="rh-news-item" style={{'--index': index}}>
              <summary className="rh-news-summary">
                <div className="rh-news-summary-content">
                  {newsItem.headingImage && (
                    <img 
                      src={`${BACKEND_URL}/uploads/${newsItem.headingImage}`} 
                      alt={newsItem.heading}
                      className="rh-news-thumbnail"
                    />
                  )}
                  <div className="rh-news-summary-text">
                    <h2>{newsItem.heading}</h2>
                    {newsItem.gameName && (
                      <span className="rh-news-game-badge">🎮 {newsItem.gameName}</span>
                    )}
                    <span className="rh-news-date">
                      {new Date(newsItem.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
                <span className="rh-news-expand-icon">▼</span>
              </summary>
              
              <div className="rh-news-details">
                {newsItem.detailImage && (
                  <img 
                    src={`${BACKEND_URL}/uploads/${newsItem.detailImage}`} 
                    alt={newsItem.heading}
                    className="rh-news-full-image"
                  />
                )}
                <div className="rh-news-description">
                  <p>{newsItem.description}</p>
                </div>
              </div>
            </details>
          ))
        )}
      </div>
    </div>
  );
};

export default NewsPage;