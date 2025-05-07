// anime_info.html 
// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const searchResults = document.getElementById('searchResults');
const notificationBtn = document.getElementById('notificationBtn');
const notificationPanel = document.getElementById('notificationPanel');
const notificationList = document.getElementById('notificationList');
const notificationCount = document.querySelector('.notification-count');
const userBtn = document.getElementById('userBtn');
const loginBtn = document.getElementById('loginBtn');

// Anime Info Elements
const animePoster = document.getElementById('animePoster');
const animeBackdrop = document.querySelector('.anime-backdrop');
const animeTitle = document.getElementById('animeTitle');
const animeRating = document.getElementById('animeRating');
const episodeCount = document.getElementById('episodeCount');
const animeGenres = document.getElementById('animeGenres');
const animeDescription = document.getElementById('animeDescription');
const watchNowBtn = document.getElementById('watchNowBtn');
const addToWatchlistBtn = document.getElementById('addToWatchlistBtn');
const similarAnimeGrid = document.getElementById('similarAnimeGrid');
const genreTitle = document.getElementById('genreTitle');
const genreAnimeGrid = document.getElementById('genreAnimeGrid');

// Current anime data
let currentAnime = null;
let currentUser = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    checkLoginStatus();
    
    // Get anime ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const animeId = urlParams.get('id');
    
    if (animeId) {
        loadAnimeDetails(animeId);
    } else {
        // Fallback to first anime if no ID provided
        fetch('db.json')
            .then(response => response.json())
            .then(data => {
                if (data.anime && data.anime.length > 0) {
                    loadAnimeDetails(data.anime[0].id);
                } else {
                    showError('No anime found in the database');
                }
            })
            .catch(error => {
                console.error('Error fetching anime data:', error);
                showError('Error loading anime data');
            });
    }
    
    // Setup event listeners
    setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
    // Search functionality
    searchInput.addEventListener('input', handleSearch);
    searchBtn.addEventListener('click', () => {
        if (searchInput.value.trim()) {
            handleSearch();
        }
    });

    // Notification panel toggle
    notificationBtn.addEventListener('click', toggleNotificationPanel);
    
    // Close notification panel when clicking outside
    document.addEventListener('click', (e) => {
        if (!notificationBtn.contains(e.target) && !notificationPanel.contains(e.target)) {
            notificationPanel.classList.remove('active');
        }
    });

    // User button click
    userBtn.addEventListener('click', () => {
        window.location.href = 'user.html';
    });

    // Login button click
    loginBtn.addEventListener('click', () => {
        window.location.href = 'auth.html';
    });

    // Watch Now button click
    watchNowBtn.addEventListener('click', () => {
        if (currentAnime) {
            window.location.href = `watch.html?id=${currentAnime.id}&ep=1`;
        }
    });

    // Add to Watchlist button click
    addToWatchlistBtn.addEventListener('click', addToWatchlist);
}

// Check if user is logged in
function checkLoginStatus() {
    // Check local storage for user data
    const userData = localStorage.getItem('currentUser');
    
    if (userData) {
        currentUser = JSON.parse(userData);
        userBtn.style.display = 'flex';
        loginBtn.style.display = 'none';
        
        // Load user's watchlist and notifications
        loadUserNotifications();
    } else {
        userBtn.style.display = 'none';
        loginBtn.style.display = 'flex';
        notificationCount.textContent = '0';
    }
}

// Load anime details
function loadAnimeDetails(animeId) {
    fetch('db.json')
        .then(response => response.json())
        .then(data => {
            const anime = data.anime.find(a => a.id == animeId);
            
            if (anime) {
                currentAnime = anime;
                displayAnimeDetails(anime);
                loadSimilarAnime(anime);
                loadGenreAnime(anime);
                checkWatchlistStatus(anime.id);
            } else {
                showError('Anime not found');
            }
        })
        .catch(error => {
            console.error('Error fetching anime details:', error);
            showError('Error loading anime details');
        });
}

// Display anime details
function displayAnimeDetails(anime) {
    // Update page title
    document.title = `${anime.name} - AnimeStream`;
    
    // Set anime image
    animePoster.src = anime.image;
    animePoster.alt = anime.name;
    
    // Set backdrop image
    animeBackdrop.style.backgroundImage = `url(${anime.image})`;
    
    // Set anime details
    animeTitle.textContent = anime.name;
    animeRating.textContent = anime.rating;
    episodeCount.textContent = `${anime.episodes.length} Episodes`;
    animeGenres.textContent = anime.genera.join(', ');
    animeDescription.textContent = anime.description;
    
    // Check if in watchlist already
    checkWatchlistStatus(anime.id);
    
    // Animate elements
    animateElements();
}

// Load similar anime
function loadSimilarAnime(anime) {
    fetch('db.json')
        .then(response => response.json())
        .then(data => {
            // Find similar anime (same genre, excluding current)
            const similarAnimes = data.anime
                .filter(a => a.id !== anime.id && a.genera.some(g => anime.genera.includes(g)))
                .slice(0, 6);
            
            displayAnimeGrid(similarAnimeGrid, similarAnimes);
        })
        .catch(error => {
            console.error('Error loading similar anime:', error);
        });
}

