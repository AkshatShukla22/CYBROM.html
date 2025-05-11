// User Profile Management Script
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const currentUser = getCurrentUser();
    if (!currentUser) {
        window.location.href = 'auth.html'; // Redirect to login if not logged in
        return;
    }

    // Load user data
    loadUserData(currentUser);
    
    // Load watchlist
    loadWatchlist(currentUser);
    
    // Load watch history
    loadWatchHistory(currentUser);
    
    // Setup tab switching
    setupTabs();
    
    // Setup notification functionality
    setupNotifications();
    
    // Setup logout functionality
    setupLogout();
    
    // Setup account settings form
    setupAccountSettings(currentUser);
    
    // Setup profile picture change
    setupProfilePicChange();
});

// Get current logged in user
function getCurrentUser() {
    // Check local storage for logged in user
    const loggedInUser = localStorage.getItem('currentUser');
    if (!loggedInUser) {
        return null;
    }
    return JSON.parse(loggedInUser);
}

// Load user data into profile
function loadUserData(user) {
    const userNameElement = document.getElementById('user-name');
    const userEmailElement = document.getElementById('user-email');
    
    userNameElement.textContent = user.name || 'User';
    userEmailElement.textContent = user.email || '';
}

// Load user watchlist - FIXED FUNCTION
function loadWatchlist(user) {
    // Make sure we have the latest user data from localStorage
    const currentUser = getCurrentUser();
    if (currentUser) {
        // Use the latest user data
        user = currentUser;
    }
  
    const watchlistContainer = document.querySelector('.watchlist-container');
    const emptyState = document.querySelector('#watchlist .empty-state');
    
    // Clear existing content
    watchlistContainer.innerHTML = '';
    
    // Get user watchlist - ensure it exists
    const watchlist = user.watchlist || [];
    
    // Debug - Log watchlist to console
    console.log('Loading watchlist items:', watchlist);
    
    if (watchlist.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    }
    
    emptyState.classList.add('hidden');
    
    // Fetch anime data from db
    fetch('db.json')
        .then(response => response.json())
        .then(data => {
            const animeList = data.anime || [];
            
            // Check if we found any matching anime
            let matchFound = false;
            
            // Loop through watchlist IDs and create cards
            watchlist.forEach(animeId => {
                // Convert animeId to number if it's stored as string
                const searchId = typeof animeId === 'string' ? parseInt(animeId) : animeId;
                
                // Find the anime in the list
                const anime = animeList.find(a => {
                    const dataId = typeof a.id === 'string' ? parseInt(a.id) : a.id;
                    return dataId === searchId;
                });
                
                if (anime) {
                    matchFound = true;
                    const animeCard = createAnimeCard(anime, true);
                    watchlistContainer.appendChild(animeCard);
                } else {
                    console.warn(`Anime with ID ${animeId} not found in database`);
                }
            });
            
            // Show empty state if no matches were found
            if (!matchFound) {
                emptyState.classList.remove('hidden');
            }
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
    
    // Clear existing content
    historyContainer.innerHTML = '';
    
    // Get user watch history
    const history = user.watchHistory || [];
    
    if (history.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    }
    
    emptyState.classList.add('hidden');
    
    // Fetch anime data from db
    fetch('db.json')
        .then(response => response.json())
        .then(data => {
            const animeList = data.anime || [];
            
            // Sort history by last watched (most recent first)
            history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            
            // Loop through history and create cards
            history.forEach(historyItem => {
                const anime = animeList.find(a => a.id === historyItem.animeId);
                if (anime) {
                    const historyCard = createHistoryCard(anime, historyItem);
                    historyContainer.appendChild(historyCard);
                }
            });
        })
        .catch(error => {
            console.error('Error loading watch history:', error);
            emptyState.classList.remove('hidden');
        });
}

// Create anime card for watchlist
function createAnimeCard(anime, isWatchlist = false) {
    const card = document.createElement('div');
    card.className = 'anime-card';
    card.dataset.id = anime.id;
    
    card.innerHTML = `
        <div class="anime-card-image">
            <img src="${anime.image || './assets/default-anime.png'}" alt="${anime.name}">
        </div>
        <div class="anime-card-info">
            <h4>${anime.name}</h4>
            <div class="anime-card-rating">
                <i class="fas fa-star"></i>
                <span>${anime.rating || '0.0'}</span>
            </div>
        </div>
        ${isWatchlist ? '<button class="remove-btn"><i class="fas fa-times"></i></button>' : ''}
    `;
    
    // Add event listener to open anime info page
    card.addEventListener('click', (e) => {
        // Don't redirect if clicking on remove button
        if (e.target.closest('.remove-btn')) {
            return;
        }
        window.location.href = `anime_info.html?id=${anime.id}`;
    });
    
    // Add event listener to remove button if it exists
    if (isWatchlist) {
        const removeBtn = card.querySelector('.remove-btn');
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent card click
            removeFromWatchlist(anime.id);
        });
    }
    
    return card;
}

