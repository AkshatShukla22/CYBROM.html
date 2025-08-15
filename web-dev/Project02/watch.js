// watch.js
// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const searchResults = document.getElementById('searchResults');
const notificationBtn = document.getElementById('notificationBtn');
const notificationPanel = document.getElementById('notificationPanel');
const notificationList = document.getElementById('notificationList');
const userBtn = document.getElementById('userBtn');
const loginBtn = document.getElementById('loginBtn');
const videoPlayer = document.getElementById('video-player');
const animeTitle = document.getElementById('anime-title');
const episodeTitle = document.getElementById('episode-title');
const episodeRating = document.getElementById('episode-rating');
const addToWatchlistBtn = document.getElementById('add-to-watchlist');
const shareButton = document.getElementById('share-button');
const episodesList = document.getElementById('episodes-list');
const recommendationsList = document.getElementById('recommendations-list');
const similarGenreList = document.getElementById('similar-genre-list');
const similarGenreTitle = document.getElementById('similar-genre-title');

// Global variables
let currentAnime = null;
let currentEpisode = null;
let animeData = [];
let userData = null;

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    console.log('Page loaded, initializing...');
    checkUserLogin();
    loadAnimeData();
    setupEventListeners();
});

// Check if user is logged in
function checkUserLogin() {
    try {
        const loggedInUser = localStorage.getItem('currentUser');
        const userBtn = document.getElementById('userBtn');
        const loginBtn = document.getElementById('loginBtn');
        
        if (loggedInUser) {
            // User is logged in
            userData = JSON.parse(loggedInUser);
            console.log('User is logged in:', userData);
            
            // Show user button, hide login button
            if (userBtn) {
                userBtn.classList.remove('hidden');
                userBtn.style.display = 'block'; // Fallback for CSS display
            }
            if (loginBtn) {
                loginBtn.classList.add('hidden');
                loginBtn.style.display = 'none'; // Fallback for CSS display
            }
            
            // Load user-specific data
            loadUserNotifications();
            
        } else {
            // User is not logged in
            console.log('No user logged in');
            userData = null;
            
            // Hide user button, show login button
            if (userBtn) {
                userBtn.classList.add('hidden');
                userBtn.style.display = 'none'; // Fallback for CSS display
            }
            if (loginBtn) {
                loginBtn.classList.remove('hidden');
                loginBtn.style.display = 'block'; // Fallback for CSS display
            }
        }
        
        // Update other UI elements based on login status
        updateUIForLoginStatus();
        
    } catch (error) {
        console.error('Error checking user login status:', error);
        
        // On error, default to logged out state
        userData = null;
        const userBtn = document.getElementById('userBtn');
        const loginBtn = document.getElementById('loginBtn');
        
        if (userBtn) {
            userBtn.classList.add('hidden');
            userBtn.style.display = 'none';
        }
        if (loginBtn) {
            loginBtn.classList.remove('hidden');
            loginBtn.style.display = 'block';
        }
    }
}

// New function to update UI elements based on login status
function updateUIForLoginStatus() {
    // Update watchlist button text if user is logged in and anime is loaded
    if (addToWatchlistBtn && currentAnime) {
        if (userData && userData.watchlist && userData.watchlist.includes(currentAnime.id)) {
            addToWatchlistBtn.innerHTML = '<i class="fas fa-check"></i> In Watchlist';
        } else {
            addToWatchlistBtn.innerHTML = '<i class="fas fa-plus"></i> Add to Watchlist';
        }
    }
    
    // Update notification button visibility
    const notificationBtn = document.getElementById('notificationBtn');
    if (notificationBtn) {
        if (userData) {
            notificationBtn.classList.remove('hidden');
            notificationBtn.style.display = 'block';
        } else {
            notificationBtn.classList.add('hidden');
            notificationBtn.style.display = 'none';
        }
    }
}

// Load anime data from db.json
function loadAnimeData() {
    fetch('db.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            if (data && data.anime && Array.isArray(data.anime)) {
                animeData = data.anime;
                console.log('Anime data loaded successfully:', animeData.length + ' entries found');
                loadCurrentAnimeFromURL();
            } else {
                console.error('Error: anime data not found or not in expected format');
                loadSampleData();
            }
        })
        .catch(error => {
            console.error('Error loading anime data:', error);
            loadSampleData();
        });
}

// Load sample data for demonstration purposes
function loadSampleData() {
    console.log('Loading sample data as fallback');
    animeData = [
        {
            id: "1",
            name: "Demon Slayer",
            description: "A boy who sells coal becomes a demon slayer after his family is slaughtered.",
            genera: ["action", "adventure", "fantasy"],
            rating: 4.8,
            image: "assets/images/demon_slayer.jpg",
            episodes: [
                {
                    number: 1,
                    title: "Cruelty",
                    videoSrc: "assets/videos/demon_slayer_ep1.mp4",
                    rating: 4.7
                },
                {
                    number: 2,
                    title: "Trainer Sakonji Urokodaki",
                    videoSrc: "assets/videos/demon_slayer_ep2.mp4",
                    rating: 4.8
                },
                {
                    number: 3,
                    title: "Sabito and Makomo",
                    videoSrc: "assets/videos/demon_slayer_ep3.mp4",
                    rating: 4.9
                }
            ]
        },
        {
            id: "2",
            name: "Attack on Titan",
            description: "Humanity fights for survival against giant humanoid Titans.",
            genera: ["action", "drama", "horror"],
            rating: 4.9,
            image: "assets/images/attack_on_titan.jpg",
            episodes: [
                {
                    number: 1,
                    title: "To You, 2000 Years From Now",
                    videoSrc: "assets/videos/aot_ep1.mp4",
                    rating: 4.8
                },
                {
                    number: 2,
                    title: "That Day",
                    videoSrc: "assets/videos/aot_ep2.mp4",
                    rating: 4.9
                }
            ]
        }
    ];
    
    loadCurrentAnimeFromURL();
}

