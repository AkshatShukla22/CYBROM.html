// profile.js - Script for the user profile page functionality

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const currentUser = checkLogin();
    if (!currentUser) {
        window.location.href = 'auth.html'; // Redirect to login page if not logged in
        return;
    }

    // Load user data
    loadUserData(currentUser);
    
    // Load user watchlist
    loadWatchlist(currentUser);
    
    // Load watch history
    loadWatchHistory(currentUser);
    
    // Setup tab navigation
    setupTabs();
    
    // Setup logout button
    setupLogout();
    
    // Setup form submission
    setupFormSubmission(currentUser);
    
    // Setup notification functionality
    setupNotifications(currentUser);
    
    // Setup search functionality
    setupSearch();
});

// Check if user is logged in
function checkLogin() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        return null;
    }
    return JSON.parse(currentUser);
}

// Load user data
function loadUserData(user) {
    // Display user name and email
    document.getElementById('user-name').textContent = user.name;
    document.getElementById('user-email').textContent = user.email;
    
    // Populate form fields
    document.getElementById('update-name').value = user.name;
    document.getElementById('update-email').value = user.email;
    document.getElementById('update-phone').value = user.phone || '';
    
    // Set profile picture if available
    if (user.profilePic) {
        document.getElementById('profile-pic').src = user.profilePic;
        document.querySelector('.user-avatar').src = user.profilePic;
    }
    
    // Setup profile picture upload
    setupProfilePicUpload();
}

// Load user watchlist
function loadWatchlist(user) {
    const watchlistContainer = document.querySelector('.watchlist-container');
    const emptyState = document.querySelector('#watchlist .empty-state');
    
    // Simulate fetching watchlist from db.json
    // In a real application, you'd fetch this from the server
    fetchUserWatchlist(user.email)
        .then(watchlist => {
            if (watchlist.length === 0) {
                emptyState.classList.remove('hidden');
                watchlistContainer.innerHTML = '';
                return;
            }
            
            emptyState.classList.add('hidden');
            watchlistContainer.innerHTML = '';
            
            // Display each anime in watchlist
            watchlist.forEach(anime => {
                const animeCard = createAnimeCard(anime, 'watchlist');
                watchlistContainer.appendChild(animeCard);
            });
        })
        .catch(error => {
            console.error('Error loading watchlist:', error);
            emptyState.classList.remove('hidden');
        });
}

// Load watch history
function loadWatchHistory(user) {
    const historyContainer = document.querySelector('.history-container');
    const emptyState = document.querySelector('#history .empty-state');
    
    // Simulate fetching watch history from db.json
    // In a real application, you'd fetch this from the server
    fetchWatchHistory(user.email)
        .then(history => {
            if (history.length === 0) {
                emptyState.classList.remove('hidden');
                historyContainer.innerHTML = '';
                return;
            }
            
            emptyState.classList.add('hidden');
            historyContainer.innerHTML = '';
            
            // Display each anime in history
            history.forEach(item => {
                const animeCard = createAnimeCard(item.anime, 'history', item.progress);
                historyContainer.appendChild(animeCard);
            });
        })
        .catch(error => {
            console.error('Error loading watch history:', error);
            emptyState.classList.remove('hidden');
        });
}

// Create anime card element
function createAnimeCard(anime, type, progress = null) {
    const card = document.createElement('div');
    card.classList.add('anime-card');
    card.setAttribute('data-id', anime.id);
    
    // Add animation class with delay based on index
    card.style.animationDelay = `${Math.random() * 0.5}s`;
    
    let progressHTML = '';
    if (type === 'history' && progress) {
        progressHTML = `
            <div class="progress-bar">
                <div class="progress" style="width: ${progress}%"></div>
            </div>
            <p class="episodes">${Math.round(progress / 100 * anime.episodes.length)}/${anime.episodes.length} episodes</p>
        `;
    }
    
    card.innerHTML = `
        <img src="${anime.image}" alt="${anime.name}">
        <div class="anime-info">
            <h4>${anime.name}</h4>
            <div class="rating">
                <i class="fas fa-star"></i>
                <span>${anime.rating}</span>
            </div>
            ${progressHTML}
        </div>
        ${type === 'watchlist' ? '<div class="remove-btn"><i class="fas fa-times"></i></div>' : ''}
    `;
    
    // Add event listener to redirect to anime info page
    card.addEventListener('click', function(e) {
        // Don't redirect if remove button is clicked
        if (e.target.closest('.remove-btn')) {
            return;
        }
        window.location.href = `anime_info.html?id=${anime.id}`;
    });
    
    // Add event listener to remove button
    if (type === 'watchlist') {
        const removeBtn = card.querySelector('.remove-btn');
        removeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            removeFromWatchlist(anime.id);
        });
    }
    
    return card;
}