// Create history card
function createHistoryCard(anime, historyItem) {
    const card = document.createElement('div');
    card.className = 'history-card';
    card.dataset.id = anime.id;
    
    // Format date
    const watchDate = new Date(historyItem.timestamp);
    const formattedDate = watchDate.toLocaleDateString();
    
    card.innerHTML = `
        <div class="history-card-image">
            <img src="${anime.image || './assets/default-anime.png'}" alt="${anime.name}">
        </div>
        <div class="history-card-info">
            <h4>${anime.name}</h4>
            <p>Episode ${historyItem.episode || 1}: ${historyItem.episodeTitle || 'Episode'}</p>
            <div class="history-card-details">
                <span class="watched-on">Watched on ${formattedDate}</span>
                <div class="progress-bar">
                    <div class="progress" style="width: ${historyItem.progress || 0}%"></div>
                </div>
            </div>
        </div>
        <button class="continue-btn">Continue</button>
    `;
    
    // Add event listener to continue button
    const continueBtn = card.querySelector('.continue-btn');
    continueBtn.addEventListener('click', () => {
        window.location.href = `watch.html?id=${anime.id}&ep=${historyItem.episode || 1}`;
    });
    
    // Add event listener to open anime info page
    card.addEventListener('click', (e) => {
        // Don't redirect if clicking on continue button
        if (e.target.closest('.continue-btn')) {
            return;
        }
        window.location.href = `anime_info.html?id=${anime.id}`;
    });
    
    return card;
}

// Remove anime from watchlist - UPDATED
function removeFromWatchlist(animeId) {
    // Use common utility if available
    if (window.common && typeof window.common.removeFromWatchlist === 'function') {
        if (window.common.removeFromWatchlist(animeId)) {
            // Reload the watchlist to reflect changes
            loadWatchlist(getCurrentUser());
        }
        return;
    }
    
    // Fallback to original implementation
    const currentUser = getCurrentUser();
    if (!currentUser) {
        return;
    }
    
    // Filter out the selected anime
    currentUser.watchlist = (currentUser.watchlist || []).filter(id => id !== animeId);
    
    // Update local storage
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Update UI
    loadWatchlist(currentUser);
    
    // Update notification count
    updateNotificationCount();
    
    // Show removal notification
    showToast('Removed from watchlist');
    
    // Update watchlist in db.json
    updateUserInDb(currentUser);
}

// Update user in db.json
function updateUserInDb(user) {
    // Use common utility if available
    if (window.common && typeof window.common.updateUserInDb === 'function') {
        window.common.updateUserInDb(user);
        return;
    }
    
    // Fallback to original implementation
    fetch('db.json')
        .then(response => response.json())
        .then(data => {
            const users = data.users || [];
            const userIndex = users.findIndex(u => u.email === user.email);
            
            if (userIndex !== -1) {
                // Update user in the array
                data.users[userIndex] = user;
                
                // Update db.json (this is a mock since we can't directly update json file with client-side JS)
                // In a real app, you would use a server-side API endpoint to update the db
                console.log('User data updated in database:', user);
            }
        })
        .catch(error => {
            console.error('Error updating user in database:', error);
        });
}