// Set up event listeners
function setupEventListeners() {
    // Search functionality
    if(searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
    
    if(searchBtn) {
        searchBtn.addEventListener('click', () => {
            if (searchInput && searchInput.value.trim() !== '') {
                handleSearch();
            }
        });
    }
    
    // Notification button
    if(notificationBtn) {
        notificationBtn.addEventListener('click', toggleNotificationPanel);
    }
    
    // Login button
    if(loginBtn) {
        loginBtn.addEventListener('click', () => {
            window.location.href = 'auth.html';
        });
    }
    
    // User button
    if(userBtn) {
        userBtn.addEventListener('click', () => {
            window.location.href = 'user.html';
        });
    }
    
    // Add to watchlist button
    if(addToWatchlistBtn) {
        addToWatchlistBtn.addEventListener('click', addToWatchlist);
    }
    
    // Share button
    if(shareButton) {
        shareButton.addEventListener('click', shareAnime);
    }
    
    // Close notification panel when clicking outside
    document.addEventListener('click', (e) => {
        if (notificationBtn && notificationPanel && 
            !notificationBtn.contains(e.target) && 
            !notificationPanel.contains(e.target)) {
            notificationPanel.classList.remove('active');
        }
    });
}

// Toggle notification panel
function toggleNotificationPanel() {
    if(notificationPanel) {
        notificationPanel.classList.toggle('active');
    }
}

// Load user notifications
function loadUserNotifications() {
    if (!userData || !notificationList) return;
    
    notificationList.innerHTML = '';
    
    // Check if user has a watchlist
    if (userData.watchlist && userData.watchlist.length > 0) {
        // For each anime in watchlist, check if there are new episodes
        userData.watchlist.forEach(animeId => {
            const anime = animeData.find(a => a.id === animeId);
            if (anime) {
                const notificationItem = document.createElement('div');
                notificationItem.classList.add('notification-item');
                notificationItem.innerHTML = `
                    <p>New episode of <strong>${anime.name}</strong> is available!</p>
                    <p class="notification-time">1 day ago</p>
                `;
                notificationItem.addEventListener('click', () => {
                    window.location.href = `anime_info.html?id=${anime.id}`;
                });
                notificationList.appendChild(notificationItem);
            }
        });
    } else {
        // No notifications
        const emptyNotification = document.createElement('div');
        emptyNotification.classList.add('notification-item');
        emptyNotification.innerHTML = `
            <p>You have no notifications.</p>
        `;
        notificationList.appendChild(emptyNotification);
    }
}

// Handle search functionality
function handleSearch() {
    if(!searchInput || !searchResults) return;
    
    const searchTerm = searchInput.value.trim().toLowerCase();
    
    if (searchTerm === '') {
        searchResults.classList.remove('active');
        return;
    }
    
    const filteredAnime = animeData.filter(anime => 
        anime.name.toLowerCase().includes(searchTerm)
    );
    
    searchResults.innerHTML = '';
    
    if (filteredAnime.length > 0) {
        filteredAnime.forEach(anime => {
            const resultItem = document.createElement('div');
            resultItem.classList.add('search-result-item');
            resultItem.innerHTML = `
                <img src="${anime.image}" alt="${anime.name}">
                <div class="search-result-info">
                    <h4>${anime.name}</h4>
                    <p>Rating: ${anime.rating} ★</p>
                </div>
            `;
            resultItem.addEventListener('click', () => {
                window.location.href = `anime_info.html?id=${anime.id}`;
            });
            searchResults.appendChild(resultItem);
        });
        searchResults.classList.add('active');
    } else {
        const noResults = document.createElement('div');
        noResults.classList.add('search-result-item');
        noResults.textContent = 'No results found';
        searchResults.appendChild(noResults);
        searchResults.classList.add('active');
    }
}

// Load current anime from URL parameters
function loadCurrentAnimeFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Parse animeId from URL parameters as string
    let animeId = urlParams.get('id');
    // Set default if not provided
    if (!animeId) animeId = "1";
    
    // Parse episodeNumber from URL parameters
    let episodeNumber = urlParams.get('ep');
    // If episodeNumber exists, convert to integer
    episodeNumber = episodeNumber ? parseInt(episodeNumber) : 1;
    
    console.log(`Loading anime ID: ${animeId}, episode: ${episodeNumber}`);
    
    // Find anime by ID (now comparing strings)
    currentAnime = animeData.find(anime => anime.id === animeId);
    
    if (currentAnime) {
        console.log(`Found anime: ${currentAnime.name}`);
        
        // Find episode by number
        currentEpisode = currentAnime.episodes.find(ep => ep.number === episodeNumber);
        
        if (!currentEpisode && currentAnime.episodes.length > 0) {
            // If episode not found, use the first episode
            currentEpisode = currentAnime.episodes[0];
            console.log(`Episode ${episodeNumber} not found, using first episode instead`);
        }
        
        if (currentEpisode) {
            console.log(`Found episode: ${currentEpisode.title}`);
            updatePageContent();
            loadEpisodesList();
            loadRecommendations();
            loadSimilarGenreAnime();
            
            // Check if there's a saved watch progress for this episode
            checkWatchProgress();
        } else {
            console.error(`No episodes found for anime: ${currentAnime.name}`);
            showErrorMessage('No episodes available for this anime');
        }
    } else {
        console.error(`Anime with ID ${animeId} not found`);
        // Show error message instead of redirecting
        showErrorMessage(`Anime with ID ${animeId} not found`);
    }
}

