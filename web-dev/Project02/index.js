// index.js
// Global variables to store data
let animeData = [];
let userData = null;
let isLoggedIn = false;
let notifications = [];

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const notificationBtn = document.getElementById('notificationBtn');
const notificationPanel = document.getElementById('notificationPanel');
const notificationList = document.getElementById('notificationList');
const notificationCount = document.querySelector('.notification-count');
const userBtn = document.getElementById('userBtn');
const loginBtn = document.getElementById('loginBtn');
const heroSlider = document.getElementById('heroSlider');
const trendingGrid = document.getElementById('trendingGrid');
const actionGrid = document.getElementById('actionGrid');
const adventureGrid = document.getElementById('adventureGrid');
const comedyGrid = document.getElementById('comedyGrid');
const loadMoreButtons = document.querySelectorAll('.load-more');

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
    const loggedInUser = localStorage.getItem('currentUser');
    if (loggedInUser) {
        userData = JSON.parse(loggedInUser);
        isLoggedIn = true;
        
        // Update UI based on login status
        userBtn.style.display = 'flex';
        loginBtn.style.display = 'none';
        
        // Check for notifications
        fetchNotifications();
    } else {
        isLoggedIn = false;
        
        // Update UI based on login status
        userBtn.style.display = 'none';
        loginBtn.style.display = 'flex';
        
        // Hide notification count
        notificationCount.style.display = 'none';
    }
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

// Initialize Hero Slider
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
            <div class="slide-background" style="background-image: url('${anime.image}')"></div>
            <div class="slide-overlay">
                <div class="slide-content">
                    <h2>${anime.name}</h2>
                    <div class="rating">
                        <div class="stars">
                            ${getStarRating(anime.rating)}
                        </div>
                        <span>${anime.rating.toFixed(1)}/5.0</span>
                    </div>
                    <p>${anime.description.length > 150 ? anime.description.substring(0, 150) + '...' : anime.description}</p>
                    <a href="anime_info.html?id=${anime.id}" class="btn">Watch Now</a>
                </div>
            </div>
        `;
        
        heroSlider.appendChild(slide);
    });
    
    // Initialize Swiper
    const swiper = new Swiper('.swiper', {
        loop: true,
        autoplay: {
            delay: 10000,
            disableOnInteraction: false,
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        effect: 'fade',
        fadeEffect: {
            crossFade: true
        },
        on: {
            slideChangeTransitionStart: function() {
                // Add animation to slide content
                document.querySelector('.swiper-slide-active .slide-content').style.animation = 'none';
                setTimeout(() => {
                    document.querySelector('.swiper-slide-active .slide-content').style.animation = 'fadeIn 1s ease';
                }, 10);
            }
        }
    });
}

// Load anime sections
function loadAnimeSections() {
    // Clear all grids first
    trendingGrid.innerHTML = '';
    actionGrid.innerHTML = '';
    adventureGrid.innerHTML = '';
    comedyGrid.innerHTML = '';
    
    loadTrendingAnime();
    loadActionAnime();
    loadAdventureAnime();
    loadComedyAnime();
    
    // Check if we should hide any "Load More" buttons
    checkLoadMoreButtonsVisibility();
}

// Load trending anime (based on rating)
function loadTrendingAnime() {
    const { page, limit } = paginationState.trending;
    const startIndex = 0;
    const endIndex = page * limit;
    
    // Get top rated anime
    const trending = [...animeData]
        .sort((a, b) => b.rating - a.rating)
        .slice(startIndex, endIndex);
    
    // Render anime cards
    renderAnimeCards(trending, trendingGrid);
}

// Load action anime
function loadActionAnime() {
    const { page, limit } = paginationState.action;
    const startIndex = 0;
    const endIndex = page * limit;
    
    // Get action anime
    const actionAnime = animeData
        .filter(anime => anime.genera && anime.genera.includes('action'))
        .slice(startIndex, endIndex);
    
    // Render anime cards
    renderAnimeCards(actionAnime, actionGrid);
}

// Load adventure anime
function loadAdventureAnime() {
    const { page, limit } = paginationState.adventure;
    const startIndex = 0;
    const endIndex = page * limit;
    
    // Get adventure anime
    const adventureAnime = animeData
        .filter(anime => anime.genera && anime.genera.includes('adventure'))
        .slice(startIndex, endIndex);
    
    // Render anime cards
    renderAnimeCards(adventureAnime, adventureGrid);
}

// Load comedy anime
function loadComedyAnime() {
    const { page, limit } = paginationState.comedy;
    const startIndex = 0;
    const endIndex = page * limit;
    
    // Get comedy anime
    const comedyAnime = animeData
        .filter(anime => anime.genera && anime.genera.includes('comedy'))
        .slice(startIndex, endIndex);
    
    // Render anime cards
    renderAnimeCards(comedyAnime, comedyGrid);
}

// Render anime cards with animation
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
            <img src="${anime.image}" alt="${anime.name}">
            <div class="anime-card-overlay">
                <h3>${anime.name}</h3>
                <div class="rating">
                    <i class="fas fa-star"></i>
                    <span>${anime.rating.toFixed(1)}</span>
                </div>
            </div>
        `;
        
        // Add click event to redirect to anime info page
        card.addEventListener('click', () => {
            window.location.href = `anime_info.html?id=${anime.id}`;
        });
        
        container.appendChild(card);
    });
    
    // Add fadeInUp animation to CSS
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
        `;
        document.head.appendChild(styleSheet);
    }
}

// Load more anime for a specific section
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
}

// Check if load more buttons should be visible
function checkLoadMoreButtonsVisibility() {
    loadMoreButtons.forEach(button => {
        const section = button.getAttribute('data-section');
        const { page, limit, total } = paginationState[section];
        
        // Hide button if we've loaded all anime or reached 50 items
        if (page * limit >= total || page * limit >= 50) {
            button.style.display = 'none';
        } else {
            button.style.display = 'block';
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

// Check login state and update UI accordingly
function checkLoginState() {
    const user = localStorage.getItem('currentUser');
    
    if (user) {
        // If the user is logged in, hide the login button and show the user button
        loginBtn.style.display = 'none';
        userBtn.style.display = 'block';
    } else {
        // If no user is logged in, ensure the login button is visible
        loginBtn.style.display = 'block';
        userBtn.style.display = 'none';
    }
}

// Add to watchlist functionality
function addToWatchlist(animeId) {
    if (!isLoggedIn) {
        alert('Please log in to add anime to your watchlist');
        window.location.href = './auth.html';
        return;
    }
    
    // Update local user data
    if (!userData.watchlist) {
        userData.watchlist = [];
    }
    
    if (!userData.watchlist.includes(animeId)) {
        userData.watchlist.push(animeId);
        localStorage.setItem('currentUser', JSON.stringify(userData));
        
        // Show success message
        showToast('Anime added to watchlist!');
    }
}

// Show toast notification
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Add toast styles if not already present
if (!document.querySelector('#toastStyles')) {
    const toastStyles = document.createElement('style');
    toastStyles.id = 'toastStyles';
    toastStyles.innerHTML = `
        .toast {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%) translateY(100px);
            background-color: var(--primary-color, #ff5722);
            color: var(--text-dark, #fff);
            padding: 12px 24px;
            border-radius: 30px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            z-index: 2000;
            opacity: 0;
            transition: all 0.3s ease;
        }
        
        .toast.show {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    `;
    document.head.appendChild(toastStyles);
}