// index.js
// Global variables to store data
let animeData = [];
let userData = null;
let isLoggedIn = false;
let notifications = [];

// DOM Elements
var searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const notificationBtn = document.getElementById('notificationBtn');
const notificationPanel = document.getElementById('notificationPanel');
const notificationList = document.getElementById('notificationList');
const notificationCount = document.querySelector('.notification-count');
const userBtn = document.getElementById('userBtn');
const loginBtn = document.getElementById('loginBtn');
const trendingGrid = document.getElementById('trendingGrid');
const actionGrid = document.getElementById('actionGrid');
const adventureGrid = document.getElementById('adventureGrid');
const comedyGrid = document.getElementById('comedyGrid');
const loadMoreButtons = document.querySelectorAll('.load-more');

// url
let animeUrl = "http://localhost:3000/anime";
let usersUrl = "http://localhost:3000/users";

// Pagination settings for each section
const paginationState = {
    trending: { page: 1, limit: 10, total: 0 },
    action: { page: 1, limit: 10, total: 0 },
    adventure: { page: 1, limit: 10, total: 0 },
    comedy: { page: 1, limit: 10, total: 0 }
};

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
    await fetchData();
    checkUserAuthentication();
    setupEventListeners();
    initializeHeroSlider();
    loadAnimeSections();
}

// Fetch data from db.json
async function fetchData() {
    try {
        const response = await fetch('./db.json');
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        animeData = data.anime || [];
        
        // Count the total number of anime for each category for pagination
        paginationState.trending.total = animeData.length;
        paginationState.action.total = animeData.filter(anime => anime.genera && anime.genera.includes('action')).length;
        paginationState.adventure.total = animeData.filter(anime => anime.genera && anime.genera.includes('adventure')).length;
        paginationState.comedy.total = animeData.filter(anime => anime.genera && anime.genera.includes('comedy')).length;
        
        console.log('Data loaded successfully:', animeData.length, 'anime found');
    } catch (error) {
        console.error('Error fetching data:', error);
        // Fallback to sample data for development
        loadSampleData();
    }
}

// Load sample data if fetch fails (for development)
function loadSampleData() {
    console.warn('Using sample data due to fetch error');
    animeData = [
        {
            id: 1,
            name: "Demon Slayer",
            description: "A young boy named Tanjiro Kamado becomes a demon slayer after his family is slaughtered and his sister Nezuko is turned into a demon.",
            genera: ["action", "adventure", "fantasy"],
            rating: 4.8,
            image: "./assets/anime/demon_slayer.jpg",
            episodes: [
                { number: 1, title: "Cruelty", src: "./assets/videos/demo.mp4" },
                { number: 2, title: "Trainer Sakonji Urokodaki", src: "./assets/videos/demo.mp4" },
                { number: 3, title: "Sabito and Makomo", src: "./assets/videos/demo.mp4" }
            ]
        },
        {
            id: 2,
            name: "Attack on Titan",
            description: "In a world where humanity lives within cities surrounded by enormous walls that protect them from giant man-eating humanoids, a young boy vows to destroy them all.",
            genera: ["action", "drama", "fantasy"],
            rating: 4.9,
            image: "./assets/anime/attack_on_titan.jpg",
            episodes: [
                { number: 1, title: "To You, 2000 Years Later", src: "./assets/videos/demo.mp4" },
                { number: 2, title: "That Day", src: "./assets/videos/demo.mp4" },
                { number: 3, title: "A Dim Light Amid Despair", src: "./assets/videos/demo.mp4" }
            ]
        },
        // The rest of the sample data would be here
    ];
    
    // Set pagination totals
    paginationState.trending.total = animeData.length;
    paginationState.action.total = animeData.filter(anime => anime.genera && anime.genera.includes('action')).length;
    paginationState.adventure.total = animeData.filter(anime => anime.genera && anime.genera.includes('adventure')).length;
    paginationState.comedy.total = animeData.filter(anime => anime.genera && anime.genera.includes('comedy')).length;
}

// Check if user is logged in
function checkUserAuthentication() {
    // Use the common utility function to check login status
    userData = common.checkUserLogin();
    isLoggedIn = userData !== null;
    
    // Update UI based on login status
    updateLoginButtons();
    
    // Check for notifications if logged in
    if (isLoggedIn) {
        fetchNotifications();
    } else {
        // Hide notification count if not logged in
        notificationCount.style.display = 'none';
    }
}

