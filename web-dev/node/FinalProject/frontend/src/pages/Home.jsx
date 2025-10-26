import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BACKEND_URL from '../utils/BackendURL';
import '../styles/home.css';

const Home = () => {
  const navigate = useNavigate();
  const [featuredGames, setFeaturedGames] = useState([]);
  const [trendingGames, setTrendingGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  const bannerSlides = [
    {
      id: 1,
      title: "Discover Your Next Adventure",
      subtitle: "Explore thousands of games across all platforms",
      image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1200&q=80",
      cta: "Browse Games",
      link: "/products"
    },
    {
      id: 2,
      title: "Exclusive Deals Await",
      subtitle: "Get up to 70% off on selected titles",
      image: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=1200&q=80",
      cta: "View Deals",
      link: "/products"
    },
    {
      id: 3,
      title: "Join the Gaming Community",
      subtitle: "Connect with millions of gamers worldwide",
      image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&q=80",
      cta: "Get Started",
      link: "/register"
    }
  ];

  useEffect(() => {
    fetchGames();
    
    const interval = setInterval(() => {
      setCurrentBannerIndex((prevIndex) => 
        prevIndex === bannerSlides.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchGames = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/games`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFeaturedGames(data.games?.slice(0, 6) || []);
        setTrendingGames(data.games?.slice(6, 12) || []);
      }
    } catch (err) {
      console.error('Error fetching games:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBannerNav = (index) => {
    setCurrentBannerIndex(index);
  };

  const categories = [
    { name: 'Action', icon: 'fa-gun', color: '#e74c3c' },
    { name: 'Adventure', icon: 'fa-map', color: '#f39c12' },
    { name: 'RPG', icon: 'fa-dragon', color: '#9b59b6' },
    { name: 'Strategy', icon: 'fa-chess', color: '#3498db' },
    { name: 'Sports', icon: 'fa-football-ball', color: '#2ecc71' },
    { name: 'Racing', icon: 'fa-car', color: '#e67e22' }
  ];

  const features = [
    {
      icon: 'fa-shield-alt',
      title: 'Secure Payments',
      description: 'Safe and encrypted transactions'
    },
    {
      icon: 'fa-download',
      title: 'Instant Access',
      description: 'Download and play immediately'
    },
    {
      icon: 'fa-headset',
      title: '24/7 Support',
      description: 'Always here to help you'
    },
    {
      icon: 'fa-tags',
      title: 'Best Prices',
      description: 'Competitive pricing guaranteed'
    }
  ];

  return (
    <div className="hm-home-page">
      {/* Hero Banner */}
      <section className="hm-hero-banner">
        <div className="hm-banner-slider">
          {bannerSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`hm-banner-slide ${index === currentBannerIndex ? 'hm-active' : ''}`}
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="hm-banner-overlay"></div>
              <div className="hm-banner-content">
                <h1 className="hm-banner-title">{slide.title}</h1>
                <p className="hm-banner-subtitle">{slide.subtitle}</p>
                <button 
                  className="hm-banner-cta"
                  onClick={() => navigate(slide.link)}
                >
                  {slide.cta}
                  <i className="fas fa-arrow-right"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Banner Navigation */}
        <div className="hm-banner-nav">
          {bannerSlides.map((_, index) => (
            <button
              key={index}
              className={`hm-banner-dot ${index === currentBannerIndex ? 'hm-active' : ''}`}
              onClick={() => handleBannerNav(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="hm-categories-section">
        <div className="hm-container">
          <h2 className="hm-section-title">
            <i className="fas fa-th-large"></i>
            Browse by Category
          </h2>
          <div className="hm-categories-grid">
            {categories.map((category, index) => (
              <div
                key={index}
                className="hm-category-card"
                onClick={() => navigate(`/products?category=${category.name}`)}
                style={{ '--category-color': category.color }}
              >
                <div className="hm-category-icon">
                  <i className={`fas ${category.icon}`}></i>
                </div>
                <h3 className="hm-category-name">{category.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Games Section */}
      <section className="hm-featured-section">
        <div className="hm-container">
          <div className="hm-section-header">
            <h2 className="hm-section-title">
              <i className="fas fa-star"></i>
              Featured Games
            </h2>
            <button 
              className="hm-view-all-btn"
              onClick={() => navigate('/products')}
            >
              View All
              <i className="fas fa-arrow-right"></i>
            </button>
          </div>

          {loading ? (
            <div className="hm-loading-container">
              <div className="hm-loading-spinner"></div>
              <p>Loading games...</p>
            </div>
          ) : (
            <div className="hm-games-grid">
              {featuredGames.map((game) => (
                <div
                  key={game._id}
                  className="hm-game-card"
                  onClick={() => navigate(`/game/${game._id}`)}
                >
                  <div className="hm-game-image">
                    {game.imageUrl ? (
                      <img src={game.imageUrl} alt={game.name} />
                    ) : (
                      <div className="hm-image-placeholder">
                        <i className="fas fa-gamepad"></i>
                      </div>
                    )}
                    {game.discount && (
                      <div className="hm-discount-badge">-{game.discount}%</div>
                    )}
                  </div>
                  <div className="hm-game-content">
                    <h3 className="hm-game-title">{game.name}</h3>
                    <div className="hm-game-meta">
                      <span className="hm-game-genre">
                        <i className="fas fa-tag"></i>
                        {game.genre?.[0] || 'Game'}
                      </span>
                    </div>
                    <div className="hm-game-footer">
                      <div className="hm-game-price">
                        {game.discount ? (
                          <>
                            <span className="hm-original-price">₹{game.price}</span>
                            <span className="hm-discounted-price">
                              ₹{(game.price * (1 - game.discount / 100)).toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <span className="hm-current-price">₹{game.price}</span>
                        )}
                      </div>
                      <button className="hm-game-btn">
                        <i className="fas fa-shopping-cart"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trending Games Section */}
      <section className="hm-trending-section">
        <div className="hm-container">
          <div className="hm-section-header">
            <h2 className="hm-section-title">
              <i className="fas fa-fire"></i>
              Trending Now
            </h2>
            <button 
              className="hm-view-all-btn"
              onClick={() => navigate('/products')}
            >
              View All
              <i className="fas fa-arrow-right"></i>
            </button>
          </div>

          {!loading && (
            <div className="hm-games-grid">
              {trendingGames.map((game) => (
                <div
                  key={game._id}
                  className="hm-game-card"
                  onClick={() => navigate(`/game/${game._id}`)}
                >
                  <div className="hm-game-image">
                    {game.imageUrl ? (
                      <img src={game.imageUrl} alt={game.name} />
                    ) : (
                      <div className="hm-image-placeholder">
                        <i className="fas fa-gamepad"></i>
                      </div>
                    )}
                    {game.discount && (
                      <div className="hm-discount-badge">-{game.discount}%</div>
                    )}
                  </div>
                  <div className="hm-game-content">
                    <h3 className="hm-game-title">{game.name}</h3>
                    <div className="hm-game-meta">
                      <span className="hm-game-genre">
                        <i className="fas fa-tag"></i>
                        {game.genre?.[0] || 'Game'}
                      </span>
                    </div>
                    <div className="hm-game-footer">
                      <div className="hm-game-price">
                        {game.discount ? (
                          <>
                            <span className="hm-original-price">₹{game.price}</span>
                            <span className="hm-discounted-price">
                              ₹{(game.price * (1 - game.discount / 100)).toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <span className="hm-current-price">₹{game.price}</span>
                        )}
                      </div>
                      <button className="hm-game-btn">
                        <i className="fas fa-shopping-cart"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="hm-features-section">
        <div className="hm-container">
          <h2 className="hm-section-title">
            <i className="fas fa-gem"></i>
            Why Choose Us
          </h2>
          <div className="hm-features-grid">
            {features.map((feature, index) => (
              <div key={index} className="hm-feature-card">
                <div className="hm-feature-icon">
                  <i className={`fas ${feature.icon}`}></i>
                </div>
                <h3 className="hm-feature-title">{feature.title}</h3>
                <p className="hm-feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="hm-cta-section">
        <div className="hm-container">
          <div className="hm-cta-content">
            <h2 className="hm-cta-title">Ready to Start Gaming?</h2>
            <p className="hm-cta-subtitle">Join thousands of gamers and explore our vast collection</p>
            <div className="hm-cta-buttons">
              <button 
                className="hm-cta-btn hm-primary"
                onClick={() => navigate('/products')}
              >
                <i className="fas fa-gamepad"></i>
                Browse Games
              </button>
              <button 
                className="hm-cta-btn hm-secondary"
                onClick={() => navigate('/register')}
              >
                <i className="fas fa-user-plus"></i>
                Create Account
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;