// Check if there's a saved watch progress for this episode
function checkWatchProgress() {
    if (!userData || !currentAnime || !currentEpisode || !videoPlayer) return;
    
    const watchProgressKey = `watchProgress_${currentAnime.id}_${currentEpisode.number}`;
    const savedProgress = localStorage.getItem(watchProgressKey);
    
    if (savedProgress) {
        const progress = parseFloat(savedProgress);
        
        // Wait for video metadata to be loaded
        videoPlayer.addEventListener('loadedmetadata', () => {
            // Only resume if progress is greater than 10 seconds and less than 95% of the video
            if (progress > 10 && progress < (videoPlayer.duration * 0.95)) {
                // Show resume watching overlay
                const resumeOverlay = document.createElement('div');
                resumeOverlay.classList.add('resume-overlay');
                resumeOverlay.innerHTML = `
                    <div class="resume-content">
                        <h3>Resume Watching</h3>
                        <p>Would you like to continue from where you left off?</p>
                        <div class="resume-buttons">
                            <button id="resume-yes">Yes</button>
                            <button id="resume-no">No, Start from Beginning</button>
                        </div>
                    </div>
                `;
                
                videoPlayer.parentNode.appendChild(resumeOverlay);
                
                // Resume button
                document.getElementById('resume-yes')?.addEventListener('click', () => {
                    videoPlayer.currentTime = progress;
                    resumeOverlay.remove();
                    videoPlayer.play();
                });
                
                // Start from beginning button
                document.getElementById('resume-no')?.addEventListener('click', () => {
                    resumeOverlay.remove();
                    videoPlayer.play();
                });
            }
        });
    }
}

// Show error message on the page
function showErrorMessage(message) {
    // Create error container if it doesn't exist
    let errorContainer = document.getElementById('error-container');
    
    if (!errorContainer) {
        errorContainer = document.createElement('div');
        errorContainer.id = 'error-container';
        errorContainer.style.cssText = 'background-color: #ff5252; color: white; padding: 15px; margin: 20px; border-radius: 5px; text-align: center;';
        
        // Insert after video player or at the beginning of the content
        const contentContainer = document.querySelector('.content-container') || document.body;
        contentContainer.insertBefore(errorContainer, contentContainer.firstChild);
    }
    
    errorContainer.innerHTML = `
        <h3>Error</h3>
        <p>${message}</p>
        <p>Please check the anime ID in the URL or <a href="index.html">return to home page</a></p>
    `;
}

// Update page content with current anime and episode data
function updatePageContent() {
    if (!currentAnime || !currentEpisode) {
        console.error('Cannot update page content: currentAnime or currentEpisode is null');
        return;
    }
    
    // Update title and meta information
    document.title = `${currentAnime.name} - Episode ${currentEpisode.number} | AniStream`;
    
    // Check if elements exist before updating them
    if (animeTitle) animeTitle.textContent = currentAnime.name;
    if (episodeTitle) episodeTitle.textContent = `Episode ${currentEpisode.number}: ${currentEpisode.title}`;
    if (episodeRating) episodeRating.textContent = currentEpisode.rating;
    
    // Update video player
    if (videoPlayer) {
        videoPlayer.setAttribute('src', currentEpisode.videoSrc);
        videoPlayer.load(); // Reload video with new source
    }
    
    // Update watchlist button text based on whether anime is in user's watchlist
    if (addToWatchlistBtn) {
        if (userData && userData.watchlist && userData.watchlist.includes(currentAnime.id)) {
            addToWatchlistBtn.innerHTML = '<i class="fas fa-check"></i> In Watchlist';
        } else {
            addToWatchlistBtn.innerHTML = '<i class="fas fa-plus"></i> Add to Watchlist';
        }
    }
}

// Load episodes list
function loadEpisodesList() {
    if (!currentAnime || !episodesList) return;
    
    episodesList.innerHTML = '';
    
    currentAnime.episodes.forEach(episode => {
        const episodeItem = document.createElement('div');
        episodeItem.classList.add('episode-item');
        
        // Highlight current episode
        if (currentEpisode && episode.number === currentEpisode.number) {
            episodeItem.classList.add('active');
        }
        
        episodeItem.innerHTML = `
            <h3>Episode ${episode.number}</h3>
            <p>${episode.title}</p>
        `;
        
        episodeItem.addEventListener('click', () => {
            window.location.href = `watch.html?id=${currentAnime.id}&ep=${episode.number}`;
        });
        
        episodesList.appendChild(episodeItem);
    });
}