// Update login/user button visibility
function updateLoginButtons() {
    if (isLoggedIn) {
        userBtn.style.display = 'flex';
        loginBtn.style.display = 'none';
    } else {
        userBtn.style.display = 'none';
        loginBtn.style.display = 'flex';
    }
}

// Check login state - now calls the main authentication function
function checkLoginState() {
    // Simply call our main authentication check function
    checkUserAuthentication();
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    searchInput.addEventListener('input', handleSearch);
    searchInput.addEventListener('focus', () => {
        if (searchInput.value.trim().length >= 2) {
            searchResults.classList.add('active');
        }
    });
    
    // Notification panel toggle
    notificationBtn.addEventListener('click', toggleNotificationPanel);
    
    // User button click to go to profile page
    userBtn.addEventListener('click', () => {
        window.location.href = './user.html';
    });
    
    // Login button click to go to auth page
    loginBtn.addEventListener('click', () => {
        window.location.href = './auth.html';
    });
    
    // Load more buttons
    loadMoreButtons.forEach(button => {
        button.addEventListener('click', () => {
            const section = button.getAttribute('data-section');
            loadMoreAnime(section);
        });
    });
    
    // Close notification panel when clicking outside
    document.addEventListener('click', (e) => {
        if (!notificationBtn.contains(e.target) && !notificationPanel.contains(e.target)) {
            notificationPanel.classList.remove('active');
        }
    });
    
    // Close search results when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.classList.remove('active');
        }
    });
}