// Setup tab switching
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            tabButtons.forEach(button => button.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            
            // Hide all tab panes
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // Show the corresponding tab pane
            const tabId = btn.dataset.tab;
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// Setup logout functionality
function setupLogout() {
    const logoutBtn = document.querySelector('.logout-btn');
    
    logoutBtn.addEventListener('click', () => {
        // Clear current user from local storage
        localStorage.removeItem('currentUser');
        
        // Redirect to login page
        window.location.href = 'auth.html';
    });
}

// Setup account settings form
function setupAccountSettings(user) {
    const updateForm = document.getElementById('update-form');
    const nameInput = document.getElementById('update-name');
    const emailInput = document.getElementById('update-email');
    const phoneInput = document.getElementById('update-phone');
    
    // Populate form with user data
    nameInput.value = user.name || '';
    emailInput.value = user.email || '';
    phoneInput.value = user.phone || '';
    
    // Handle form submission
    updateForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        // Validate form
        if (newPassword !== confirmPassword) {
            showToast('New passwords do not match', 'error');
            return;
        }
        
        if (currentPassword && !newPassword) {
            showToast('Please enter a new password', 'error');
            return;
        }
        
        if (newPassword && !currentPassword) {
            showToast('Please enter your current password', 'error');
            return;
        }
        
        // Validate current password
        if (currentPassword && currentPassword !== user.password) {
            showToast('Current password is incorrect', 'error');
            return;
        }
        
        // Update user data
        user.name = nameInput.value;
        user.phone = phoneInput.value;
        
        // Update password if provided
        if (newPassword) {
            user.password = newPassword;
        }
        
        // Update user in local storage
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Update UI
        loadUserData(user);
        
        // Update user in db
        updateUserInDb(user);
        
        // Reset password fields
        document.getElementById('current-password').value = '';
        document.getElementById('new-password').value = '';
        document.getElementById('confirm-password').value = '';
        
        // Show success message
        showToast('Account settings updated successfully');
    });
}

// Setup profile picture change
function setupProfilePicChange() {
    const profilePic = document.getElementById('profile-pic');
    const editPicBtn = document.querySelector('.edit-pic');
    
    editPicBtn.addEventListener('click', () => {
        // Create a file input
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        
        // Handle file selection
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    // Update profile picture
                    profilePic.src = event.target.result;
                    
                    // Save to local storage
                    const currentUser = getCurrentUser();
                    if (currentUser) {
                        currentUser.profilePic = event.target.result;
                        localStorage.setItem('currentUser', JSON.stringify(currentUser));
                        
                        // Update in db
                        updateUserInDb(currentUser);
                    }
                };
                reader.readAsDataURL(file);
            }
        });
        
        // Click the file input
        fileInput.click();
    });
    
    // Load profile picture if available
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.profilePic) {
        profilePic.src = currentUser.profilePic;
    }
}

// Setup notifications
function setupNotifications() {
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationPanel = document.getElementById('notificationPanel');
    const notificationList = document.getElementById('notificationList');
    
    // Toggle notification panel
    notificationBtn.addEventListener('click', () => {
        notificationPanel.classList.toggle('active');
        
        // Mark notifications as read
        if (notificationPanel.classList.contains('active')) {
            markNotificationsAsRead();
        }
    });
    
    // Close notification panel when clicking outside
    document.addEventListener('click', (e) => {
        if (!notificationBtn.contains(e.target) && !notificationPanel.contains(e.target)) {
            notificationPanel.classList.remove('active');
        }
    });
    
    // Load notifications
    loadNotifications();
    
    // Update notification count
    updateNotificationCount();
}

// Load notifications
function loadNotifications() {
    const notificationList = document.getElementById('notificationList');
    const currentUser = getCurrentUser();
    
    // Clear existing notifications
    notificationList.innerHTML = '';
    
    if (!currentUser) {
        notificationList.innerHTML = '<p class="no-notifications">No new notifications</p>';
        return;
    }
    
    // Get user watchlist
    const watchlist = currentUser.watchlist || [];
    
    // Fetch anime data
    fetch('db.json')
        .then(response => response.json())
        .then(data => {
            const animeList = data.anime || [];
            const notifications = [];
            
            // Check for new episodes of watchlisted anime
            watchlist.forEach(animeId => {
                const anime = animeList.find(a => a.id === animeId);
                if (anime) {
                    // Assume any anime updated in the last week has new episodes
                    const updatedTime = anime.lastUpdated ? new Date(anime.lastUpdated) : new Date();
                    const oneWeekAgo = new Date();
                    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                    
                    if (updatedTime > oneWeekAgo) {
                        notifications.push({
                            animeId: anime.id,
                            animeName: anime.name,
                            message: `New episode of ${anime.name} is now available!`,
                            timestamp: updatedTime.getTime(),
                            read: false
                        });
                    }
                }
            });
            
            // Add any stored notifications
            const storedNotifications = currentUser.notifications || [];
            notifications.push(...storedNotifications);
            
            // Sort notifications by timestamp (newest first)
            notifications.sort((a, b) => b.timestamp - a.timestamp);
            
            // Save notifications to user
            currentUser.notifications = notifications;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            // Display notifications
            if (notifications.length === 0) {
                notificationList.innerHTML = '<p class="no-notifications">No new notifications</p>';
                return;
            }
            
            notifications.forEach(notification => {
                const notificationItem = document.createElement('div');
                notificationItem.className = `notification-item ${notification.read ? 'read' : ''}`;
                
                const notificationDate = new Date(notification.timestamp);
                const formattedDate = notificationDate.toLocaleDateString();
                
                notificationItem.innerHTML = `
                    <p>${notification.message}</p>
                    <span class="notification-time">${formattedDate}</span>
                `;
                
                // Add click event to navigate to anime
                if (notification.animeId) {
                    notificationItem.addEventListener('click', () => {
                        window.location.href = `anime_info.html?id=${notification.animeId}`;
                    });
                }
                
                notificationList.appendChild(notificationItem);
            });
            
            // Update notification count
            updateNotificationCount();
        })
        .catch(error => {
            console.error('Error loading notifications:', error);
            notificationList.innerHTML = '<p class="no-notifications">Error loading notifications</p>';
        });
}

