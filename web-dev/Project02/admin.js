// Global variables
const animeUrl = "http://localhost:3000/anime";
const usersUrl = "http://localhost:3000/users";
let currentAnimePage = 1;
let animesPerPage = 10;
let currentAnimeId = null;

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
    // Check if admin is logged in
    checkAdminAuth();
    
    // Initialize tabs
    initializeTabs();
    
    // Load dashboard data
    loadDashboardData();
    
    // Initialize search functionality
    initializeSearch();
    
    // Initialize notification panel
    initializeNotificationPanel();
    
    // Initialize image preview
    initializeImagePreview();
    
    // Initialize form submissions
    initializeFormSubmissions();
    
    // Initialize modal functionality
    initializeModals();
    
    // Initialize logout
    document.getElementById('logout-btn').addEventListener('click', logout);
});

// Authentication check
function checkAdminAuth() {
    const loggedInUser = JSON.parse(localStorage.getItem('user')) || {};
    
    if (!loggedInUser.email || loggedInUser.email !== 'admin@gmail.com') {
        // Redirect to login if not admin
        window.location.href = 'auth.html';
    }
}

// Tabs functionality
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.admin-menu li');
    const tabContents = document.querySelectorAll('.admin-tab');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tab = button.getAttribute('data-tab');
            
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to current button and content
            button.classList.add('active');
            document.getElementById(tab).classList.add('active');
            
            // Load content based on active tab
            if (tab === 'manage-anime') {
                loadAnimeList();
            } else if (tab === 'manage-users') {
                loadUsersList();
            }
        });
    });
    
    // Modal tabs functionality
    const modalTabButtons = document.querySelectorAll('.tab-button');
    const modalTabContents = document.querySelectorAll('.tab-content');
    
    modalTabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tab = button.getAttribute('data-tab');
            
            // Remove active class from all buttons and contents
            modalTabButtons.forEach(btn => btn.classList.remove('active'));
            modalTabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to current button and content
            button.classList.add('active');
            document.getElementById(tab).classList.add('active');
            
            // If episodes tab is clicked, load episodes for current anime
            if (tab === 'episodes-list' && currentAnimeId) {
                loadEpisodesList(currentAnimeId);
            }
        });
    });
}

// Load dashboard data
async function loadDashboardData() {
    try {
        // Fetch anime data
        const animeResponse = await fetch(animeUrl);
        const animeData = await animeResponse.json();
        
        // Fetch users data
        const usersResponse = await fetch(usersUrl);
        const usersData = await usersResponse.json();
        
        // Calculate statistics
        const totalAnime = animeData.length;
        let totalEpisodes = 0;
        const genres = new Set();
        
        animeData.forEach(anime => {
            // Count episodes
            totalEpisodes += anime.episodes ? anime.episodes.length : 0;
            
            // Count unique genres
            if (anime.genres) {
                anime.genres.split(',').forEach(genre => {
                    genres.add(genre.trim());
                });
            }
        });
        
        // Update statistics display
        document.getElementById('total-anime').textContent = totalAnime;
        document.getElementById('total-episodes').textContent = totalEpisodes;
        document.getElementById('total-users').textContent = usersData.length;
        document.getElementById('total-genres').textContent = genres.size;
        
        // Display recent anime (last 5)
        const recentAnimeList = document.getElementById('recent-anime-list');
        recentAnimeList.innerHTML = '';
        
        // Sort by most recent and get top 5
        const recentAnime = [...animeData].sort((a, b) => b.id - a.id).slice(0, 5);
        
        recentAnime.forEach(anime => {
            const animeCard = document.createElement('div');
            animeCard.className = 'anime-card';
            animeCard.innerHTML = `
                <img src="${anime.image || '/api/placeholder/150/200'}" alt="${anime.name}">
                <div class="anime-info">
                    <h4>${anime.name}</h4>
                    <p><i class="fas fa-star"></i> ${anime.rating || 'N/A'}</p>
                    <p><i class="fas fa-video"></i> ${anime.episodes ? anime.episodes.length : 0} episodes</p>
                </div>
            `;
            recentAnimeList.appendChild(animeCard);
        });
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showNotification('Failed to load dashboard data', 'error');
    }
}