// Remove anime from watchlist
function removeFromWatchlist(animeId) {
    const currentUser = checkLogin();
    if (!currentUser) return;
    
    // Simulate API call to remove from watchlist
    // In a real application, you'd make a server request
    fetch('db.json')
        .then(response => response.json())
        .then(data => {
            // Find the user in the database
            const userIndex = data.users.findIndex(user => user.email === currentUser.email);
            if (userIndex === -1) return;
            
            // Remove anime from watchlist
            const watchlist = data.users[userIndex].watchlist || [];
            const updatedWatchlist = watchlist.filter(id => id !== animeId);
            
            // Update local storage
            currentUser.watchlist = updatedWatchlist;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            // Update UI
            const animeCard = document.querySelector(`.anime-card[data-id="${animeId}"]`);
            if (animeCard) {
                animeCard.style.animation = 'fadeOut 0.3s ease-in-out forwards';
                setTimeout(() => {
                    animeCard.remove();
                    
                    // Show empty state if watchlist is empty
                    const watchlistContainer = document.querySelector('.watchlist-container');
                    if (watchlistContainer.children.length === 0) {
                        document.querySelector('#watchlist .empty-state').classList.remove('hidden');
                    }
                }, 300);
            }
            
            // Show notification
            showToast('Removed from watchlist');
        })
        .catch(error => {
            console.error('Error removing from watchlist:', error);
            showToast('Failed to remove from watchlist', 'error');
        });
}

// Setup tab navigation
function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all tabs
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            
            // Add active class to current tab
            this.classList.add('active');
            
            // Show corresponding tab pane
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// Setup logout button
function setupLogout() {
    const logoutBtn = document.querySelector('.logout-btn');
    logoutBtn.addEventListener('click', function() {
        // Clear local storage
        localStorage.removeItem('currentUser');
        
        // Show notification
        showToast('Logged out successfully');
        
        // Redirect to login page
        setTimeout(() => {
            window.location.href = 'auth.html';
        }, 1000);
    });
}

// Setup form submission
function setupFormSubmission(user) {
    const updateForm = document.getElementById('update-form');
    updateForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('update-name').value.trim();
        const phone = document.getElementById('update-phone').value.trim();
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        // Validate form
        if (!name) {
            showToast('Name is required', 'error');
            return;
        }
        
        // Check if user wants to change password
        if (currentPassword || newPassword || confirmPassword) {
            // Validate current password
            if (currentPassword !== user.password) {
                showToast('Current password is incorrect', 'error');
                return;
            }
            
            // Validate new password
            if (newPassword !== confirmPassword) {
                showToast('New passwords do not match', 'error');
                return;
            }
            
            // Validate password strength
            if (newPassword.length < 6) {
                showToast('Password must be at least 6 characters long', 'error');
                return;
            }
        }
        
        // Update user data
        const updatedUser = {
            ...user,
            name,
            phone
        };
        
        // Update password if provided
        if (newPassword) {
            updatedUser.password = newPassword;
        }
        
        // Simulate API call to update user data
        // In a real application, you'd make a server request
        
        // Update local storage
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        
        // Update UI
        document.getElementById('user-name').textContent = name;
        
        // Clear password fields
        document.getElementById('current-password').value = '';
        document.getElementById('new-password').value = '';
        document.getElementById('confirm-password').value = '';
        
        // Show notification
        showToast('Profile updated successfully');
    });
}