// Load recommendations
function loadRecommendations() {
    if (!animeData || animeData.length === 0 || !recommendationsList || !currentAnime) {
        console.log("Cannot load recommendations - missing data:", {
            animeDataExists: !!animeData,
            animeDataLength: animeData?.length,
            recommendationsListExists: !!recommendationsList,
            currentAnimeExists: !!currentAnime
        });
        return;
    }
    
    console.log("Loading recommendations...");
    recommendationsList.innerHTML = '';
    
    // Filter out current anime and get random 6 anime
    const recommendations = animeData
        .filter(anime => anime.id !== currentAnime.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 6);
        
    console.log(`Found ${recommendations.length} recommendations`);
    
    if (recommendations.length > 0) {
        recommendations.forEach(anime => {
            createAnimeCard(anime, recommendationsList);
        });
    } else {
        recommendationsList.innerHTML = '<p>No recommendations available</p>';
    }
}

// Load similar genre anime
function loadSimilarGenreAnime() {
    if (!currentAnime || !animeData || animeData.length === 0 || !similarGenreList || !similarGenreTitle) return;
    
    similarGenreList.innerHTML = '';
    
    // Get the first genre of current anime
    if (currentAnime.genera && currentAnime.genera.length > 0) {
        const primaryGenre = currentAnime.genera[0];
        similarGenreTitle.textContent = `More ${primaryGenre.charAt(0).toUpperCase() + primaryGenre.slice(1)} Anime`;
        
        // Filter anime with the same primary genre
        const similarAnime = animeData
            .filter(anime => anime.id !== currentAnime.id && anime.genera && anime.genera.includes(primaryGenre))
            .slice(0, 6);
        
        if (similarAnime.length > 0) {
            similarAnime.forEach(anime => {
                createAnimeCard(anime, similarGenreList);
            });
        } else {
            similarGenreList.innerHTML = '<p>No similar anime found</p>';
        }
    }
}