// Initialize search functionality
function initializeSearch() {
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    
    // Search input event listener
    searchInput.addEventListener('input', async function() {
        const searchTerm = this.value.trim().toLowerCase();
        
        if (searchTerm.length < 2) {
            searchResults.innerHTML = '';
            searchResults.classList.remove('active');
            return;
        }
        
        try {
            const response = await fetch(animeUrl);
            const animeData = await response.json();
            
            // Filter anime based on search term
            const filteredAnime = animeData.filter(anime => 
                anime.name.toLowerCase().includes(searchTerm)
            ).slice(0, 5); // Limit to 5 results
            
            if (filteredAnime.length > 0) {
                searchResults.innerHTML = '';
                searchResults.classList.add('active');
                
                filteredAnime.forEach(anime => {
                    const resultItem = document.createElement('div');
                    resultItem.className = 'search-result-item';
                    resultItem.innerHTML = `
                        <img src="${anime.image || '/api/placeholder/50/70'}" alt="${anime.name}">
                        <div>
                            <h4>${anime.name}</h4>
                            <p><i class="fas fa-star"></i> ${anime.rating || 'N/A'}</p>
                        </div>
                    `;
                    resultItem.addEventListener('click', () => {
                        window.location.href = `anime-info.html?id=${anime.id}`;
                    });
                    searchResults.appendChild(resultItem);
                });
            } else {
                searchResults.innerHTML = '<div class="no-results">No anime found</div>';
                searchResults.classList.add('active');
            }
            
        } catch (error) {
            console.error('Error searching anime:', error);
        }
    });
    
    // Close search results when clicking outside
    document.addEventListener('click', function(event) {
        if (!searchInput.contains(event.target) && !searchResults.contains(event.target)) {
            searchResults.innerHTML = '';
            searchResults.classList.remove('active');
        }
    });
    
    // Anime search functionality
    const animeSearch = document.getElementById('anime-search');
    animeSearch.addEventListener('input', function() {
        const searchTerm = this.value.trim().toLowerCase();
        const animeCards = document.querySelectorAll('.anime-management-card');
        
        animeCards.forEach(card => {
            const animeName = card.querySelector('h3').textContent.toLowerCase();
            if (animeName.includes(searchTerm)) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    });
    
    // User search functionality
    const userSearch = document.getElementById('user-search');
    userSearch.addEventListener('input', function() {
        const searchTerm = this.value.trim().toLowerCase();
        const userRows = document.querySelectorAll('#users-tbody tr');
        
        userRows.forEach(row => {
            const userName = row.querySelector('td:first-child').textContent.toLowerCase();
            const userEmail = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
            
            if (userName.includes(searchTerm) || userEmail.includes(searchTerm)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });
}

// Initialize notification panel
function initializeNotificationPanel() {
    const notificationBtn = document.getElementById('notification-btn');
    const notificationPanel = document.getElementById('notification-panel');
    
    notificationBtn.addEventListener('click', function() {
        notificationPanel.classList.toggle('hidden');
        
        if (!notificationPanel.classList.contains('hidden')) {
            loadNotifications();
        }
    });
    
    // Close panel when clicking outside
    document.addEventListener('click', function(event) {
        if (!notificationBtn.contains(event.target) && !notificationPanel.contains(event.target)) {
            notificationPanel.classList.add('hidden');
        }
    });
}

// Load notifications
async function loadNotifications() {
    const notificationList = document.getElementById('notification-list');
    notificationList.innerHTML = '<div class="loading">Loading notifications...</div>';
    
    try {
        // For demonstration, we'll create notifications based on recent anime additions
        const response = await fetch(animeUrl);
        const animeData = await response.json();
        
        // Get the 5 most recent anime
        const recentAnime = [...animeData].sort((a, b) => b.id - a.id).slice(0, 5);
        
        if (recentAnime.length > 0) {
            notificationList.innerHTML = '';
            
            recentAnime.forEach(anime => {
                const notification = document.createElement('div');
                notification.className = 'notification-item';
                notification.innerHTML = `
                    <div class="notification-content">
                        <h4>New Anime Added</h4>
                        <p>${anime.name} has been added to the library!</p>
                    </div>
                    <div class="notification-time">Just now</div>
                `;
                notificationList.appendChild(notification);
            });
        } else {
            notificationList.innerHTML = '<div class="no-notifications">No new notifications</div>';
        }
        
    } catch (error) {
        console.error('Error loading notifications:', error);
        notificationList.innerHTML = '<div class="error">Failed to load notifications</div>';
    }
}

// Initialize image preview
function initializeImagePreview() {
    // For add anime form
    document.getElementById('anime-image').addEventListener('input', function() {
        const imageUrl = this.value;
        const previewImage = document.getElementById('preview-image');
        
        if (imageUrl) {
            previewImage.src = imageUrl;
            previewImage.onerror = function() {
                previewImage.src = '/api/placeholder/300/400';
            };
        } else {
            previewImage.src = '/api/placeholder/300/400';
        }
    });
    
    // For edit anime form
    document.getElementById('edit-anime-image').addEventListener('input', function() {
        const imageUrl = this.value;
        const previewImage = document.getElementById('edit-preview-image');
        
        if (imageUrl) {
            previewImage.src = imageUrl;
            previewImage.onerror = function() {
                previewImage.src = '/api/placeholder/300/400';
            };
        } else {
            previewImage.src = '/api/placeholder/300/400';
        }
    });
}

// Initialize form submissions
function initializeFormSubmissions() {
    // Add anime form
    const addAnimeForm = document.getElementById('add-anime-form');
    addAnimeForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const animeData = {
            name: document.getElementById('anime-name').value,
            description: document.getElementById('anime-description').value,
            rating: parseFloat(document.getElementById('anime-rating').value),
            genres: document.getElementById('anime-genres').value,
            releaseYear: parseInt(document.getElementById('anime-release-year').value),
            image: document.getElementById('anime-image').value,
            episodes: []
        };
        
        try {
            const response = await fetch(animeUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(animeData)
            });
            
            if (response.ok) {
                showNotification('Anime added successfully!', 'success');
                addAnimeForm.reset();
                document.getElementById('preview-image').src = '/api/placeholder/300/400';
                loadDashboardData();
            } else {
                throw new Error('Failed to add anime');
            }
        } catch (error) {
            console.error('Error adding anime:', error);
            showNotification('Failed to add anime', 'error');
        }
    });
    
    // Edit anime form
    const editAnimeForm = document.getElementById('edit-anime-form');
    editAnimeForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const animeId = document.getElementById('edit-anime-id').value;
        
        const animeData = {
            name: document.getElementById('edit-anime-name').value,
            description: document.getElementById('edit-anime-description').value,
            rating: parseFloat(document.getElementById('edit-anime-rating').value),
            genres: document.getElementById('edit-anime-genres').value,
            releaseYear: parseInt(document.getElementById('edit-anime-release-year').value),
            image: document.getElementById('edit-anime-image').value
        };
        
        try {
            // First get existing anime to preserve episodes
            const getResponse = await fetch(`${animeUrl}/${animeId}`);
            const existingAnime = await getResponse.json();
            
            // Merge data keeping episodes
            const updatedAnime = {
                ...existingAnime,
                ...animeData
            };
            
            const response = await fetch(`${animeUrl}/${animeId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedAnime)
            });
            
            if (response.ok) {
                showNotification('Anime updated successfully!', 'success');
                document.querySelector('.close-modal').click(); // Close modal
                loadAnimeList();
                loadDashboardData();
            } else {
                throw new Error('Failed to update anime');
            }
        } catch (error) {
            console.error('Error updating anime:', error);
            showNotification('Failed to update anime', 'error');
        }
    });
    
    // Delete anime button
    document.getElementById('delete-anime-btn').addEventListener('click', async function() {
        if (!confirm('Are you sure you want to delete this anime? This action cannot be undone.')) {
            return;
        }
        
        const animeId = document.getElementById('edit-anime-id').value;
        
        try {
            const response = await fetch(`${animeUrl}/${animeId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                showNotification('Anime deleted successfully!', 'success');
                document.querySelector('.close-modal').click(); // Close modal
                loadAnimeList();
                loadDashboardData();
            } else {
                throw new Error('Failed to delete anime');
            }
        } catch (error) {
            console.error('Error deleting anime:', error);
            showNotification('Failed to delete anime', 'error');
        }
    });
    
    // Add episode form
    const addEpisodeForm = document.getElementById('add-episode-form');
    addEpisodeForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const animeId = document.getElementById('episode-anime-id').value;
        
        const episodeData = {
            number: parseInt(document.getElementById('episode-number').value),
            title: document.getElementById('episode-title').value,
            video: document.getElementById('episode-video').value
        };
        
        try {
            // First get existing anime
            const getResponse = await fetch(`${animeUrl}/${animeId}`);
            const anime = await getResponse.json();
            
            // Add episode to episodes array
            if (!anime.episodes) {
                anime.episodes = [];
            }
            
            // Check if episode number already exists
            const existingEpisodeIndex = anime.episodes.findIndex(ep => ep.number === episodeData.number);
            
            if (existingEpisodeIndex >= 0) {
                if (!confirm('Episode number already exists. Do you want to overwrite it?')) {
                    return;
                }
                anime.episodes[existingEpisodeIndex] = episodeData;
            } else {
                anime.episodes.push(episodeData);
            }
            
            // Sort episodes by number
            anime.episodes.sort((a, b) => a.number - b.number);
            
            // Update anime with new episode
            const response = await fetch(`${animeUrl}/${animeId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(anime)
            });
            
            if (response.ok) {
                showNotification('Episode added successfully!', 'success');
                addEpisodeForm.reset();
                loadEpisodesList(animeId);
                
                // Switch to episodes tab
                document.querySelector('[data-tab="episodes-list"]').click();
                
                loadDashboardData();
            } else {
                throw new Error('Failed to add episode');
            }
        } catch (error) {
            console.error('Error adding episode:', error);
            showNotification('Failed to add episode', 'error');
        }
    });
}

// Load anime list for management
async function loadAnimeList() {
    const animeManagementList = document.getElementById('anime-management-list');
    animeManagementList.innerHTML = '<div class="loading">Loading anime list...</div>';
    
    try {
        const response = await fetch(animeUrl);
        const animeData = await response.json();
        
        if (animeData.length > 0) {
            animeManagementList.innerHTML = '';
            
            animeData.forEach(anime => {
                const animeCard = document.createElement('div');
                animeCard.className = 'anime-management-card';
                animeCard.innerHTML = `
                    <img src="${anime.image || '/api/placeholder/100/150'}" alt="${anime.name}">
                    <div class="anime-management-info">
                        <h3>${anime.name}</h3>
                        <p><i class="fas fa-star"></i> ${anime.rating || 'N/A'}</p>
                        <p><i class="fas fa-video"></i> ${anime.episodes ? anime.episodes.length : 0} episodes</p>
                        <p><i class="fas fa-tags"></i> ${anime.genres || 'N/A'}</p>
                    </div>
                    <div class="anime-management-actions">
                        <button class="btn-edit" data-id="${anime.id}">Edit</button>
                    </div>
                `;
                animeManagementList.appendChild(animeCard);
                
                // Add event listener to edit button
                const editButton = animeCard.querySelector('.btn-edit');
                editButton.addEventListener('click', () => openAnimeModal(anime.id));
            });
        } else {
            animeManagementList.innerHTML = '<div class="no-results">No anime found</div>';
        }
    } catch (error) {
        console.error('Error loading anime list:', error);
        animeManagementList.innerHTML = '<div class="error">Failed to load anime list</div>';
    }
}

// Load users list for management
async function loadUsersList() {
    const usersTableBody = document.getElementById('users-tbody');
    usersTableBody.innerHTML = '<tr><td colspan="4" class="loading">Loading users...</td></tr>';
    
    try {
        const response = await fetch(usersUrl);
        const usersData = await response.json();
        
        if (usersData.length > 0) {
            usersTableBody.innerHTML = '';
            
            usersData.forEach(user => {
                if (user.email === 'admin@gmail.com') return; // Skip admin user
                
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${user.name || 'N/A'}</td>
                    <td>${user.email || 'N/A'}</td>
                    <td>${user.watchlist ? user.watchlist.length : 0}</td>
                    <td>
                        <button class="btn-view-user" data-id="${user.id}">View</button>
                        <button class="btn-delete-user" data-id="${user.id}">Delete</button>
                    </td>
                `;
                usersTableBody.appendChild(tr);
                
                // Add event listeners
                tr.querySelector('.btn-view-user').addEventListener('click', () => viewUserDetails(user.id));
                tr.querySelector('.btn-delete-user').addEventListener('click', () => deleteUser(user.id));
            });
        } else {
            usersTableBody.innerHTML = '<tr><td colspan="4" class="no-results">No users found</td></tr>';
        }
    } catch (error) {
        console.error('Error loading users list:', error);
        usersTableBody.innerHTML = '<tr><td colspan="4" class="error">Failed to load users</td></tr>';
    }
}

