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
    const loggedInUser = JSON.parse(localStorage.getItem('currentUser')) || {};
    
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
            
            // Count unique genres (now handling as array)
            if (anime.genera && Array.isArray(anime.genera)) {
                anime.genera.forEach(genre => {
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
        const recentAnime = [...animeData].sort((a, b) => {
            // Convert IDs to numbers for proper comparison
            const idA = parseInt(a.id);
            const idB = parseInt(b.id);
            return idB - idA;
        }).slice(0, 5);
        
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
                        // Ensure ID is passed consistently
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
        const recentAnime = [...animeData].sort((a, b) => {
            // Convert IDs to numbers for proper comparison
            const idA = parseInt(a.id);
            const idB = parseInt(b.id);
            return idB - idA;
        }).slice(0, 5);
        
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
        
        // Parse input genres into an array
        const genresInput = document.getElementById('anime-genres').value;
        const genresArray = genresInput.split(',').map(genre => genre.trim()).filter(genre => genre !== '');
        
        const animeData = {
            name: document.getElementById('anime-name').value,
            description: document.getElementById('anime-description').value,
            rating: parseFloat(document.getElementById('anime-rating').value),
            genera: genresArray, // Changed from genres string to genera array
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
        
        // Parse input genres into an array
        const genresInput = document.getElementById('edit-anime-genres').value;
        const genresArray = genresInput.split(',').map(genre => genre.trim()).filter(genre => genre !== '');
        
        const animeData = {
            name: document.getElementById('edit-anime-name').value,
            description: document.getElementById('edit-anime-description').value,
            rating: parseFloat(document.getElementById('edit-anime-rating').value),
            genera: genresArray, // Changed from genres string to genera array
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
            
            // Ensure id remains the same type as in the original data
            updatedAnime.id = existingAnime.id;
            
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
            
            // Ensure anime id remains the same type as in the original data
            anime.id = animeId;
            
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
                
                // Format genera array to display
                const generaDisplay = anime.genera && Array.isArray(anime.genera) 
                    ? anime.genera.join(', ') 
                    : 'N/A';
                
                animeCard.innerHTML = `
                    <img src="${anime.image || '/api/placeholder/100/150'}" alt="${anime.name}">
                    <div class="anime-management-info">
                        <h3>${anime.name}</h3>
                        <p><i class="fas fa-star"></i> ${anime.rating || 'N/A'}</p>
                        <p><i class="fas fa-video"></i> ${anime.episodes ? anime.episodes.length : 0} episodes</p>
                        <p><i class="fas fa-tags"></i> ${generaDisplay}</p>
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
                // Ensure all IDs are treated as strings for consistent API requests
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
        
        // Convert genera array to string for form input
        const generaString = anime.genera && Array.isArray(anime.genera) 
            ? anime.genera.join(', ') 
            : '';
        document.getElementById('edit-anime-genres').value = generaString;
        
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
                tr.querySelector('.btn-edit-episode').addEventListener('click', () => editEpisode(animeId, episode.number));
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
async function editEpisode(animeId, episodeNumber) {
    try {
        const response = await fetch(`${animeUrl}/${animeId}`);
        const anime = await response.json();
        
        // Find episode
        const episode = anime.episodes.find(ep => ep.number === episodeNumber);
        
        if (episode) {
            // Fill form
            document.getElementById('episode-anime-id').value = animeId;
            document.getElementById('episode-number').value = episode.number;
            document.getElementById('episode-title').value = episode.title;
            document.getElementById('episode-video').value = episode.video;
            
            // Switch to add episode tab
            document.querySelector('[data-tab="add-episode"]').click();
            
            // Focus on form
            document.getElementById('episode-title').focus();
        } else {
            showNotification('Episode not found', 'error');
        }
    } catch (error) {
        console.error('Error editing episode:', error);
        showNotification('Failed to edit episode', 'error');
    }
}

// Delete episode
async function deleteEpisode(animeId, episodeNumber) {
    if (!confirm('Are you sure you want to delete this episode? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch(`${animeUrl}/${animeId}`);
        const anime = await response.json();
        
        // Remove episode
        anime.episodes = anime.episodes.filter(ep => ep.number !== episodeNumber);
        
        // Update anime
        await fetch(`${animeUrl}/${animeId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(anime)
        });
        
        showNotification('Episode deleted successfully!', 'success');
        loadEpisodesList(animeId);
        loadDashboardData();
    } catch (error) {
        console.error('Error deleting episode:', error);
        showNotification('Failed to delete episode', 'error');
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = message;
    
    document.body.appendChild(notification);
    
    // Slide in
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Remove after timeout
    setTimeout(() => {
        notification.classList.remove('show');
        
        // Remove from DOM after animation
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'auth.html';
}

// Pagination
function setupPagination(itemsCount, itemsPerPage, currentPage, containerElement, updateFunction) {
    const totalPages = Math.ceil(itemsCount / itemsPerPage);
    containerElement.innerHTML = '';
    
    // Previous button
    const prevButton = document.createElement('button');
    prevButton.innerHTML = '&laquo;';
    prevButton.classList.add('pagination-btn');
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            updateFunction(currentPage - 1);
        }
    });
    containerElement.appendChild(prevButton);
    
    // Page buttons
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.classList.add('pagination-btn');
        
        if (i === currentPage) {
            pageButton.classList.add('active');
        }
        
        pageButton.addEventListener('click', () => {
            updateFunction(i);
        });
        
        containerElement.appendChild(pageButton);
    }
    
    // Next button
    const nextButton = document.createElement('button');
    nextButton.innerHTML = '&raquo;';
    nextButton.classList.add('pagination-btn');
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            updateFunction(currentPage + 1);
        }
    });
    containerElement.appendChild(nextButton);
}

// Format date helper
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Truncate text helper
function truncateText(text, maxLength) {
    if (text.length > maxLength) {
        return text.substring(0, maxLength) + '...';
    }
    return text;
}

// Export functions - useful if needed for other scripts
window.adminFunctions = {
    loadAnimeList,
    loadUsersList,
    openAnimeModal,
    loadDashboardData
};