// Load genre anime
function loadGenreAnime(anime) {
    const primaryGenre = anime.genera[0];
    genreTitle.textContent = `More ${primaryGenre} Anime`;
    
    fetch('db.json')
        .then(response => response.json())
        .then(data => {
            // Find anime of the same primary genre
            const genreAnimes = data.anime
                .filter(a => a.id !== anime.id && a.genera.includes(primaryGenre))
                .slice(0, 6);
            
            displayAnimeGrid(genreAnimeGrid, genreAnimes);
        })
        .catch(error => {
            console.error('Error loading genre anime:', error);
        });
}

// Display anime in grid
function displayAnimeGrid(container, animes) {
    container.innerHTML = '';
    
    if (animes.length === 0) {
        container.innerHTML = '<p class="no-results">No anime found</p>';
        return;
    }
    
    animes.forEach(anime => {
        const animeCard = document.createElement('div');
        animeCard.className = 'anime-card';
        animeCard.innerHTML = `
            <img src="${anime.image}" alt="${anime.name}">
            <div class="anime-card-overlay">
                <h3>${anime.name}</h3>
                <div class="rating">
                    <i class="fas fa-star"></i>
                    <span>${anime.rating}</span>
                </div>
            </div>
        `;
        
        animeCard.addEventListener('click', () => {
            window.location.href = `anime_info.html?id=${anime.id}`;
        });
        
        container.appendChild(animeCard);
    });
}

// Handle search functionality
function handleSearch() {
    const searchText = searchInput.value.trim().toLowerCase();
    
    if (searchText.length < 2) {
        searchResults.classList.remove('active');
        return;
    }
    
    fetch('db.json')
        .then(response => response.json())
        .then(data => {
            const matchingAnime = data.anime.filter(anime => 
                anime.name.toLowerCase().includes(searchText)
            ).slice(0, 5);
            
            displaySearchResults(matchingAnime);
        })
        .catch(error => {
            console.error('Error searching anime:', error);
        });
}

// Display search results
function displaySearchResults(results) {
    searchResults.innerHTML = '';
    
    if (results.length === 0) {
        searchResults.innerHTML = '<p style="padding: 10px; text-align: center;">No results found</p>';
        searchResults.classList.add('active');
        return;
    }
    
    results.forEach(anime => {
        const resultItem = document.createElement('div');
        resultItem.className = 'search-result-item';
        resultItem.innerHTML = `
            <img src="${anime.image}" alt="${anime.name}">
            <div class="result-info">
                <h4>${anime.name}</h4>
                <p>${anime.genera[0]} • ${anime.rating} ⭐</p>
            </div>
        `;
        
        resultItem.addEventListener('click', () => {
            window.location.href = `anime_info.html?id=${anime.id}`;
            searchResults.classList.remove('active');
            searchInput.value = '';
        });
        
        searchResults.appendChild(resultItem);
    });
    
    searchResults.classList.add('active');
}

// Toggle notification panel
function toggleNotificationPanel() {
    notificationPanel.classList.toggle('active');
}

// Load user notifications
function loadUserNotifications() {
    if (!currentUser) return;
    
    fetch('db.json')
        .then(response => response.json())
        .then(data => {
            const userData = data.users.find(user => user.email === currentUser.email);
            
            if (userData) {
                // Check for new anime in user's watchlist
                if (userData.watchlist && userData.watchlist.length > 0) {
                    const watchlistAnime = userData.watchlist.map(animeId => {
                        return data.anime.find(anime => anime.id === animeId);
                    }).filter(anime => anime !== undefined);
                    
                    // Check for new episodes in the last 30 days
                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                    
                    let notificationCount = 0;
                    notificationList.innerHTML = '';
                    
                    watchlistAnime.forEach(anime => {
                        // Check for new episodes (simulated with random logic for demo)
                        const hasNewEpisodes = Math.random() > 0.5; // Simulated logic
                        
                        if (hasNewEpisodes) {
                            notificationCount++;
                            
                            const notificationItem = document.createElement('div');
                            notificationItem.className = 'notification-item';
                            notificationItem.innerHTML = `
                                <div class="notification-title">New episode of ${anime.name}</div>
                                <div class="notification-time">Today</div>
                            `;
                            
                            notificationItem.addEventListener('click', () => {
                                window.location.href = `anime_info.html?id=${anime.id}`;
                            });
                            
                            notificationList.appendChild(notificationItem);
                        }
                    });
                    
                    if (notificationCount > 0) {
                        document.querySelector('.notification-count').textContent = notificationCount;
                    } else {
                        notificationList.innerHTML = '<div class="no-notifications">No new notifications</div>';
                        document.querySelector('.notification-count').textContent = '0';
                    }
                } else {
                    notificationList.innerHTML = '<div class="no-notifications">No new notifications</div>';
                    document.querySelector('.notification-count').textContent = '0';
                }
            }
        })
        .catch(error => {
            console.error('Error loading notifications:', error);
        });
}