// Setup profile picture upload
function setupProfilePicUpload() {
    const editPicBtn = document.querySelector('.edit-pic');
    
    editPicBtn.addEventListener('click', function() {
        // In a real application, you'd open a file picker
        // For demonstration, we'll use a random avatar
        const randomAvatar = `https://i.pravatar.cc/150?u=${Date.now()}`;
        
        // Update profile picture
        document.getElementById('profile-pic').src = randomAvatar;
        document.querySelector('.user-avatar').src = randomAvatar;
        
        // Update user data
        const currentUser = checkLogin();
        if (currentUser) {
            currentUser.profilePic = randomAvatar;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
        
        // Show notification
        showToast('Profile picture updated');
    });
}

// Show toast notification
function showToast(message, type = 'success') {
    // Check if toast container exists
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        // Create toast container
        toastContainer = document.createElement('div');
        toastContainer.classList.add('toast-container');
        document.body.appendChild(toastContainer);
    }
    
    // Create toast
    const toast = document.createElement('div');
    toast.classList.add('toast', type);
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
        <div class="toast-progress"></div>
    `;
    
    // Add toast to container
    toastContainer.appendChild(toast);
    
    // Auto remove toast after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease-in-out forwards';
        setTimeout(() => {
            toast.remove();
            
            // Remove container if empty
            if (toastContainer.children.length === 0) {
                toastContainer.remove();
            }
        }, 300);
    }, 3000);
}

// Setup notifications
function setupNotifications(user) {
    const notificationBtn = document.querySelector('.notification');
    const notificationPanel = document.querySelector('.notification-panel');
    const notificationsContainer = document.querySelector('.notifications-container');
    const notificationCount = document.querySelector('.notification-count');
    
    // Toggle notification panel
    notificationBtn.addEventListener('click', function() {
        notificationPanel.classList.toggle('active');
        
        // Mark all notifications as read when panel is opened
        if (notificationPanel.classList.contains('active')) {
            markAllNotificationsAsRead();
        }
    });
    
    // Close notification panel when clicking outside
    document.addEventListener('click', function(e) {
        if (!notificationBtn.contains(e.target) && !notificationPanel.contains(e.target)) {
            notificationPanel.classList.remove('active');
        }
    });
    
    // Fetch notifications
    fetchNotifications(user.email)
        .then(notifications => {
            // Update notification count
            const unreadCount = notifications.filter(notification => !notification.read).length;
            notificationCount.textContent = unreadCount;
            
            // Show notification count
            if (unreadCount > 0) {
                notificationCount.classList.add('active');
            } else {
                notificationCount.classList.remove('active');
            }
            
            // Display notifications
            notificationsContainer.innerHTML = '';
            
            if (notifications.length === 0) {
                notificationsContainer.innerHTML = '<div class="empty-notification">No notifications</div>';
                return;
            }
            
            notifications.forEach(notification => {
                const notificationItem = createNotificationItem(notification);
                notificationsContainer.appendChild(notificationItem);
            });
        })
        .catch(error => {
            console.error('Error fetching notifications:', error);
        });
    
    // Mark all notifications as read
    function markAllNotificationsAsRead() {
        // Simulate API call to mark all notifications as read
        // In a real application, you'd make a server request
        
        // Update UI
        notificationCount.textContent = '0';
        notificationCount.classList.remove('active');
        
        const notificationItems = document.querySelectorAll('.notification-item');
        notificationItems.forEach(item => {
            item.classList.remove('unread');
        });
    }
}

// Create notification item
function createNotificationItem(notification) {
    const item = document.createElement('div');
    item.classList.add('notification-item');
    
    if (!notification.read) {
        item.classList.add('unread');
    }
    
    item.innerHTML = `
        <div class="notification-icon">
            <i class="fas ${notification.icon || 'fa-bell'}"></i>
        </div>
        <div class="notification-content">
            <p>${notification.message}</p>
            <span class="notification-time">${formatTimeAgo(notification.time)}</span>
        </div>
    `;
    
    return item;
}

// Format time ago
function formatTimeAgo(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = Math.floor((now - time) / 1000); // difference in seconds
    
    if (diff < 60) {
        return 'Just now';
    } else if (diff < 3600) {
        const minutes = Math.floor(diff / 60);
        return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diff < 86400) {
        const hours = Math.floor(diff / 3600);
        return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diff < 604800) {
        const days = Math.floor(diff / 86400);
        return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    } else {
        // Format date
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return time.toLocaleDateString(undefined, options);
    }
}

// Setup search functionality
function setupSearch() {
    const searchInput = document.querySelector('.search-input');
    const searchResults = document.querySelector('.search-results');
    
    // Add event listener to search input
    searchInput.addEventListener('input', function() {
        const query = this.value.trim();
        
        // Hide search results if query is empty
        if (!query) {
            searchResults.classList.remove('active');
            return;
        }
        
        // Search for anime
        searchAnime(query)
            .then(results => {
                // Show search results
                searchResults.classList.add('active');
                
                // Display search results
                searchResults.innerHTML = '';
                
                if (results.length === 0) {
                    searchResults.innerHTML = '<div class="empty-search">No results found</div>';
                    return;
                }
                
                // Display search results
                results.slice(0, 5).forEach(anime => {
                    const searchItem = createSearchItem(anime);
                    searchResults.appendChild(searchItem);
                });
                
                // Add "See all results" button
                if (results.length > 5) {
                    const seeAllBtn = document.createElement('div');
                    seeAllBtn.classList.add('see-all-btn');
                    seeAllBtn.textContent = 'See all results';
                    seeAllBtn.addEventListener('click', function() {
                        window.location.href = `search.html?q=${encodeURIComponent(query)}`;
                    });
                    searchResults.appendChild(seeAllBtn);
                }
            })
            .catch(error => {
                console.error('Error searching anime:', error);
                searchResults.innerHTML = '<div class="empty-search">Error searching</div>';
            });
    });
    
    // Close search results when clicking outside
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.classList.remove('active');
        }
    });
    
    // Clear search input when pressing Escape
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            this.value = '';
            searchResults.classList.remove('active');
        }
    });
}

// Create search item
function createSearchItem(anime) {
    const item = document.createElement('div');
    item.classList.add('search-item');
    
    item.innerHTML = `
        <img src="${anime.image}" alt="${anime.name}">
        <div class="search-item-info">
            <h4>${anime.name}</h4>
            <div class="search-item-meta">
                <span>${anime.year}</span>
                <span>${anime.episodes.length} episodes</span>
            </div>
        </div>
    `;
    
    // Add event listener to redirect to anime info page
    item.addEventListener('click', function() {
        window.location.href = `anime_info.html?id=${anime.id}`;
    });
    
    return item;
}

// Fetch user watchlist
function fetchUserWatchlist(email) {
    return new Promise((resolve, reject) => {
        // Simulate API call to fetch watchlist
        // In a real application, you'd make a server request
        fetch('db.json')
            .then(response => response.json())
            .then(data => {
                // Find user in the database
                const user = data.users.find(user => user.email === email);
                if (!user) {
                    resolve([]);
                    return;
                }
                
                // Get watchlist
                const watchlist = user.watchlist || [];
                
                // Fetch anime info for each watchlist item
                const animePromises = watchlist.map(animeId => {
                    // Find anime in database
                    const anime = data.animes.find(anime => anime.id === animeId);
                    return anime || null;
                });
                
                // Wait for all anime info to be fetched
                Promise.all(animePromises)
                    .then(animes => {
                        // Filter out null values
                        const validAnimes = animes.filter(anime => anime !== null);
                        resolve(validAnimes);
                    })
                    .catch(error => {
                        reject(error);
                    });
            })
            .catch(error => {
                reject(error);
            });
    });
}

// Fetch watch history
function fetchWatchHistory(email) {
    return new Promise((resolve, reject) => {
        // Simulate API call to fetch watch history
        // In a real application, you'd make a server request
        fetch('db.json')
            .then(response => response.json())
            .then(data => {
                // Find user in the database
                const user = data.users.find(user => user.email === email);
                if (!user) {
                    resolve([]);
                    return;
                }
                
                // Get watch history
                const history = user.watchHistory || [];
                
                // Fetch anime info for each history item
                const historyPromises = history.map(item => {
                    // Find anime in database
                    const anime = data.animes.find(anime => anime.id === item.animeId);
                    if (!anime) {
                        return null;
                    }
                    
                    // Return history item with anime info
                    return {
                        anime,
                        progress: item.progress
                    };
                });
                
                // Wait for all anime info to be fetched
                Promise.all(historyPromises)
                    .then(historyItems => {
                        // Filter out null values
                        const validHistoryItems = historyItems.filter(item => item !== null);
                        resolve(validHistoryItems);
                    })
                    .catch(error => {
                        reject(error);
                    });
            })
            .catch(error => {
                reject(error);
            });
    });
}

// Fetch notifications
function fetchNotifications(email) {
    return new Promise((resolve, reject) => {
        // Simulate API call to fetch notifications
        // In a real application, you'd make a server request
        fetch('db.json')
            .then(response => response.json())
            .then(data => {
                // Find user in the database
                const user = data.users.find(user => user.email === email);
                if (!user) {
                    resolve([]);
                    return;
                }
                
                // Get notifications
                const notifications = user.notifications || [];
                
                // Sort notifications by time (newest first)
                notifications.sort((a, b) => new Date(b.time) - new Date(a.time));
                
                resolve(notifications);
            })
            .catch(error => {
                reject(error);
            });
    });
}

// Search anime
function searchAnime(query) {
    return new Promise((resolve, reject) => {
        // Simulate API call to search anime
        // In a real application, you'd make a server request
        fetch('db.json')
            .then(response => response.json())
            .then(data => {
                // Search anime
                const results = data.animes.filter(anime => {
                    // Search in name
                    if (anime.name.toLowerCase().includes(query.toLowerCase())) {
                        return true;
                    }
                    
                    // Search in genres
                    if (anime.genres.some(genre => genre.toLowerCase().includes(query.toLowerCase()))) {
                        return true;
                    }
                    
                    return false;
                });
                
                resolve(results);
            })
            .catch(error => {
                reject(error);
            });
    });
}