// Mark notifications as read
function markNotificationsAsRead() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        return;
    }
    
    // Mark all notifications as read
    if (currentUser.notifications) {
        currentUser.notifications.forEach(notification => {
            notification.read = true;
        });
        
        // Update local storage
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Update notification count
        updateNotificationCount();
        
        // Update UI
        const notificationItems = document.querySelectorAll('.notification-item');
        notificationItems.forEach(item => {
            item.classList.add('read');
        });
    }
}

// Update notification count
function updateNotificationCount() {
    const notificationCount = document.querySelector('.notification-count');
    const currentUser = getCurrentUser();
    
    if (!currentUser || !currentUser.notifications) {
        notificationCount.textContent = '0';
        return;
    }
    
    // Count unread notifications
    const unreadCount = currentUser.notifications.filter(notification => !notification.read).length;
    
    // Update UI
    notificationCount.textContent = unreadCount.toString();
    
    // Show/hide notification count
    if (unreadCount > 0) {
        notificationCount.classList.add('active');
    } else {
        notificationCount.classList.remove('active');
    }
}

// Show toast message -
// Show toast message
function showToast(message, type = 'success') {
    // Create toast element if it doesn't exist
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        document.body.appendChild(toast);
    }
    
    // Set toast message and type
    toast.textContent = message;
    toast.className = `toast ${type}`;
    
    // Show toast
    toast.classList.add('show');
    
    // Hide toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Add a debugging function to help identify issues
function debugWatchlist() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        console.log('No user logged in');
        return;
    }
    
    console.log('Current user:', currentUser);
    console.log('Watchlist data:', currentUser.watchlist);
    
    // Check for data type issues
    if (currentUser.watchlist) {
        currentUser.watchlist.forEach((id, index) => {
            console.log(`Watchlist item ${index}:`, id, typeof id);
        });
    }
    
    // Add a check for localStorage sync
    const storedUser = JSON.parse(localStorage.getItem('currentUser'));
    console.log('Stored user watchlist:', storedUser.watchlist);
    
    // Check if the two match
    const watchlistMatches = JSON.stringify(currentUser.watchlist) === JSON.stringify(storedUser.watchlist);
    console.log('Watchlists match:', watchlistMatches);
}

// Fix - Add a function to sync local storage with current user object
function syncUserWithStorage() {
    const currentUser = getCurrentUser();
    if (currentUser) {
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        console.log('User data synced with localStorage');
    }
}

// Fix - Add compatibility function to ensure consistent ID formats
function normalizeAnimeId(id) {
    // Ensure ID is always a number for consistency
    return typeof id === 'string' ? parseInt(id, 10) : id;
}

// Fix - Modified loadWatchlist function with improved error handling and logging
function loadWatchlist(user) {
    // Make sure we have the latest user data from localStorage
    const currentUser = getCurrentUser();
    if (currentUser) {
        // Use the latest user data
        user = currentUser;
    }
  
    const watchlistContainer = document.querySelector('.watchlist-container');
    const emptyState = document.querySelector('#watchlist .empty-state');
    
    if (!watchlistContainer || !emptyState) {
        console.error('Watchlist DOM elements not found');
        return;
    }
    
    // Clear existing content
    watchlistContainer.innerHTML = '';
    
    // Get user watchlist - ensure it exists and is an array
    const watchlist = Array.isArray(user.watchlist) ? user.watchlist : [];
    
    // Debug - Log watchlist to console
    console.log('Loading watchlist items:', watchlist);
    
    if (watchlist.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    }
    
    emptyState.classList.add('hidden');
    
    // Fetch anime data from db
    fetch('db.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const animeList = data.anime || [];
            console.log('Fetched anime list:', animeList);
            
            // Check if we found any matching anime
            let matchFound = false;
            
            // Loop through watchlist IDs and create cards
            watchlist.forEach(animeId => {
                // Convert animeId to number for consistent comparison
                const searchId = normalizeAnimeId(animeId);
                
                // Find the anime in the list
                const anime = animeList.find(a => {
                    const dataId = normalizeAnimeId(a.id);
                    return dataId === searchId;
                });
                
                if (anime) {
                    matchFound = true;
                    const animeCard = createAnimeCard(anime, true);
                    watchlistContainer.appendChild(animeCard);
                    console.log(`Added anime ${anime.name} (ID: ${anime.id}) to watchlist display`);
                } else {
                    console.warn(`Anime with ID ${animeId} not found in database`);
                }
            });
            
            // Show empty state if no matches were found
            if (!matchFound) {
                console.warn('No matching anime found in database for watchlist items');
                emptyState.classList.remove('hidden');
            }
        })
        .catch(error => {
            console.error('Error loading watchlist:', error);
            emptyState.classList.remove('hidden');
        });
}