// View user details
async function viewUserDetails(userId) {
    try {
        const response = await fetch(`${usersUrl}/${userId}`);
        const userData = await response.json();
        
        // Create and show user details modal
        const userModal = document.createElement('div');
        userModal.className = 'modal';
        userModal.innerHTML = `
            <div class="modal-content">
                <span class="close-user-modal">&times;</span>
                <h2>User Details</h2>
                <div class="user-details">
                    <p><strong>Name:</strong> ${userData.name || 'N/A'}</p>
                    <p><strong>Email:</strong> ${userData.email || 'N/A'}</p>
                    <p><strong>Phone:</strong> ${userData.phone || 'N/A'}</p>
                </div>
                <div class="user-watchlist">
                    <h3>Watchlist</h3>
                    <div id="user-watchlist-container"></div>
                </div>
            </div>
        `;
        document.body.appendChild(userModal);
        
        // Close modal functionality
        const closeModal = userModal.querySelector('.close-user-modal');
        closeModal.addEventListener('click', () => {
            document.body.removeChild(userModal);
        });
        
        window.addEventListener('click', (event) => {
            if (event.target === userModal) {
                document.body.removeChild(userModal);
            }
        });
        
        // Show modal
        userModal.style.display = 'block';
        
        // Load watchlist
        const watchlistContainer = document.getElementById('user-watchlist-container');
        
        if (userData.watchlist && userData.watchlist.length > 0) {
            watchlistContainer.innerHTML = '<div class="loading">Loading watchlist...</div>';
            
            try {
                const animePromises = userData.watchlist.map(animeId => 
                    fetch(`${animeUrl}/${animeId}`).then(res => res.json())
                );
                
                const animeList = await Promise.all(animePromises);
                
                watchlistContainer.innerHTML = '';
                
                animeList.forEach(anime => {
                    if (!anime.id) return; // Skip if anime not found
                    
                    const watchlistItem = document.createElement('div');
                    watchlistItem.className = 'watchlist-item';
                    watchlistItem.innerHTML = `
                        <img src="${anime.image || '/api/placeholder/50/70'}" alt="${anime.name}">
                        <div>
                            <h4>${anime.name}</h4>
                            <p><i class="fas fa-star"></i> ${anime.rating || 'N/A'}</p>
                        </div>
                    `;
                    watchlistContainer.appendChild(watchlistItem);
                });
                
                if (watchlistContainer.innerHTML === '') {
                    watchlistContainer.innerHTML = '<div class="no-results">No items in watchlist</div>';
                }
                
            } catch (error) {
                console.error('Error loading watchlist:', error);
                watchlistContainer.innerHTML = '<div class="error">Failed to load watchlist</div>';
            }
        } else {
            watchlistContainer.innerHTML = '<div class="no-results">No items in watchlist</div>';
        }
        
    } catch (error) {
        console.error('Error viewing user details:', error);
        showNotification('Failed to load user details', 'error');
    }
}

