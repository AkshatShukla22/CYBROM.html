import React, { useState, useEffect } from 'react';
import BACKEND_URL from '../utils/BackendURL';
import '../styles/NewsPage.css';

const NewsPage = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  if (loading) {
    return (
      <div className="news-page">
        <div className="loading-spinner">Loading news...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="news-page">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="news-page">
      <div className="news-header">
        <h1>Latest Gaming News</h1>
        <p>Stay updated with the latest news from Respawn Hub</p>
      </div>

      <div className="news-container">
        {news.length === 0 ? (
          <div className="no-news">
            <p>No news available at the moment. Check back soon!</p>
          </div>
        ) : (
          news.map((newsItem) => (
            <details key={newsItem._id} className="news-item">
              <summary className="news-summary">
                <div className="news-summary-content">
                  {newsItem.image && (
                    <img 
                      src={`${BACKEND_URL}/uploads/${newsItem.image}`} 
                      alt={newsItem.heading}
                      className="news-thumbnail"
                    />
                  )}
                  <div className="news-summary-text">
                    <h2>{newsItem.heading}</h2>
                    <span className="news-date">
                      {new Date(newsItem.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
                <span className="expand-icon">▼</span>
              </summary>
              
              <div className="news-details">
                {newsItem.image && (
                  <img 
                    src={`${BACKEND_URL}/uploads/${newsItem.image}`} 
                    alt={newsItem.heading}
                    className="news-full-image"
                  />
                )}
                <div className="news-description">
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