// Fix - Modified removeFromWatchlist function for better consistency
function removeFromWatchlist(animeId) {
    // Normalize the ID to ensure consistent format
    const normalizedId = normalizeAnimeId(animeId);
    
    // Use common utility if available
    if (window.common && typeof window.common.removeFromWatchlist === 'function') {
        if (window.common.removeFromWatchlist(normalizedId)) {
            // Reload the watchlist to reflect changes
            loadWatchlist(getCurrentUser());
        }
        return;
    }
    
    // Fallback to original implementation
    const currentUser = getCurrentUser();
    if (!currentUser) {
        console.error('No user logged in');
        return;
    }
    
    // Ensure watchlist exists and is an array
    if (!Array.isArray(currentUser.watchlist)) {
        currentUser.watchlist = [];
    }
    
    // Filter out the selected anime, ensuring we compare with consistent types
    currentUser.watchlist = currentUser.watchlist.filter(id => {
        // Normalize both IDs for comparison
        return normalizeAnimeId(id) !== normalizedId;
    });
    
    console.log(`Removed anime ID ${normalizedId} from watchlist`);
    console.log('Updated watchlist:', currentUser.watchlist);
    
    // Update local storage
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Update UI
    loadWatchlist(currentUser);
    
    // Update notification count
    updateNotificationCount();
    
    // Show removal notification
    showToast('Removed from watchlist');
    
    // Update watchlist in db.json
    updateUserInDb(currentUser);
}

// Add a new function to check if anime is in watchlist
function isInWatchlist(animeId) {
    const currentUser = getCurrentUser();
    if (!currentUser || !Array.isArray(currentUser.watchlist)) {
        return false;
    }
    
    // Normalize the ID to ensure consistent format
    const normalizedId = normalizeAnimeId(animeId);
    
    // Check if the anime ID exists in the watchlist
    return currentUser.watchlist.some(id => normalizeAnimeId(id) === normalizedId);
}

// Add a function to add anime to watchlist (for completeness)
function addToWatchlist(animeId) {
    // Normalize the ID to ensure consistent format
    const normalizedId = normalizeAnimeId(animeId);
    
    // Use common utility if available
    if (window.common && typeof window.common.addToWatchlist === 'function') {
        if (window.common.addToWatchlist(normalizedId)) {
            // If using the profile page, reload the watchlist to reflect changes
            if (document.querySelector('.watchlist-container')) {
                loadWatchlist(getCurrentUser());
            }
        }
        return;
    }
    
    // Fallback to original implementation
    const currentUser = getCurrentUser();
    if (!currentUser) {
        console.error('No user logged in');
        return false;
    }
    
    // Ensure watchlist exists and is an array
    if (!Array.isArray(currentUser.watchlist)) {
        currentUser.watchlist = [];
    }
    
    // Check if anime is already in watchlist
    if (!isInWatchlist(normalizedId)) {
        // Add anime to watchlist
        currentUser.watchlist.push(normalizedId);
        
        console.log(`Added anime ID ${normalizedId} to watchlist`);
        console.log('Updated watchlist:', currentUser.watchlist);
        
        // Update local storage
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Update notification count
        if (typeof updateNotificationCount === 'function') {
            updateNotificationCount();
        }
        
        // Show success notification
        showToast('Added to watchlist');
        
        // Update watchlist in db.json
        updateUserInDb(currentUser);
        
        return true;
    }
    
    return false;
}

// Initialize debugging on page load
document.addEventListener('DOMContentLoaded', () => {
    // Call the original event listener code
    
    // Add debug function call
    setTimeout(() => {
        debugWatchlist();
    }, 1000);
});