// Delete user
async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch(`${usersUrl}/${userId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showNotification('User deleted successfully!', 'success');
            loadUsersList();
            loadDashboardData();
        } else {
            throw new Error('Failed to delete user');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        showNotification('Failed to delete user', 'error');
    }
}

// Initialize modals
function initializeModals() {
    const modal = document.getElementById('anime-details-modal');
    const closeModal = document.querySelector('.close-modal');
    
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Open anime modal
async function openAnimeModal(animeId) {
    currentAnimeId = animeId;
    
    try {
        const response = await fetch(`${animeUrl}/${animeId}`);
        const anime = await response.json();
        
        // Update modal title
        document.getElementById('modal-anime-title').textContent = anime.name;
        
        // Update form fields
        document.getElementById('edit-anime-id').value = anime.id;
        document.getElementById('edit-anime-name').value = anime.name;
        document.getElementById('edit-anime-description').value = anime.description || '';
        document.getElementById('edit-anime-rating').value = anime.rating || '';
        document.getElementById('edit-anime-genres').value = anime.genres || '';
        document.getElementById('edit-anime-release-year').value = anime.releaseYear || '';
        document.getElementById('edit-anime-image').value = anime.image || '';
        
        // Update image preview
        const previewImage = document.getElementById('edit-preview-image');
        if (anime.image) {
            previewImage.src = anime.image;
            previewImage.onerror = function() {
                previewImage.src = '/api/placeholder/300/400';
            };
        } else {
            previewImage.src = '/api/placeholder/300/400';
        }
        
        // Update episode anime id
        document.getElementById('episode-anime-id').value = anime.id;
        
        // Reset to first tab
        document.querySelector('.tab-button.active').classList.remove('active');
        document.querySelector('.tab-content.active').classList.remove('active');
        document.querySelector('[data-tab="anime-info"]').classList.add('active');
        document.getElementById('anime-info').classList.add('active');
        
        // Show modal
        document.getElementById('anime-details-modal').style.display = 'block';
        
    } catch (error) {
        console.error('Error opening anime modal:', error);
        showNotification('Failed to load anime details', 'error');
    }
}

// Load episodes list
async function loadEpisodesList(animeId) {
    const episodesTableBody = document.getElementById('episodes-tbody');
    episodesTableBody.innerHTML = '<tr><td colspan="3" class="loading">Loading episodes...</td></tr>';
    
    try {
        const response = await fetch(`${animeUrl}/${animeId}`);
        const anime = await response.json();
        
        if (anime.episodes && anime.episodes.length > 0) {
            episodesTableBody.innerHTML = '';
            
            anime.episodes.forEach(episode => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${episode.number}</td>
                    <td>${episode.title}</td>
                    <td>
                        <button class="btn-edit-episode" data-number="${episode.number}">Edit</button>
                        <button class="btn-delete-episode" data-number="${episode.number}">Delete</button>
                    </td>
                `;
                episodesTableBody.appendChild(tr);
                
                // Add event listeners
                tr.querySelector('.btn-edit-episode').addEventListener('click', () => editEpisode(animeId, episode));
                tr.querySelector('.btn-delete-episode').addEventListener('click', () => deleteEpisode(animeId, episode.number));
            });
        } else {
            episodesTableBody.innerHTML = '<tr><td colspan="3" class="no-results">No episodes found</td></tr>';
        }
    } catch (error) {
        console.error('Error loading episodes list:', error);
        episodesTableBody.innerHTML = '<tr><td colspan="3" class="error">Failed to load episodes</td></tr>';
    }
}