// Create anime card
function createAnimeCard(anime, container) {
    if (!anime || !container) return;
    
    const animeCard = document.createElement('div');
    animeCard.classList.add('anime-card');
    
    // Default image if none is provided
    const imageSrc = anime.image || 'assets/images/placeholder.jpg';
    
    animeCard.innerHTML = `
        <img src="${imageSrc}" alt="${anime.name}" onerror="this.src='assets/images/placeholder.jpg'">
        <div class="anime-card-info">
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
}

// Add current anime to watchlist
function addToWatchlist() {
    if (!userData) {
        // Redirect to login if user is not logged in
        window.location.href = 'auth.html';
        return;
    }
    
    if (!currentAnime) {
        showToast('Error: No anime selected');
        return;
    }
    
    // Initialize watchlist if it doesn't exist
    if (!userData.watchlist) {
        userData.watchlist = [];
    }
    
    // Check if anime is already in watchlist
    const animeIndex = userData.watchlist.indexOf(currentAnime.id);
    
    if (animeIndex === -1) {
        // Add anime to watchlist
        userData.watchlist.push(currentAnime.id);
        if (addToWatchlistBtn) {
            addToWatchlistBtn.innerHTML = '<i class="fas fa-check"></i> In Watchlist';
        }
        showToast('Added to watchlist');
    } else {
        // Remove anime from watchlist
        userData.watchlist.splice(animeIndex, 1);
        if (addToWatchlistBtn) {
            addToWatchlistBtn.innerHTML = '<i class="fas fa-plus"></i> Add to Watchlist';
        }
        showToast('Removed from watchlist');
    }
    
    // Update user data in localStorage
    localStorage.setItem('currentUser', JSON.stringify(userData));
    
    // Update user data in db.json (in a real implementation)
    updateUserDataInDB();
}

// Share current anime
function shareAnime() {
    // Create a temporary input element
    const tempInput = document.createElement('input');
    
    // Set its value to the current URL
    tempInput.value = window.location.href;
    
    // Append it to the body
    document.body.appendChild(tempInput);
    
    // Select the input value
    tempInput.select();
    
    // Copy the selected value to clipboard
    document.execCommand('copy');
    
    // Remove the temporary element
    document.body.removeChild(tempInput);
    
    // Show confirmation toast
    showToast('Link copied to clipboard');
}

// Show toast message
function showToast(message) {
    // Check if toast container exists, if not create it
    let toastContainer = document.getElementById('toast-container');
    
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast message
    const toast = document.createElement('div');
    toast.classList.add('toast');
    toast.textContent = message;
    
    // Add toast to container
    toastContainer.appendChild(toast);
    
    // Show toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// Update user data in db.json
function updateUserDataInDB() {
    // Log the update operation
    console.log('Updating user data in DB:', userData);
    
    // First fetch the current db.json
    fetch('db.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch db.json');
            }
            return response.json();
        })
        .then(data => {
            // Find the user in the db and update
            if (data.users && Array.isArray(data.users)) {
                const userIndex = data.users.findIndex(u => u.email === userData.email);
                
                if (userIndex !== -1) {
                    // Update user data in the db object
                    data.users[userIndex] = {
                        ...data.users[userIndex],
                        watchlist: userData.watchlist
                    };
                    
                    // Write back to db.json
                    // Note: In a real implementation, this would be a server-side API call
                    // This is just for local development and won't actually work in a browser
                    // due to security restrictions
                    console.log('User data updated in memory, would save to db.json in real implementation');
                } else {
                    console.error('User not found in db.json');
                }
            } else {
                console.error('Users array not found in db.json');
            }
        })
        .catch(error => {
            console.error('Error updating user data:', error);
        });
}

// Add video player controls and functionality
document.addEventListener('DOMContentLoaded', () => {
    // Video player controls
    const playPauseBtn = document.getElementById('play-pause');
    const muteBtn = document.getElementById('mute');
    const fullscreenBtn = document.getElementById('fullscreen');
    const volumeSlider = document.getElementById('volume-slider');
    const progressBar = document.getElementById('progress-bar');
    const currentTimeDisplay = document.getElementById('current-time');
    const durationDisplay = document.getElementById('duration');
    
    // Initialize player controls
    if (videoPlayer) {
        // Play/Pause
        if (playPauseBtn) {
            playPauseBtn.addEventListener('click', togglePlayPause);
            videoPlayer.addEventListener('click', togglePlayPause);
        }
        
        // Mute/Unmute
        if (muteBtn) {
            muteBtn.addEventListener('click', toggleMute);
        }
        
        // Volume control
        if (volumeSlider) {
            volumeSlider.addEventListener('input', updateVolume);
        }
        
        // Fullscreen
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', toggleFullscreen);
        }
        
        // Progress bar
        if (progressBar) {
            videoPlayer.addEventListener('timeupdate', updateProgressBar);
            progressBar.addEventListener('click', seek);
        }
        
        // Time displays
        if (currentTimeDisplay && durationDisplay) {
            videoPlayer.addEventListener('loadedmetadata', updateTimeDisplay);
            videoPlayer.addEventListener('timeupdate', updateTimeDisplay);
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', handleKeyboardShortcuts);
    }
});

// Toggle play/pause
function togglePlayPause() {
    const playPauseBtn = document.getElementById('play-pause');
    if (!videoPlayer) return;
    
    if (videoPlayer.paused) {
        videoPlayer.play();
        if (playPauseBtn) playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    } else {
        videoPlayer.pause();
        if (playPauseBtn) playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
}

// Toggle mute
function toggleMute() {
    const muteBtn = document.getElementById('mute');
    const volumeSlider = document.getElementById('volume-slider');
    if (!videoPlayer) return;
    
    videoPlayer.muted = !videoPlayer.muted;
    
    if (muteBtn) {
        if (videoPlayer.muted) {
            muteBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
            if (volumeSlider) volumeSlider.value = 0;
        } else {
            muteBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
            if (volumeSlider) volumeSlider.value = videoPlayer.volume;
        }
    }
}

// Update volume
function updateVolume() {
    const volumeSlider = document.getElementById('volume-slider');
    const muteBtn = document.getElementById('mute');
    if (!videoPlayer || !volumeSlider) return;
    
    videoPlayer.volume = volumeSlider.value;
    
    if (muteBtn) {
        if (videoPlayer.volume === 0) {
            videoPlayer.muted = true;
            muteBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
        } else {
            videoPlayer.muted = false;
            muteBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
        }
    }
}

// Toggle fullscreen
function toggleFullscreen() {
    if (!videoPlayer) return;
    
    if (!document.fullscreenElement) {
        if (videoPlayer.requestFullscreen) {
            videoPlayer.requestFullscreen();
        } else if (videoPlayer.webkitRequestFullscreen) {
            videoPlayer.webkitRequestFullscreen();
        } else if (videoPlayer.msRequestFullscreen) {
            videoPlayer.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
}

// Update progress bar
function updateProgressBar() {
    const progressBar = document.getElementById('progress-bar');
    if (!videoPlayer || !progressBar) return;
    
    if (videoPlayer.duration) {
        const percentage = (videoPlayer.currentTime / videoPlayer.duration) * 100;
        progressBar.value = percentage;
    }
}

// Seek to position
function seek(e) {
    const progressBar = document.getElementById('progress-bar');
    if (!videoPlayer || !progressBar) return;
    
    const position = e.offsetX / progressBar.offsetWidth;
    videoPlayer.currentTime = position * videoPlayer.duration;
}

// Update time display
function updateTimeDisplay() {
    const currentTimeDisplay = document.getElementById('current-time');
    const durationDisplay = document.getElementById('duration');
    if (!videoPlayer || !currentTimeDisplay || !durationDisplay) return;
    
    // Format current time
    const currentMinutes = Math.floor(videoPlayer.currentTime / 60);
    const currentSeconds = Math.floor(videoPlayer.currentTime % 60);
    currentTimeDisplay.textContent = `${currentMinutes}:${currentSeconds < 10 ? '0' : ''}${currentSeconds}`;
    
    // Format duration
    if (!isNaN(videoPlayer.duration)) {
        const durationMinutes = Math.floor(videoPlayer.duration / 60);
        const durationSeconds = Math.floor(videoPlayer.duration % 60);
        durationDisplay.textContent = `${durationMinutes}:${durationSeconds < 10 ? '0' : ''}${durationSeconds}`;
    }
}

// Handle keyboard shortcuts
function handleKeyboardShortcuts(e) {
    if (!videoPlayer) return;
    
    switch (e.key) {
        case ' ':
            // Space bar: toggle play/pause
            togglePlayPause();
            e.preventDefault();
            break;
        case 'ArrowLeft':
            // Left arrow: rewind 10 seconds
            videoPlayer.currentTime -= 10;
            e.preventDefault();
            break;
        case 'ArrowRight':
            // Right arrow: forward 10 seconds
           videoPlayer.currentTime += 10;
            e.preventDefault();
            break;
        case 'f':
            // F key: toggle fullscreen
            toggleFullscreen();
            e.preventDefault();
            break;
        case 'm':
            // M key: toggle mute
            toggleMute();
            e.preventDefault();
            break;
        case 'ArrowUp':
            // Up arrow: increase volume
            if (videoPlayer.volume < 1) {
                videoPlayer.volume = Math.min(1, videoPlayer.volume + 0.1);
                const volumeSlider = document.getElementById('volume-slider');
                if (volumeSlider) volumeSlider.value = videoPlayer.volume;
                videoPlayer.muted = false;
                const muteBtn = document.getElementById('mute');
                if (muteBtn) muteBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
            }
            e.preventDefault();
            break;
        case 'ArrowDown':
            // Down arrow: decrease volume
            if (videoPlayer.volume > 0) {
                videoPlayer.volume = Math.max(0, videoPlayer.volume - 0.1);
                const volumeSlider = document.getElementById('volume-slider');
                if (volumeSlider) volumeSlider.value = videoPlayer.volume;
                const muteBtn = document.getElementById('mute');
                if (muteBtn && videoPlayer.volume === 0) {
                    muteBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
                }
            }
            e.preventDefault();
            break;
    }
}

// Save watch progress periodically
if (videoPlayer) {
    videoPlayer.addEventListener('timeupdate', saveWatchProgress);
}

function saveWatchProgress() {
    if (!userData || !currentAnime || !currentEpisode || !videoPlayer) return;
    
    // Only save if more than 10 seconds have been watched and video is not at the end
    if (videoPlayer.currentTime > 10 && videoPlayer.currentTime < (videoPlayer.duration * 0.95)) {
        const watchProgressKey = `watchProgress_${currentAnime.id}_${currentEpisode.number}`;
        localStorage.setItem(watchProgressKey, videoPlayer.currentTime.toString());
    }
    
    // If near the end, mark as completed
    if (videoPlayer.currentTime > (videoPlayer.duration * 0.95)) {
        const watchProgressKey = `watchProgress_${currentAnime.id}_${currentEpisode.number}`;
        localStorage.removeItem(watchProgressKey);
        
        // Mark episode as watched in user data
        if (!userData.watchedEpisodes) {
            userData.watchedEpisodes = [];
        }
        
        const episodeKey = `${currentAnime.id}_${currentEpisode.number}`;
        if (!userData.watchedEpisodes.includes(episodeKey)) {
            userData.watchedEpisodes.push(episodeKey);
            localStorage.setItem('currentUser', JSON.stringify(userData));
            
            // Show "Next Episode" button if available
            showNextEpisodeButton();
        }
    }
}

// Show next episode button when near the end of video
function showNextEpisodeButton() {
    if (!currentAnime || !currentEpisode || !videoPlayer) return;
    
    // Check if there's a next episode
    const nextEpisodeNumber = currentEpisode.number + 1;
    const nextEpisode = currentAnime.episodes.find(ep => ep.number === nextEpisodeNumber);
    
    if (nextEpisode) {
        // Create or show next episode button if not already created
        let nextEpisodeBtn = document.getElementById('next-episode-btn');
        
        if (!nextEpisodeBtn) {
            nextEpisodeBtn = document.createElement('button');
            nextEpisodeBtn.id = 'next-episode-btn';
            nextEpisodeBtn.classList.add('next-episode-btn');
            nextEpisodeBtn.innerHTML = `
                <i class="fas fa-forward"></i>
                <span>Next Episode</span>
            `;
            
            nextEpisodeBtn.addEventListener('click', () => {
                window.location.href = `watch.html?id=${currentAnime.id}&ep=${nextEpisodeNumber}`;
            });
            
            const videoContainer = document.querySelector('.video-container');
            if (videoContainer) {
                videoContainer.appendChild(nextEpisodeBtn);
            }
        } else {
            nextEpisodeBtn.classList.add('show');
        }
    }
}

// Handle video quality selection
const qualitySelector = document.getElementById('quality-selector');
if (qualitySelector) {
    qualitySelector.addEventListener('change', () => {
        const currentTime = videoPlayer.currentTime;
        const isPaused = videoPlayer.paused;
        
        // In a real implementation, this would switch to different quality video sources
        // For this demo, we'll just log the change
        console.log(`Changed quality to: ${qualitySelector.value}`);
        
        // Restore playback state
        videoPlayer.currentTime = currentTime;
        if (!isPaused) {
            videoPlayer.play();
        }
    });
}

// Handle playback speed selection
const speedSelector = document.getElementById('speed-selector');
if (speedSelector) {
    speedSelector.addEventListener('change', () => {
        if (videoPlayer) {
            videoPlayer.playbackRate = parseFloat(speedSelector.value);
        }
    });
}

// Add double click to fullscreen
if (videoPlayer) {
    videoPlayer.addEventListener('dblclick', toggleFullscreen);
}

// Show/hide controls on mouse movement
const videoControls = document.querySelector('.video-controls');
if (videoPlayer && videoControls) {
    let controlsTimeout;
    
    function showControls() {
        videoControls.classList.add('visible');
        clearTimeout(controlsTimeout);
        
        controlsTimeout = setTimeout(() => {
            if (!videoPlayer.paused) {
                videoControls.classList.remove('visible');
            }
        }, 3000);
    }
    
    videoPlayer.addEventListener('mousemove', showControls);
    videoControls.addEventListener('mousemove', showControls);
    
    videoPlayer.addEventListener('mouseout', () => {
        if (!videoPlayer.paused) {
            setTimeout(() => {
                videoControls.classList.remove('visible');
            }, 1000);
        }
    });
    
    videoPlayer.addEventListener('play', () => {
        controlsTimeout = setTimeout(() => {
            videoControls.classList.remove('visible');
        }, 3000);
    });
    
    videoPlayer.addEventListener('pause', () => {
        videoControls.classList.add('visible');
        clearTimeout(controlsTimeout);
    });
}

// Handle comments section
const commentForm = document.getElementById('comment-form');
const commentsList = document.getElementById('comments-list');
const commentInput = document.getElementById('comment-input');

if (commentForm && commentInput && commentsList) {
    // Load existing comments
    loadComments();
    
    // Handle new comment submission
    commentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (!userData) {
            // Redirect to login if not logged in
            window.location.href = 'auth.html';
            return;
        }
        
        const commentText = commentInput.value.trim();
        
        if (commentText !== '') {
            addComment(commentText);
            commentInput.value = '';
        }
    });
}

// Load comments for current episode
function loadComments() {
    if (!commentsList || !currentAnime || !currentEpisode) return;
    
    commentsList.innerHTML = '';
    
    // Get comments from localStorage or API
    const commentsKey = `comments_${currentAnime.id}_${currentEpisode.number}`;
    let comments = JSON.parse(localStorage.getItem(commentsKey)) || [];
    
    if (comments.length > 0) {
        comments.forEach(comment => {
            const commentElement = createCommentElement(comment);
            commentsList.appendChild(commentElement);
        });
    } else {
        const noComments = document.createElement('div');
        noComments.classList.add('no-comments');
        noComments.textContent = 'No comments yet. Be the first to comment!';
        commentsList.appendChild(noComments);
    }
}

// Add a new comment
function addComment(commentText) {
    if (!currentAnime || !currentEpisode || !userData) return;
    
    const commentsKey = `comments_${currentAnime.id}_${currentEpisode.number}`;
    let comments = JSON.parse(localStorage.getItem(commentsKey)) || [];
    
    // Create new comment object
    const newComment = {
        id: Date.now().toString(),
        user: {
            name: userData.name,
            avatar: userData.avatar || 'assets/images/default-avatar.png'
        },
        text: commentText,
        timestamp: new Date().toISOString(),
        likes: 0,
        replies: []
    };
    
    // Add to comments array
    comments.unshift(newComment);
    
    // Save to localStorage
    localStorage.setItem(commentsKey, JSON.stringify(comments));
    
    // Add to DOM
    const commentElement = createCommentElement(newComment);
    
    if (commentsList.firstChild) {
        commentsList.insertBefore(commentElement, commentsList.firstChild);
    } else {
        commentsList.appendChild(commentElement);
    }
    
    // Remove "no comments" message if present
    const noComments = commentsList.querySelector('.no-comments');
    if (noComments) {
        noComments.remove();
    }
}

// Create comment element
function createCommentElement(comment) {
    const commentElement = document.createElement('div');
    commentElement.classList.add('comment');
    commentElement.dataset.id = comment.id;
    
    // Format date
    const date = new Date(comment.timestamp);
    const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    commentElement.innerHTML = `
        <div class="comment-header">
            <img src="${comment.user.avatar}" alt="${comment.user.name}" class="user-avatar">
            <div class="comment-user-info">
                <h4>${comment.user.name}</h4>
                <span class="comment-date">${formattedDate}</span>
            </div>
        </div>
        <div class="comment-content">
            <p>${comment.text}</p>
        </div>
        <div class="comment-actions">
            <button class="like-button" data-id="${comment.id}">
                <i class="far fa-heart"></i>
                <span>${comment.likes}</span>
            </button>
            <button class="reply-button" data-id="${comment.id}">
                <i class="far fa-comment"></i>
                <span>Reply</span>
            </button>
        </div>
    `;
    
    // Add event listeners for like and reply buttons
    const likeButton = commentElement.querySelector('.like-button');
    if (likeButton) {
        likeButton.addEventListener('click', () => likeComment(comment.id));
    }
    
    const replyButton = commentElement.querySelector('.reply-button');
    if (replyButton) {
        replyButton.addEventListener('click', () => showReplyForm(comment.id));
    }
    
    // Add replies if any
    if (comment.replies && comment.replies.length > 0) {
        const repliesContainer = document.createElement('div');
        repliesContainer.classList.add('replies-container');
        
        comment.replies.forEach(reply => {
            const replyElement = createReplyElement(reply);
            repliesContainer.appendChild(replyElement);
        });
        
        commentElement.appendChild(repliesContainer);
    }
    
    return commentElement;
}

// Like a comment
function likeComment(commentId) {
    if (!currentAnime || !currentEpisode || !userData) return;
    
    const commentsKey = `comments_${currentAnime.id}_${currentEpisode.number}`;
    let comments = JSON.parse(localStorage.getItem(commentsKey)) || [];
    
    // Find the comment
    const comment = comments.find(c => c.id === commentId);
    
    if (comment) {
        // Increment likes
        comment.likes += 1;
        
        // Update in localStorage
        localStorage.setItem(commentsKey, JSON.stringify(comments));
        
        // Update UI
        const likeButton = document.querySelector(`.like-button[data-id="${commentId}"] span`);
        if (likeButton) {
            likeButton.textContent = comment.likes;
        }
    }
}

// Show reply form for a comment
function showReplyForm(commentId) {
    if (!userData) {
        // Redirect to login if not logged in
        window.location.href = 'auth.html';
        return;
    }
    
    // Remove any existing reply forms
    const existingForms = document.querySelectorAll('.reply-form');
    existingForms.forEach(form => form.remove());
    
    // Create new reply form
    const replyForm = document.createElement('div');
    replyForm.classList.add('reply-form');
    replyForm.innerHTML = `
        <img src="${userData.avatar || 'assets/images/default-avatar.png'}" alt="${userData.name}" class="user-avatar">
        <div class="reply-input-container">
            <textarea class="reply-input" placeholder="Write a reply..."></textarea>
            <div class="reply-actions">
                <button class="cancel-reply">Cancel</button>
                <button class="submit-reply">Reply</button>
            </div>
        </div>
    `;
    
    // Add event listeners
    const commentElement = document.querySelector(`.comment[data-id="${commentId}"]`);
    
    if (commentElement) {
        // Insert form after comment actions
        const commentActions = commentElement.querySelector('.comment-actions');
        commentActions.after(replyForm);
        
        // Focus the textarea
        const textarea = replyForm.querySelector('.reply-input');
        textarea.focus();
        
        // Cancel button
        const cancelButton = replyForm.querySelector('.cancel-reply');
        cancelButton.addEventListener('click', () => replyForm.remove());
        
        // Submit button
        const submitButton = replyForm.querySelector('.submit-reply');
        submitButton.addEventListener('click', () => {
            const replyText = textarea.value.trim();
            
            if (replyText !== '') {
                addReply(commentId, replyText);
                replyForm.remove();
            }
        });
    }
}

// Add a reply to a comment
function addReply(commentId, replyText) {
    if (!currentAnime || !currentEpisode || !userData) return;
    
    const commentsKey = `comments_${currentAnime.id}_${currentEpisode.number}`;
    let comments = JSON.parse(localStorage.getItem(commentsKey)) || [];
    
    // Find the comment
    const comment = comments.find(c => c.id === commentId);
    
    if (comment) {
        // Initialize replies array if it doesn't exist
        if (!comment.replies) {
            comment.replies = [];
        }
        
        // Create new reply
        const newReply = {
            id: Date.now().toString(),
            user: {
                name: userData.name,
                avatar: userData.avatar || 'assets/images/default-avatar.png'
            },
            text: replyText,
            timestamp: new Date().toISOString(),
            likes: 0
        };
        
        // Add to replies array
        comment.replies.push(newReply);
        
        // Save to localStorage
        localStorage.setItem(commentsKey, JSON.stringify(comments));
        
        // Update UI
        const commentElement = document.querySelector(`.comment[data-id="${commentId}"]`);
        
        if (commentElement) {
            // Check if replies container exists
            let repliesContainer = commentElement.querySelector('.replies-container');
            
            if (!repliesContainer) {
                repliesContainer = document.createElement('div');
                repliesContainer.classList.add('replies-container');
                commentElement.appendChild(repliesContainer);
            }
            
            // Add reply element
            const replyElement = createReplyElement(newReply);
            repliesContainer.appendChild(replyElement);
        }
    }
}

// Create reply element
function createReplyElement(reply) {
    const replyElement = document.createElement('div');
    replyElement.classList.add('reply');
    replyElement.dataset.id = reply.id;
    
    // Format date
    const date = new Date(reply.timestamp);
    const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    replyElement.innerHTML = `
        <div class="reply-header">
            <img src="${reply.user.avatar}" alt="${reply.user.name}" class="user-avatar small">
            <div class="reply-user-info">
                <h5>${reply.user.name}</h5>
                <span class="reply-date">${formattedDate}</span>
            </div>
        </div>
        <div class="reply-content">
            <p>${reply.text}</p>
        </div>
        <div class="reply-actions">
            <button class="like-reply-button" data-id="${reply.id}">
                <i class="far fa-heart"></i>
                <span>${reply.likes}</span>
            </button>
        </div>
    `;
    
    // Add event listener for like button
    const likeButton = replyElement.querySelector('.like-reply-button');
    if (likeButton) {
        likeButton.addEventListener('click', () => likeReply(reply.id));
    }
    
    return replyElement;
}

// Like a reply
function likeReply(replyId) {
    if (!currentAnime || !currentEpisode || !userData) return;
    
    const commentsKey = `comments_${currentAnime.id}_${currentEpisode.number}`;
    let comments = JSON.parse(localStorage.getItem(commentsKey)) || [];
    
    // Find the comment containing the reply
    let found = false;
    
    for (const comment of comments) {
        if (comment.replies && Array.isArray(comment.replies)) {
            const reply = comment.replies.find(r => r.id === replyId);
            
            if (reply) {
                // Increment likes
                reply.likes += 1;
                found = true;
                break;
            }
        }
    }
    
    if (found) {
        // Update in localStorage
        localStorage.setItem(commentsKey, JSON.stringify(comments));
        
        // Update UI
        const likeButton = document.querySelector(`.like-reply-button[data-id="${replyId}"] span`);
        if (likeButton) {
            likeButton.textContent = parseInt(likeButton.textContent) + 1;
        }
    }
}