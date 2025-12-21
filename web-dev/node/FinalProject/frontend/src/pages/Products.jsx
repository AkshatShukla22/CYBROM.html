import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCartAsync, clearSuccessMessage } from '../redux/cartSlice';
import BACKEND_URL from '../utils/BackendURL';
import FilterSidebar from '../components/FilterSidebar';
import TopGamesCarousel from '../components/TopGamesCarousel';
import GameCard from '../components/GameCard';
import GameCardGrid from '../components/GameCardGrid';
import '../styles/Products.css';

const Products = () => {
  const dispatch = useDispatch();
  const cartLoading = useSelector(state => state.cart.loading);
  const [allGames, setAllGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [showToast, setShowToast] = useState(false);
  const [toastGameId, setToastGameId] = useState(null);
  const cardRefs = useRef([]);
  const [filters, setFilters] = useState({
    categories: [],
    consoles: [],
    ratings: [],
    minPrice: '',
    maxPrice: '',
    minDiscount: '',
    minRating: '',
    sortBy: 'newest'
  });

  const categories = ['All', 'Action', 'Adventure', 'RPG', 'Horror', 'Sports', 'Racing', 'Strategy', 'Simulation', 'Puzzle', 'Fighting', 'Shooter', 'Open World'];

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, activeCategory, allGames]);

  // ✨ OPTIMIZED: Smooth Scroll Animation with requestAnimationFrame
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          cardRefs.current.forEach((card) => {
            if (card) {
              const rect = card.getBoundingClientRect();
              const windowHeight = window.innerHeight;
              const cardCenter = rect.top + rect.height / 2;
              const viewportCenter = windowHeight / 2;
              
              const distanceFromCenter = Math.abs(cardCenter - viewportCenter);
              const maxDistance = windowHeight / 2;
              
              // Card is in viewport
              if (rect.top < windowHeight && rect.bottom > 0) {
                card.classList.add('scroll-visible');
                
                // Near center - subtle scale up
                if (distanceFromCenter < maxDistance * 0.25) {
                  card.classList.add('scroll-scale-up');
                  card.classList.remove('scroll-scale-down');
                } 
                // Far from center - subtle fade
                else if (distanceFromCenter > maxDistance * 0.7) {
                  card.classList.add('scroll-scale-down');
                  card.classList.remove('scroll-scale-up');
                }
                // Middle zone - normal
                else {
                  card.classList.remove('scroll-scale-up');
                  card.classList.remove('scroll-scale-down');
                }
              } else {
                card.classList.remove('scroll-visible');
                card.classList.remove('scroll-scale-up');
                card.classList.remove('scroll-scale-down');
              }
            }
          });
          ticking = false;
        });
        ticking = true;
      }
    };

    // Throttled scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial check after a small delay to ensure cards are rendered
    const initialCheck = setTimeout(handleScroll, 100);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(initialCheck);
    };
  }, [filteredGames]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const gamesRes = await fetch(`${BACKEND_URL}/api/users/games`);
      const gamesData = await gamesRes.json();
      setAllGames(gamesData.games);
      setFilteredGames(gamesData.games);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Apply all filters
  const applyFilters = () => {
    let filtered = [...allGames];

    // Category filter from tabs
    if (activeCategory !== 'All') {
      filtered = filtered.filter(game => 
        game.categories && 
        Array.isArray(game.categories) && 
        game.categories.includes(activeCategory)
      );
    }

    // Sidebar filters - Categories
    if (filters.categories.length > 0) {
      filtered = filtered.filter(game =>
        game.categories && 
        Array.isArray(game.categories) && 
        game.categories.some(cat => filters.categories.includes(cat))
      );
    }

    // Console/Platform filter
    if (filters.consoles.length > 0) {
      filtered = filtered.filter(game => {
        const platforms = game.availablePlatforms || game.consoles || [];
        return Array.isArray(platforms) && 
               platforms.some(platform => filters.consoles.includes(platform));
      });
    }

    // Age Ratings filter
    if (filters.ratings.length > 0) {
      filtered = filtered.filter(game => {
        const gameRatings = game.ratings || [];
        return Array.isArray(gameRatings) && 
               gameRatings.some(rating => filters.ratings.includes(rating));
      });
    }

    // Price range
    if (filters.minPrice !== '' && filters.minPrice !== null) {
      const minPrice = parseFloat(filters.minPrice);
      if (!isNaN(minPrice)) {
        filtered = filtered.filter(game => (parseFloat(game.price) || 0) >= minPrice);
      }
    }
    
    if (filters.maxPrice !== '' && filters.maxPrice !== null) {
      const maxPrice = parseFloat(filters.maxPrice);
      if (!isNaN(maxPrice)) {
        filtered = filtered.filter(game => (parseFloat(game.price) || 0) <= maxPrice);
      }
    }

    // Discount filter
    if (filters.minDiscount !== '' && filters.minDiscount !== null) {
      const minDiscount = parseFloat(filters.minDiscount);
      if (!isNaN(minDiscount)) {
        filtered = filtered.filter(game => (parseFloat(game.discount) || 0) >= minDiscount);
      }
    }

    // Rating filter
    if (filters.minRating !== '' && filters.minRating !== null) {
      const minRating = parseFloat(filters.minRating);
      if (!isNaN(minRating)) {
        filtered = filtered.filter(game => (parseFloat(game.averageRating) || 0) >= minRating);
      }
    }

    // Sorting
    const sortFunctions = {
      'price_asc': (a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0),
      'price_desc': (a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0),
      'rating': (a, b) => (parseFloat(b.averageRating) || 0) - (parseFloat(a.averageRating) || 0),
      'popularity': (a, b) => (parseInt(b.purchaseCount) || 0) - (parseInt(a.purchaseCount) || 0),
      'newest': (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
      'oldest': (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
      'discount': (a, b) => (parseFloat(b.discount) || 0) - (parseFloat(a.discount) || 0),
      'name_asc': (a, b) => (a.name || '').localeCompare(b.name || ''),
      'name_desc': (a, b) => (b.name || '').localeCompare(a.name || '')
    };

    const sortFunction = sortFunctions[filters.sortBy];
    if (sortFunction) {
      filtered.sort(sortFunction);
    }

    console.log(`✅ Filtered ${filtered.length} games from ${allGames.length} total`);
    setFilteredGames(filtered);
  };

  // ✨ DERIVE ALL SECTIONS FROM FILTERED GAMES DYNAMICALLY ✨
  const topRatedGames = useMemo(() => {
    return [...filteredGames]
      .sort((a, b) => (parseFloat(b.averageRating) || 0) - (parseFloat(a.averageRating) || 0))
      .slice(0, 10);
  }, [filteredGames]);

  const mostPurchasedGames = useMemo(() => {
    return [...filteredGames]
      .sort((a, b) => (parseInt(b.purchaseCount) || 0) - (parseInt(a.purchaseCount) || 0))
      .slice(0, 10);
  }, [filteredGames]);

  const discountedGames = useMemo(() => {
    return filteredGames
      .filter(game => (parseFloat(game.discount) || 0) > 0)
      .sort((a, b) => (parseFloat(b.discount) || 0) - (parseFloat(a.discount) || 0));
  }, [filteredGames]);

  const freeGames = useMemo(() => {
    return filteredGames.filter(game => (parseFloat(game.price) || 0) === 0);
  }, [filteredGames]);

  const newReleases = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return filteredGames
      .filter(game => new Date(game.createdAt) >= thirtyDaysAgo)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [filteredGames]);

  const randomGames = useMemo(() => {
    const shuffled = [...filteredGames].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 10);
  }, [filteredGames]);

  const handleFilterChange = (newFilters) => {
    console.log('🎯 Filter changed:', newFilters);
    setFilters(newFilters);
  };

  const resetFilters = () => {
    setFilters({
      categories: [],
      consoles: [],
      ratings: [],
      minPrice: '',
      maxPrice: '',
      minDiscount: '',
      minRating: '',
      sortBy: 'newest'
    });
    setActiveCategory('All');
  };

  const calculateDiscountedPrice = (price, discount) => {
    if (discount > 0) {
      return (price - (price * discount / 100)).toFixed(2);
    }
    return price;
  };

  const handleAddToCart = (e, gameId) => {
    e.stopPropagation();
    dispatch(addToCartAsync({ gameId }));
    setToastGameId(gameId);
    setShowToast(true);
    
    setTimeout(() => {
      setShowToast(false);
      setToastGameId(null);
      dispatch(clearSuccessMessage());
    }, 2000);
  };

  const handleGameClick = (gameId) => {
    window.location.href = `/game/${gameId}`;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <i className="fa-solid fa-spinner fa-spin"></i>
        <p>Loading games...</p>
      </div>
    );
  }

  return (
    <div className="products-page">
      {/* Filter Toggle Button */}
      <button 
        className="filter-toggle-btn" 
        onClick={() => setSidebarOpen(true)}
        aria-label="Open Filters"
      >
        <i className="fa-solid fa-filter"></i>
        Filters
      </button>

      {/* Filter Sidebar */}
      <FilterSidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={resetFilters}
      />

      {/* Main Content */}
      <div className={`products-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
        
        {/* Top Games Carousel - NOW SHOWS FILTERED GAMES */}
        {topRatedGames.length > 0 && (
          <section className="top-games-section">
            <h2 className="section-title">Top Rated Games</h2>
            <TopGamesCarousel games={topRatedGames} />
          </section>
        )}

        {/* Category Tabs */}
        <section className="category-tabs-section">
          <div className="category-tabs">
            {categories.map(cat => (
              <button
                key={cat}
                className={`category-tab ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* Special Sections - ALL NOW SHOW FILTERED GAMES */}
        {activeCategory === 'All' && (
          <>
            {/* Discounted Games Section */}
            {discountedGames.length > 0 && (
              <GameCardGrid 
                title="Special Offers - Discounted Games"
                games={discountedGames}
              />
            )}

            {/* Free Games Section */}
            {freeGames.length > 0 && (
              <GameCardGrid 
                title="Free to Play"
                games={freeGames}
              />
            )}

            {/* New Releases Section */}
            {newReleases.length > 0 && (
              <GameCardGrid 
                title="New Releases"
                games={newReleases}
              />
            )}

            {/* Most Purchased Section */}
            {mostPurchasedGames.length > 0 && (
              <GameCardGrid 
                title="Most Popular"
                games={mostPurchasedGames}
              />
            )}

            {/* Random Games Section */}
            {randomGames.length > 0 && (
              <GameCardGrid 
                title="You Might Also Like"
                games={randomGames}
              />
            )}
          </>
        )}

        {/* All Games / Filtered Games */}
        <section className="all-games-section">
          <div className="section-header">
            <h2 className="section-title">
              {activeCategory === 'All' ? 'All Games' : `${activeCategory} Games`}
            </h2>
            <span className="games-count">{filteredGames.length} games</span>
          </div>
          
          {filteredGames.length > 0 ? (
            <div className="games-grid">
              {filteredGames.map((game, index) => (
                <div 
                  key={game._id} 
                  ref={el => cardRefs.current[index] = el}
                  className="game-card-horizontal"
                  onClick={() => handleGameClick(game._id)}
                >
                  {/* Game Image */}
                  <div className="game-horizontal-image">
                    {game.coverImage ? (
                      <img 
                        src={`${BACKEND_URL}/uploads/${game.coverImage}`} 
                        alt={game.name}
                      />
                    ) : game.backgroundPic ? (
                      <img 
                        src={`${BACKEND_URL}/uploads/${game.backgroundPic}`} 
                        alt={game.name}
                      />
                    ) : (
                      <div className="image-placeholder-horizontal">
                        <i className="fa-solid fa-gamepad"></i>
                      </div>
                    )}
                  </div>

                  {/* Game Details */}
                  <div className="game-horizontal-details">
                    <div className="game-info-left">
                      <h3 className="game-horizontal-name">{game.name}</h3>
                      
                      <div className="game-horizontal-meta">
                        <div className="meta-item">
                          <i className="fa-solid fa-star"></i>
                          <span>{game.averageRating ? game.averageRating.toFixed(1) : '0.0'}</span>
                        </div>
                        <div className="meta-item">
                          <i className="fa-solid fa-users"></i>
                          <span>{game.purchaseCount || 0} purchases</span>
                        </div>
                      </div>
                    </div>

                    <div className="game-horizontal-price">
                      <div className="price-info">
                        {game.price === 0 ? (
                          <span className="free-label-horizontal">FREE TO PLAY</span>
                        ) : game.discount > 0 ? (
                          <>
                            <div className="discount-badge-horizontal">
                              -{game.discount}%
                            </div>
                            <div className="product-price-display">
                              <span className="original-price-horizontal">₹{game.price}</span>
                              <span className="final-price-horizontal">
                                ₹{calculateDiscountedPrice(game.price, game.discount)}
                              </span>
                            </div>
                          </>
                        ) : (
                          <span className="regular-price-horizontal">₹{game.price}</span>
                        )}
                      </div>

                      <button 
                        className="add-to-cart-btn-horizontal"
                        onClick={(e) => handleAddToCart(e, game._id)}
                        disabled={cartLoading}
                      >
                        {cartLoading && toastGameId === game._id ? (
                          <>
                            <i className="fa-solid fa-spinner fa-spin"></i>
                            Adding...
                          </>
                        ) : game.price === 0 ? (
                          <>
                            <i className="fa-solid fa-play"></i>
                            Play Now
                          </>
                        ) : (
                          <>
                            <i className="fa-solid fa-cart-shopping"></i>
                            Add to Cart
                          </>
                        )}
                      </button>

                      {showToast && toastGameId === game._id && (
                        <div className="toast-notification-horizontal">
                          <i className="fa-solid fa-check"></i>
                          Added to cart!
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-games-message">
              <i className="fa-solid fa-circle-exclamation"></i>
              <p>No games found matching your filters.</p>
              <button className="reset-filters-btn" onClick={resetFilters}>
                <i className="fa-solid fa-rotate-left"></i>
                Reset Filters
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Products;