// Edit episode
function editEpisode(animeId, episode) {
    // Fill add episode form with episode data
    document.getElementById('episode-anime-id').value = animeId;
    document.getElementById('episode-number').value = episode.number;
    document.getElementById('episode-title').value = episode.title;
    document.getElementById('episode-video').value = episode.video;
    
    // Switch to add episode tab
    document.querySelector('[data-tab="add-episode"]').click();
}

// Delete episode
async function deleteEpisode(animeId, episodeNumber) {
    if (!confirm('Are you sure you want to delete this episode? This action cannot be undone.')) {
        return;
    }
    
    try {
        // First get existing anime
        const getResponse = await fetch(`${animeUrl}/${animeId}`);
        const anime = await getResponse.json();
        
        // Remove episode from episodes array
        anime.episodes = anime.episodes.filter(ep => ep.number !== episodeNumber);
        
        // Update anime without the deleted episode
        const response = await fetch(`${animeUrl}/${animeId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(anime)
        });
        
        if (response.ok) {
            showNotification('Episode deleted successfully!', 'success');
            loadEpisodesList(animeId);
            loadDashboardData();
        } else {
            throw new Error('Failed to delete episode');
        }
    } catch (error) {
        console.error('Error deleting episode:', error);
        showNotification('Failed to delete episode', 'error');
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification-toast ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <p>${message}</p>
        </div>
        <button class="close-notification">&times;</button>
    `;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('active');
    }, 10);
    
    // Auto hide after 5 seconds
    const hideTimeout = setTimeout(() => {
        hideNotification(notification);
    }, 5000);
    
    // Manual close button
    const closeButton = notification.querySelector('.close-notification');
    closeButton.addEventListener('click', () => {
        clearTimeout(hideTimeout);
        hideNotification(notification);
    });
}

