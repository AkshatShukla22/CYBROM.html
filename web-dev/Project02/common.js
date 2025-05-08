// common.js
// Contains common utilities and functions for all pages

// Check if a user is logged in
function checkUserLogin() {
    const currentUser = localStorage.getItem('currentUser');
    return currentUser ? JSON.parse(currentUser) : null;
}

// Format date to relative time (e.g., "2 days ago")
function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // difference in seconds
    
    if (diff < 60) {
        return 'Just now';
    } else if (diff < 3600) {
        const minutes = Math.floor(diff / 60);
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diff < 86400) {
        const hours = Math.floor(diff / 3600);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diff < 2592000) {
        const days = Math.floor(diff / 86400);
        return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (diff < 31536000) {
        const months = Math.floor(diff / 2592000);
        return `${months} month${months > 1 ? 's' : ''} ago`;
    } else {
        const years = Math.floor(diff / 31536000);
        return `${years} year${years > 1 ? 's' : ''} ago`;
    }
}

// Get URL parameters
function getUrlParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Show toast notification
function showToast(message, type = 'info') {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => {
        document.body.removeChild(toast);
    });
    
    // Create new toast
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = message;
    document.body.appendChild(toast);
    
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
                color: #fff;
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
            
            .toast.error {
                background-color: #f44336;
            }
            
            .toast.success {
                background-color: #4CAF50;
            }
            
            .toast.info {
                background-color: #2196F3;
            }
        `;
        document.head.appendChild(toastStyles);
    }
    
    // Show toast with animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    // Hide and remove toast after delay
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// Generate star rating HTML
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

// Format time from seconds to MM:SS or HH:MM:SS
function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return '00:00';
    }
    
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hrs > 0) {
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
}

// Truncate text with ellipsis
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Add anime to watchlist
function addToWatchlist(animeId) {
    const user = checkUserLogin();
    
    if (!user) {
        showToast('Please log in to add anime to your watchlist', 'error');
        setTimeout(() => {
            window.location.href = './auth.html';
        }, 2000);
        return false;
    }
    
    if (!user.watchlist) {
        user.watchlist = [];
    }
    
    if (!user.watchlist.includes(animeId)) {
        user.watchlist.push(animeId);
        localStorage.setItem('currentUser', JSON.stringify(user));
        showToast('Added to your watchlist', 'success');
        return true;
    }
    
    showToast('Already in your watchlist', 'info');
    return false;
}

// Remove anime from watchlist
function removeFromWatchlist(animeId) {
    const user = checkUserLogin();
    
    if (!user || !user.watchlist) {
        return false;
    }
    
    const index = user.watchlist.indexOf(animeId);
    if (index !== -1) {
        user.watchlist.splice(index, 1);
        localStorage.setItem('currentUser', JSON.stringify(user));
        showToast('Removed from your watchlist', 'success');
        return true;
    }
    
    return false;
}

// Check if anime is in watchlist
function isInWatchlist(animeId) {
    const user = checkUserLogin();
    if (!user || !user.watchlist) {
        return false;
    }
    return user.watchlist.includes(animeId);
}

// Get anime from user's watchlist
function getWatchlistAnime() {
    const user = checkUserLogin();
    if (!user || !user.watchlist || !user.watchlist.length) {
        return [];
    }
    
    // Assuming animeData is available globally
    // This should be called after animeData is loaded
    return user.watchlist.map(id => {
        const anime = animeData.find(a => a.id === id);
        return anime || null;
    }).filter(anime => anime !== null);
}

// Toggle watchlist status
function toggleWatchlist(animeId, button) {
    if (isInWatchlist(animeId)) {
        if (removeFromWatchlist(animeId)) {
            if (button) {
                button.innerHTML = '<i class="far fa-bookmark"></i> Add to Watchlist';
                button.classList.remove('in-watchlist');
            }
        }
    } else {
        if (addToWatchlist(animeId)) {
            if (button) {
                button.innerHTML = '<i class="fas fa-bookmark"></i> In Watchlist';
                button.classList.add('in-watchlist');
            }
        }
    }
}

// Update watchlist button state
function updateWatchlistButton(animeId, button) {
    if (button) {
        if (isInWatchlist(animeId)) {
            button.innerHTML = '<i class="fas fa-bookmark"></i> In Watchlist';
            button.classList.add('in-watchlist');
        } else {
            button.innerHTML = '<i class="far fa-bookmark"></i> Add to Watchlist';
            button.classList.remove('in-watchlist');
        }
    }
}

// Create anime card element
function createAnimeCard(anime) {
    const card = document.createElement('div');
    card.className = 'anime-card';
    
    card.innerHTML = `
        <img src="${anime.image}" alt="${anime.name}" loading="lazy">
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
    
    return card;
}

// Handle API errors gracefully
function handleApiError(error, message = 'Something went wrong') {
    console.error('API Error:', error);
    showToast(message, 'error');
}

// Export all functions to be available globally
window.common = {
    checkUserLogin,
    formatRelativeTime,
    getUrlParam,
    showToast,
    getStarRating,
    formatTime,
    truncateText,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    getWatchlistAnime,
    toggleWatchlist,
    updateWatchlistButton,
    createAnimeCard,
    handleApiError
};