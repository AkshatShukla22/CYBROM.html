import React, { useState, useEffect, useRef } from 'react';
import BACKEND_URL from '../utils/BackendURL';
import FilterSidebar from '../components/FilterSidebar';
import TopGamesCarousel from '../components/TopGamesCarousel';
import GameCard from '../components/GameCard';
import GameCardGrid from '../components/GameCardGrid';
import '../styles/Products.css';

const Products = () => {
  const [allGames, setAllGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [topRatedGames, setTopRatedGames] = useState([]);
  const [mostPurchasedGames, setMostPurchasedGames] = useState([]);
  const [discountedGames, setDiscountedGames] = useState([]);
  const [freeGames, setFreeGames] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [randomGames, setRandomGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [scrollDirection, setScrollDirection] = useState('down');
  const lastScrollY = useRef(0);
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

  // Scroll Animation Effect
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Determine scroll direction
      if (currentScrollY > lastScrollY.current) {
        setScrollDirection('down');
      } else {
        setScrollDirection('up');
      }
      lastScrollY.current = currentScrollY;

      // Animate cards based on viewport position
      cardRefs.current.forEach((card, index) => {
        if (card) {
          const rect = card.getBoundingClientRect();
          const windowHeight = window.innerHeight;
          const cardCenter = rect.top + rect.height / 2;
          const viewportCenter = windowHeight / 2;
          
          // Calculate distance from viewport center
          const distanceFromCenter = Math.abs(cardCenter - viewportCenter);
          const maxDistance = windowHeight / 2;
          
          // Card is visible in viewport
          if (rect.top < windowHeight && rect.bottom > 0) {
            card.classList.add('scroll-visible');
            
            // Card is near center of viewport - scale up
            if (distanceFromCenter < maxDistance * 0.3) {
              card.classList.add('scroll-scale-up');
              card.classList.remove('scroll-scale-down');
            } 
            // Card is far from center - scale down
            else if (distanceFromCenter > maxDistance * 0.6) {
              card.classList.add('scroll-scale-down');
              card.classList.remove('scroll-scale-up');
            }
            // Card is in middle zone - normal size
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
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, [filteredGames]);

  const getRandomGames = (games, count = 10) => {
    const shuffled = [...games].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch all games
      const gamesRes = await fetch(`${BACKEND_URL}/api/user/games`);
      const gamesData = await gamesRes.json();
      setAllGames(gamesData.games);
      setFilteredGames(gamesData.games);
      
      // Set random games
      setRandomGames(getRandomGames(gamesData.games, 10));

      // Fetch top rated
      const topRatedRes = await fetch(`${BACKEND_URL}/api/user/games/top-rated?limit=10`);
      const topRatedData = await topRatedRes.json();
      setTopRatedGames(topRatedData.games);

      // Fetch most purchased
      const mostPurchasedRes = await fetch(`${BACKEND_URL}/api/user/games/most-purchased?limit=10`);
      const mostPurchasedData = await mostPurchasedRes.json();
      setMostPurchasedGames(mostPurchasedData.games);

      // Fetch discounted
      const discountedRes = await fetch(`${BACKEND_URL}/api/user/games/discounted`);
      const discountedData = await discountedRes.json();
      setDiscountedGames(discountedData.games);

      // Fetch free games
      const freeRes = await fetch(`${BACKEND_URL}/api/user/games/free`);
      const freeData = await freeRes.json();
      setFreeGames(freeData.games);

      // Fetch new releases
      const newReleasesRes = await fetch(`${BACKEND_URL}/api/user/games/new-releases`);
      const newReleasesData = await newReleasesRes.json();
      setNewReleases(newReleasesData.games);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allGames];

    // Category filter
    if (activeCategory !== 'All') {
      filtered = filtered.filter(game => 
        game.categories && game.categories.includes(activeCategory)
      );
    }

    // Apply sidebar filters
    if (filters.categories.length > 0) {
      filtered = filtered.filter(game =>
        game.categories && game.categories.some(cat => filters.categories.includes(cat))
      );
    }

    if (filters.consoles.length > 0) {
      filtered = filtered.filter(game =>
        game.consoles && game.consoles.some(con => filters.consoles.includes(con))
      );
    }

    if (filters.ratings.length > 0) {
      filtered = filtered.filter(game =>
        game.ratings && game.ratings.some(rat => filters.ratings.includes(rat))
      );
    }

    // Price range
    if (filters.minPrice !== '') {
      filtered = filtered.filter(game => game.price >= parseFloat(filters.minPrice));
    }
    if (filters.maxPrice !== '') {
      filtered = filtered.filter(game => game.price <= parseFloat(filters.maxPrice));
    }

    // Discount filter
    if (filters.minDiscount !== '') {
      filtered = filtered.filter(game => game.discount >= parseFloat(filters.minDiscount));
    }

    // Rating filter
    if (filters.minRating !== '') {
      filtered = filtered.filter(game => game.averageRating >= parseFloat(filters.minRating));
    }

    // Sorting
    if (filters.sortBy === 'price_asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (filters.sortBy === 'price_desc') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (filters.sortBy === 'rating') {
      filtered.sort((a, b) => b.averageRating - a.averageRating);
    } else if (filters.sortBy === 'popularity') {
      filtered.sort((a, b) => b.purchaseCount - a.purchaseCount);
    } else if (filters.sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (filters.sortBy === 'discount') {
      filtered.sort((a, b) => b.discount - a.discount);
    }

    setFilteredGames(filtered);
  };

  const handleFilterChange = (newFilters) => {
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

  const handleAddToCart = (gameId) => {
    console.log('Add to cart:', gameId);
    // Add your cart logic here
  };

  const handleGameClick = (gameId) => {
    window.location.href = `/game/${gameId}`;
  };

  if (loading) {
    return <div className="loading-container">Loading games...</div>;
  }

  return (
    <div className="products-page">
      {/* ========== FILTER TOGGLE BUTTON - ADD THIS ========== */}
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
        
        {/* Top Games Carousel */}
        <section className="top-games-section">
          <h2 className="section-title">Top Games</h2>
          <TopGamesCarousel games={topRatedGames} />
        </section>

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

        {/* Special Sections */}
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

        {/* All Games / Filtered Games - Horizontal Layout */}
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
                  {/* Game Image - Left Side (Vertical Card) */}
                  <div className="game-horizontal-image">
                    {game.gamePic ? (
                      <img 
                        src={`${BACKEND_URL}/uploads/${game.gamePic}`} 
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

                  {/* Game Details - Single Horizontal Section */}
                  <div className="game-horizontal-details">
                    {/* Left Section - Name, Rating, Purchases */}
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

                    {/* Right Section - Price and Cart */}
                    <div className="game-horizontal-price">
                      {/* Price Info */}
                      <div className="price-info">
                        {game.price === 0 ? (
                          <span className="free-label-horizontal">FREE TO PLAY</span>
                        ) : game.discount > 0 ? (
                          <>
                            <div className="discount-badge-horizontal">
                              -{game.discount}%
                            </div>
                            <div className="price-display">
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

                      {/* Add to Cart Button */}
                      <button 
                        className="add-to-cart-btn-horizontal"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(game._id);
                        }}
                      >
                        <i className="fa-solid fa-cart-shopping"></i>
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-games-message">
              <p>No games found matching your filters.</p>
              <button className="reset-filters-btn" onClick={resetFilters}>
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