// Hide notification
function hideNotification(notification) {
    notification.classList.remove('active');
    
    // Remove from DOM after animation
    setTimeout(() => {
        document.body.removeChild(notification);
    }, 300);
}

// Logout function
function logout() {
    localStorage.removeItem('User');
    window.location.href = 'auth.html';
    localStorage.clear();
}

// Pagination functions for anime management
function setupPagination(totalItems, itemsPerPage, currentPage, containerSelector, callback) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginationContainer = document.querySelector(containerSelector);
    
    if (!paginationContainer) return;
    
    paginationContainer.innerHTML = '';
    
    // Previous button
    const prevButton = document.createElement('button');
    prevButton.className = 'pagination-btn prev';
    prevButton.innerHTML = '&laquo;';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            callback(currentPage - 1);
        }
    });
    paginationContainer.appendChild(prevButton);
    
    // Page buttons
    const maxPageButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);
    
    if (endPage - startPage + 1 < maxPageButtons) {
        startPage = Math.max(1, endPage - maxPageButtons + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.className = `pagination-btn ${i === currentPage ? 'active' : ''}`;
        pageButton.textContent = i;
        pageButton.addEventListener('click', () => {
            if (i !== currentPage) {
                callback(i);
            }
        });
        paginationContainer.appendChild(pageButton);
    }
    
    // Next button
    const nextButton = document.createElement('button');
    nextButton.className = 'pagination-btn next';
    nextButton.innerHTML = '&raquo;';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            callback(currentPage + 1);
        }
    });
    paginationContainer.appendChild(nextButton);
}

