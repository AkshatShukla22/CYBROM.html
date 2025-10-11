import React, { useState, useEffect } from 'react';
import BACKEND_URL from '../utils/BackendURL';
import FilterSidebar from '../components/FilterSidebar';
import TopGamesCarousel from '../components/TopGamesCarousel';
import GameCard from '../components/GameCard';
import GameCardGrid from '../components/GameCardGrid';
// import '../styles/Products.css';

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

  if (loading) {
    return <div className="loading-container">Loading games...</div>;
  }

  return (
    <div className="products-page">
      {/* Filter Toggle Button */}
      <button 
        className="filter-toggle-btn"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <i className="fa-solid fa-filter"></i> Filters
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

        {/* All Games / Filtered Games Grid */}
        <section className="all-games-section">
          <div className="section-header">
            <h2 className="section-title">
              {activeCategory === 'All' ? 'All Games' : `${activeCategory} Games`}
            </h2>
            <span className="games-count">{filteredGames.length} games</span>
          </div>
          
          {filteredGames.length > 0 ? (
            <div className="games-grid">
              {filteredGames.map(game => (
                <GameCard key={game._id} game={game} />
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