// Enhanced Hero Slider Implementation
function initializeHeroSlider() {
    // Clear existing slider content
    heroSlider.innerHTML = '';
    
    // Get top 10 anime for the slider based on rating
    const topAnime = [...animeData]
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 10);
    
    // Create slider slides
    topAnime.forEach(anime => {
        const slide = document.createElement('div');
        slide.className = 'swiper-slide';
        
        slide.innerHTML = `
            <div class="slide-background" style="background-image: url('${anime.banner_image}')"></div>
            <div class="slide-overlay">
                <div class="slide-content">
                    <h2>${anime.name}</h2>
                    <div class="rating">
                        <div class="stars">
                            ${getStarRating(anime.rating)}
                        </div>
                        <span>${anime.rating.toFixed(1)}/5.0</span>
                    </div>
                    <div class="genres">
                        ${anime.genera ? anime.genera.map(genre => `<span class="genre-tag">${genre}</span>`).join('') : ''}
                    </div>
                    <p>${anime.description.length > 150 ? anime.description.substring(0, 150) + '...' : anime.description}</p>
                    <div class="slide-buttons">
                        <a href="anime_info.html?id=${anime.id}" class="btn watch-btn">
                            <i class="fas fa-play-circle"></i> Watch Now
                        </a>
                        <button class="btn add-btn" onclick="toggleWatchlist(${anime.id}, this)">
                            ${isInWatchlist(anime.id) ? 
                                '<i class="fas fa-bookmark"></i> In Watchlist' : 
                                '<i class="far fa-bookmark"></i> Add to List'}
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        heroSlider.appendChild(slide);
    });
    
    // Initialize Swiper with enhanced options
    const swiper = new Swiper('.swiper', {
        loop: true,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
            dynamicBullets: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        effect: 'fade',
        fadeEffect: {
            crossFade: true
        },
        speed: 800,
        on: {
            slideChangeTransitionStart: function() {
                // Add animation to slide content
                const activeContent = document.querySelector('.swiper-slide-active .slide-content');
                if (activeContent) {
                    activeContent.style.animation = 'none';
                    setTimeout(() => {
                        activeContent.style.animation = 'fadeInRight 1s ease forwards';
                    }, 10);
                }
            }
        }
    });
}

// Enhanced Anime Sections Implementation
function loadAnimeSections() {
    // Clear all grids first
    trendingGrid.innerHTML = '';
    actionGrid.innerHTML = '';
    adventureGrid.innerHTML = '';
    comedyGrid.innerHTML = '';
    
    // Load each section with animation delay between sections
    setTimeout(() => loadTrendingAnime(), 100);
    setTimeout(() => loadActionAnime(), 300);
    setTimeout(() => loadAdventureAnime(), 500);
    setTimeout(() => loadComedyAnime(), 700);
    
    // Check if we should hide any "Load More" buttons
    setTimeout(() => checkLoadMoreButtonsVisibility(), 800);
}

// Enhanced Trending Anime Implementation
function loadTrendingAnime() {
    const { page, limit } = paginationState.trending;
    const startIndex = 0;
    const endIndex = page * limit;
    
    // Get top rated anime
    const trending = [...animeData]
        .sort((a, b) => b.rating - a.rating)
        .slice(startIndex, endIndex);
    
    // Render anime cards with enhanced display
    renderAnimeCards(trending, trendingGrid);
    
    // Update the section header to show count
    const sectionHeader = document.querySelector('#trendingSection .section-header h2');
    if (sectionHeader) {
        sectionHeader.innerHTML = `Trending Now <span class="anime-count">(${trending.length}/${paginationState.trending.total})</span>`;
    }
}

// Enhanced Action Anime Implementation
function loadActionAnime() {
    const { page, limit } = paginationState.action;
    const startIndex = 0;
    const endIndex = page * limit;
    
    // Get action anime with better filtering
    const actionAnime = animeData
        .filter(anime => anime.genera && anime.genera.includes('action'))
        .sort((a, b) => b.rating - a.rating) // Sort by rating
        .slice(startIndex, endIndex);
    
    // Render anime cards
    renderAnimeCards(actionAnime, actionGrid);
    
    // Update the section header to show count
    const sectionHeader = document.querySelector('#actionSection .section-header h2');
    if (sectionHeader) {
        sectionHeader.innerHTML = `Action Anime <span class="anime-count">(${actionAnime.length}/${paginationState.action.total})</span>`;
    }
}

// Enhanced Adventure Anime Implementation
function loadAdventureAnime() {
    const { page, limit } = paginationState.adventure;
    const startIndex = 0;
    const endIndex = page * limit;
    
    // Get adventure anime with better filtering
    const adventureAnime = animeData
        .filter(anime => anime.genera && anime.genera.includes('adventure'))
        .sort((a, b) => b.rating - a.rating) // Sort by rating
        .slice(startIndex, endIndex);
    
    // Render anime cards
    renderAnimeCards(adventureAnime, adventureGrid);
    
    // Update the section header to show count
    const sectionHeader = document.querySelector('#adventureSection .section-header h2');
    if (sectionHeader) {
        sectionHeader.innerHTML = `Adventure Anime <span class="anime-count">(${adventureAnime.length}/${paginationState.adventure.total})</span>`;
    }
}

// Enhanced Comedy Anime Implementation
function loadComedyAnime() {
    const { page, limit } = paginationState.comedy;
    const startIndex = 0;
    const endIndex = page * limit;
    
    // Get comedy anime with better filtering
    const comedyAnime = animeData
        .filter(anime => anime.genera && anime.genera.includes('comedy'))
        .sort((a, b) => b.rating - a.rating) // Sort by rating
        .slice(startIndex, endIndex);
    
    // Render anime cards
    renderAnimeCards(comedyAnime, comedyGrid);
    
    // Update the section header to show count
    const sectionHeader = document.querySelector('#comedySection .section-header h2');
    if (sectionHeader) {
        sectionHeader.innerHTML = `Comedy Anime <span class="anime-count">(${comedyAnime.length}/${paginationState.comedy.total})</span>`;
    }
}

// Enhanced Anime Card Rendering
function renderAnimeCards(animeList, container) {
    if (animeList.length === 0) {
        container.innerHTML = '<p class="no-anime">No anime found in this category</p>';
        return;
    }
    
    animeList.forEach((anime, index) => {
        const card = document.createElement('div');
        card.className = 'anime-card';
        
        // Add animation delay based on index
        card.style.animation = `fadeInUp 0.5s ease forwards ${index * 0.05}s`;
        card.style.opacity = '0';
        
        card.innerHTML = `
            <div class="anime-card-image">
                <img src="${anime.image}" alt="${anime.name}">
                <div class="episode-count">${anime.episodes ? anime.episodes.length : 0} eps</div>
            </div>
            <div class="anime-card-overlay">
                <h3>${anime.name}</h3>
                <div class="genres">
                    ${anime.genera ? anime.genera.map(genre => 
                        `<span class="genre-pill">${genre}</span>`
                    ).join('') : ''}
                </div>
                <div class="rating">
                    <i class="fas fa-star"></i>
                    <span>${anime.rating.toFixed(1)}</span>
                </div>
                <div class="anime-card-buttons">
                    <button class="watch-now" onclick="window.location.href='anime_info.html?id=${anime.id}'">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="add-to-list" onclick="event.stopPropagation(); toggleWatchlist(${anime.id}, this)">
                        <i class="${isInWatchlist(anime.id) ? 'fas' : 'far'} fa-bookmark"></i>
                    </button>
                </div>
            </div>
        `;
        
        // Add click event to redirect to anime info page
        card.addEventListener('click', () => {
            window.location.href = `anime_info.html?id=${anime.id}`;
        });
        
        container.appendChild(card);
    });
    
    // Add enhanced animations to CSS if not already present
    if (!document.querySelector('#animationStyles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'animationStyles';
        styleSheet.innerHTML = `
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @keyframes fadeInRight {
                from {
                    opacity: 0;
                    transform: translateX(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            
            .anime-count {
                font-size: 0.8em;
                opacity: 0.7;
                font-weight: normal;
            }
            
            .genre-pill {
                display: inline-block;
                padding: 2px 6px;
                border-radius: 12px;
                background-color: rgba(255, 87, 34, 0.7);
                color: white;
                font-size: 0.6rem;
                margin-right: 4px;
                margin-bottom: 4px;
                text-transform: capitalize;
            }
            
            .genre-tag {
                display: inline-block;
                padding: 3px 8px;
                border-radius: 15px;
                background-color: rgba(255, 87, 34, 0.8);
                color: white;
                font-size: 0.7rem;
                margin-right: 6px;
                margin-bottom: 8px;
                text-transform: capitalize;
            }
            
            .episode-count {
                position: absolute;
                top: 10px;
                right: 10px;
                background-color: rgba(0, 0, 0, 0.7);
                color: white;
                padding: 2px 6px;
                border-radius: 10px;
                font-size: 0.7rem;
            }
            
            .anime-card-image {
                position: relative;
                width: 100%;
                height: 100%;
            }
            
            .anime-card-buttons {
                display: flex;
                justify-content: space-between;
                width: 80%;
                margin-top: 10px;
            }
            
            .anime-card-buttons button {
                width: 35px;
                height: 35px;
                border-radius: 50%;
                background-color: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .anime-card-buttons button:hover {
                background-color: var(--primary-color);
                transform: scale(1.1);
            }
            
            .in-watchlist {
                background-color: var(--primary-color) !important;
            }
        `;
        document.head.appendChild(styleSheet);
    }
}

// Load more anime implementation
function loadMoreAnime(section) {
    // Increment page
    paginationState[section].page += 1;
    
    // Clear container
    const container = document.getElementById(`${section}Grid`);
    container.innerHTML = '';
    
    // Load anime based on section
    switch(section) {
        case 'trending':
            loadTrendingAnime();
            break;
        case 'action':
            loadActionAnime();
            break;
        case 'adventure':
            loadAdventureAnime();
            break;
        case 'comedy':
            loadComedyAnime();
            break;
    }
    
    // Check if we should hide the load more button
    checkLoadMoreButtonsVisibility();
    
    // Scroll to the top of the section
    document.getElementById(`${section}Section`).scrollIntoView({ behavior: 'smooth' });
}

// Enhanced check load more buttons visibility
function checkLoadMoreButtonsVisibility() {
    loadMoreButtons.forEach(button => {
        const section = button.getAttribute('data-section');
        const { page, limit, total } = paginationState[section];
        
        // Hide button if we've loaded all anime or reached 50 items
        if (page * limit >= total || page * limit >= 50) {
            button.style.display = 'none';
        } else {
            button.style.display = 'block';
            button.innerHTML = `Load More (${Math.min(limit, total - page * limit)} more)`;
        }
    });
}

// Handle search functionality
function handleSearch() {
    const query = searchInput.value.trim().toLowerCase();
    
    if (query.length < 2) {
        searchResults.classList.remove('active');
        return;
    }
    
    // Filter anime by name
    const filteredAnime = animeData.filter(anime => 
        anime.name.toLowerCase().includes(query)
    ).slice(0, 5); // Show max 5 results
    
    // Show or hide search results
    if (filteredAnime.length > 0) {
        searchResults.classList.add('active');
        renderSearchResults(filteredAnime);
    } else {
        searchResults.classList.remove('active');
    }
}

// Render search results
function renderSearchResults(results) {
    searchResults.innerHTML = '';
    
    results.forEach(anime => {
        const resultItem = document.createElement('div');
        resultItem.className = 'search-result-item';
        resultItem.innerHTML = `
            <img src="${anime.image}" alt="${anime.name}">
            <div class="result-info">
                <h4>${anime.name}</h4>
                <p>${anime.rating.toFixed(1)} <i class="fas fa-star"></i></p>
            </div>
        `;
        
        // Add click event to redirect to anime info page
        resultItem.addEventListener('click', () => {
            window.location.href = `anime_info.html?id=${anime.id}`;
        });
        
        searchResults.appendChild(resultItem);
    });
}

// Toggle notification panel
function toggleNotificationPanel() {
    notificationPanel.classList.toggle('active');
    
    // Mark notifications as read when panel is opened
    if (notificationPanel.classList.contains('active') && notifications.length > 0) {
        // In a real application, you would update the server here
        // For this demo, we'll just update the UI
        notificationCount.textContent = '0';
        notificationCount.style.display = 'none';
    }
}

// Fetch notifications
function fetchNotifications() {
    if (!isLoggedIn || !userData) return;
    
    // Get user watchlist
    const watchlist = userData.watchlist || [];
    
    // Get new anime in user's watchlist genres
    let userGenres = new Set();
    
    // Collect user's favorite genres based on watchlist
    watchlist.forEach(animeId => {
        const anime = animeData.find(a => a.id === animeId);
        if (anime && anime.genera) {
            anime.genera.forEach(g => userGenres.add(g));
        }
    });
    
    // Find new anime in user's favorite genres
    // For this example, we'll consider the top 5 anime as "new"
    const newAnime = animeData
        .filter(anime => {
            // Check if any genre matches user's preferences
            return anime.genera && anime.genera.some(g => userGenres.has(g)) && !watchlist.includes(anime.id);
        })
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 5);
    
    // Create notifications
    notifications = newAnime.map(anime => ({
        id: anime.id,
        title: `New anime: ${anime.name}`,
        message: `A new ${anime.genera.join(', ')} anime that might interest you!`,
        time: 'Just added'
    }));
    
    // Update UI
    updateNotifications();
}

// Update notifications in UI
function updateNotifications() {
    // Update notification count
    notificationCount.textContent = notifications.length;
    notificationCount.style.display = notifications.length > 0 ? 'flex' : 'none';
    
    // Update notification list
    if (notifications.length > 0) {
        notificationList.innerHTML = '';
        
        notifications.forEach(notification => {
            const notificationItem = document.createElement('div');
            notificationItem.className = 'notification-item';
            notificationItem.innerHTML = `
                <div class="notification-title">${notification.title}</div>
                <div class="notification-message">${notification.message}</div>
                <div class="notification-time">${notification.time}</div>
            `;
            
            // Add click event to redirect to anime info page
            notificationItem.addEventListener('click', () => {
                window.location.href = `anime_info.html?id=${notification.id}`;
                
                // Close notification panel
                notificationPanel.classList.remove('active');
            });
            
            notificationList.appendChild(notificationItem);
        });
    } else {
        notificationList.innerHTML = '<p class="no-notifications">No new notifications</p>';
    }
}

// Helper function to generate star rating HTML
function getStarRating(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    let stars = '';
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    
    // Half star
    if (halfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    
    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    
    return stars;
}

// Add to watchlist - now using common utilities
function addToWatchlist(animeId) {
    if (!isLoggedIn) {
        common.showToast('Please log in to add anime to your watchlist', 'error');
        setTimeout(() => {
            window.location.href = './auth.html';
        }, 2000);
        return;
    }
    
    // Use the common utility function for adding to watchlist
    if (common.addToWatchlist(animeId)) {
        // Re-check user data since it might have been updated
        userData = common.checkUserLogin();
        // common.addToWatchlist already shows a toast
    }
}

// Toggle watchlist status - using common utilities
function toggleWatchlist(animeId, button) {
    if (!isLoggedIn) {
        common.showToast('Please log in to manage your watchlist', 'error');
        setTimeout(() => {
            window.location.href = './auth.html';
        }, 2000);
        return;
    }
    
    // Use common utility for toggling
    common.toggleWatchlist(animeId, button);
    
    // Re-check user data and update UI
    userData = common.checkUserLogin();
}

// Check if anime is in watchlist - using common utilities
function isInWatchlist(animeId) {
    return common.isInWatchlist(animeId);
}