// Check if anime is in user's watchlist
function checkWatchlistStatus(animeId) {
    if (!currentUser) {
        addToWatchlistBtn.innerHTML = '<i class="fas fa-plus"></i> Add to Watchlist';
        addToWatchlistBtn.classList.remove('in-watchlist');
        return;
    }
    
    fetch('db.json')
        .then(response => response.json())
        .then(data => {
            const userData = data.users.find(user => user.email === currentUser.email);
            
            if (userData && userData.watchlist && userData.watchlist.includes(animeId)) {
                addToWatchlistBtn.innerHTML = '<i class="fas fa-check"></i> In Watchlist';
                addToWatchlistBtn.classList.add('in-watchlist');
            } else {
                addToWatchlistBtn.innerHTML = '<i class="fas fa-plus"></i> Add to Watchlist';
                addToWatchlistBtn.classList.remove('in-watchlist');
            }
        })
        .catch(error => {
            console.error('Error checking watchlist status:', error);
        });
}

// Add or remove anime from watchlist
function addToWatchlist() {
    if (!currentUser) {
        // Redirect to login if not logged in
        window.location.href = 'auth.html?redirect=' + encodeURIComponent(window.location.href);
        return;
    }
    
    if (!currentAnime) return;
    
    // Check current watchlist status
    const isInWatchlist = addToWatchlistBtn.classList.contains('in-watchlist');
    
    // Update local storage first for immediate UI feedback
    const userData = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!userData.watchlist) {
        userData.watchlist = [];
    }
    
    if (isInWatchlist) {
        // Remove from watchlist
        userData.watchlist = userData.watchlist.filter(id => id !== currentAnime.id);
        addToWatchlistBtn.innerHTML = '<i class="fas fa-plus"></i> Add to Watchlist';
        addToWatchlistBtn.classList.remove('in-watchlist');
        showToast('Removed from your watchlist');
    } else {
        // Add to watchlist
        userData.watchlist.push(currentAnime.id);
        addToWatchlistBtn.innerHTML = '<i class="fas fa-check"></i> In Watchlist';
        addToWatchlistBtn.classList.add('in-watchlist');
        showToast('Added to your watchlist');
    }
    
    // Update local storage
    localStorage.setItem('currentUser', JSON.stringify(userData));
    
    // Update in db.json (would be a server API call in a real app)
    fetch('db.json')
        .then(response => response.json())
        .then(data => {
            const userIndex = data.users.findIndex(user => user.email === currentUser.email);
            
            if (userIndex !== -1) {
                if (!data.users[userIndex].watchlist) {
                    data.users[userIndex].watchlist = [];
                }
                
                if (isInWatchlist) {
                    // Remove from watchlist
                    data.users[userIndex].watchlist = data.users[userIndex].watchlist.filter(id => id !== currentAnime.id);
                } else {
                    // Add to watchlist
                    data.users[userIndex].watchlist.push(currentAnime.id);
                }
                
                // In a real app, this would be an API call to update the server
                console.log('Updated user watchlist:', data.users[userIndex].watchlist);
            }
        })
        .catch(error => {
            console.error('Error updating watchlist:', error);
            showToast('Error updating watchlist', 'error');
        });
}

// Animate elements for better UX
function animateElements() {
    // Add staggered animation for better UX
    const elements = [
        animeTitle,
        document.querySelector('.meta-info'),
        animeDescription,
        document.querySelector('.action-buttons')
    ];
    
    elements.forEach((element, index) => {
        setTimeout(() => {
            element.style.opacity = '0';
            element.style.animation = `fadeIn 0.8s ease forwards ${index * 0.2}s`;
        }, 0);
    });
}

// Show error message
function showError(message) {
    const errorContainer = document.createElement('div');
    errorContainer.className = 'error-message';
    errorContainer.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <p>${message}</p>
    `;
    
    document.querySelector('.anime-container').prepend(errorContainer);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        errorContainer.remove();
    }, 5000);
}

// Show toast notification
function showToast(message, type = 'success') {
    // Create toast container if it doesn't exist
    let toastContainer = document.querySelector('.toast-container');
    
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add to container
    toastContainer.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// Create dynamic CSS for toast notifications if not already in the document
(function() {
    if (!document.getElementById('dynamic-styles')) {
        const style = document.createElement('style');
        style.id = 'dynamic-styles';
        style.textContent = `
            .toast-container {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            
            .toast {
                background-color: var(--surface-color);
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                gap: 10px;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
                transform: translateX(120%);
                opacity: 0;
                transition: all 0.3s ease;
                min-width: 250px;
            }
            
            .toast.show {
                transform: translateX(0);
                opacity: 1;
            }
            
            .toast.success i {
                color: #4CAF50;
            }
            
            .toast.error i {
                color: var(--danger-color);
            }
            
            .error-message {
                background-color: rgba(207, 102, 121, 0.2);
                border-left: 4px solid var(--danger-color);
                padding: 15px;
                margin: 20px 5%;
                display: flex;
                align-items: center;
                gap: 15px;
                animation: slideDown 0.5s ease;
            }
            
            .error-message i {
                color: var(--danger-color);
                font-size: 24px;
            }
            
            @keyframes slideDown {
                from { transform: translateY(-20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
})();