// Function to handle bulk operations
function initializeBulkOperations() {
    // Add bulk operation buttons if they exist
    const bulkDeleteBtn = document.getElementById('bulk-delete-btn');
    if (bulkDeleteBtn) {
        bulkDeleteBtn.addEventListener('click', bulkDeleteAnime);
    }
    
    const selectAllCheckbox = document.getElementById('select-all-anime');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('.anime-checkbox');
            checkboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
            
            updateBulkActionButtons();
        });
    }
}

// Update bulk action buttons state
function updateBulkActionButtons() {
    const anyChecked = document.querySelectorAll('.anime-checkbox:checked').length > 0;
    const bulkDeleteBtn = document.getElementById('bulk-delete-btn');
    
    if (bulkDeleteBtn) {
        bulkDeleteBtn.disabled = !anyChecked;
    }
}

// Bulk delete anime
async function bulkDeleteAnime() {
    const selectedAnime = document.querySelectorAll('.anime-checkbox:checked');
    
    if (selectedAnime.length === 0) {
        showNotification('No anime selected for deletion', 'warning');
        return;
    }
    
    if (!confirm(`Are you sure you want to delete ${selectedAnime.length} anime? This action cannot be undone.`)) {
        return;
    }
    
    const animeIds = Array.from(selectedAnime).map(checkbox => checkbox.dataset.id);
    let successCount = 0;
    let failCount = 0;
    
    // Show loading notification
    showNotification(`Deleting ${animeIds.length} anime...`, 'info');
    
    // Delete each anime
    for (const id of animeIds) {
        try {
            const response = await fetch(`${animeUrl}/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                successCount++;
            } else {
                failCount++;
            }
        } catch (error) {
            console.error(`Error deleting anime ID ${id}:`, error);
            failCount++;
        }
    }
    
    // Show result notification
    if (failCount === 0) {
        showNotification(`Successfully deleted ${successCount} anime`, 'success');
    } else {
        showNotification(`Deleted ${successCount} anime, failed to delete ${failCount} anime`, 'warning');
    }
    
    // Reload anime list
    loadAnimeList();
    loadDashboardData();
}

// Export data functionality
function initializeExportData() {
    const exportBtn = document.getElementById('export-data-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportData);
    }
}

// Export database data
async function exportData() {
    try {
        // Fetch all data
        const animeResponse = await fetch(animeUrl);
        const animeData = await animeResponse.json();
        
        const usersResponse = await fetch(usersUrl);
        const usersData = await usersResponse.json();
        
        // Create export object
        const exportData = {
            anime: animeData,
            users: usersData,
            exportDate: new Date().toISOString()
        };
        
        // Convert to JSON string
        const jsonString = JSON.stringify(exportData, null, 2);
        
        // Create download link
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `animestream_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        // Clean up
        URL.revokeObjectURL(url);
        
        showNotification('Data exported successfully!', 'success');
    } catch (error) {
        console.error('Error exporting data:', error);
        showNotification('Failed to export data', 'error');
    }
}

// Import data functionality
function initializeImportData() {
    const importBtn = document.getElementById('import-data-btn');
    const importFileInput = document.getElementById('import-file');
    
    if (importBtn && importFileInput) {
        importBtn.addEventListener('click', () => {
            importFileInput.click();
        });
        
        importFileInput.addEventListener('change', importData);
    }
}

// Import database data
async function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Reset file input
    event.target.value = '';
    
    if (file.type !== 'application/json') {
        showNotification('Please select a JSON file', 'error');
        return;
    }
    
    try {
        // Read file
        const reader = new FileReader();
        
        reader.onload = async function(e) {
            try {
                const importData = JSON.parse(e.target.result);
                
                if (!importData.anime || !importData.users) {
                    showNotification('Invalid data format', 'error');
                    return;
                }
                
                if (!confirm('This will overwrite your current database. Continue?')) {
                    return;
                }
                
                // Show loading notification
                showNotification('Importing data...', 'info');
                
                // Process anime data
                for (const anime of importData.anime) {
                    try {
                        // Check if anime exists
                        const checkResponse = await fetch(`${animeUrl}/${anime.id}`);
                        
                        if (checkResponse.ok) {
                            // Update existing anime
                            await fetch(`${animeUrl}/${anime.id}`, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(anime)
                            });
                        } else {
                            // Add new anime
                            await fetch(animeUrl, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(anime)
                            });
                        }
                    } catch (error) {
                        console.error(`Error importing anime ID ${anime.id}:`, error);
                    }
                }
                
                // Process users data
                for (const user of importData.users) {
                    try {
                        // Check if user exists
                        const checkResponse = await fetch(`${usersUrl}/${user.id}`);
                        
                        if (checkResponse.ok) {
                            // Update existing user
                            await fetch(`${usersUrl}/${user.id}`, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(user)
                            });
                        } else {
                            // Add new user
                            await fetch(usersUrl, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(user)
                            });
                        }
                    } catch (error) {
                        console.error(`Error importing user ID ${user.id}:`, error);
                    }
                }
                
                showNotification('Data imported successfully!', 'success');
                
                // Reload data
                loadDashboardData();
                loadAnimeList();
                loadUsersList();
                
            } catch (parseError) {
                console.error('Error parsing JSON:', parseError);
                showNotification('Failed to parse import file', 'error');
            }
        };
        
        reader.readAsText(file);
        
    } catch (error) {
        console.error('Error importing data:', error);
        showNotification('Failed to import data', 'error');
    }
}

// Initialize additional functionalities when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Call additional init functions
    initializeBulkOperations();
    initializeExportData();
    initializeImportData();
});

console.log("done");