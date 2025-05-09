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
    const loggedInUser = localStorage.getItem('currentUser');
    if (loggedInUser) {
        userData = JSON.parse(loggedInUser);
        userBtn.classList.remove('hidden');
        loginBtn.classList.add('hidden');
        loadUserNotifications();
    } else {
        userBtn.classList.add('hidden');
        loginBtn.classList.remove('hidden');
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
            id: 1,
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
            id: 2,
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
    searchInput.addEventListener('input', handleSearch);
    searchBtn.addEventListener('click', () => {
        if (searchInput.value.trim() !== '') {
            handleSearch();
        }
    });
    
    // Notification button
    notificationBtn.addEventListener('click', toggleNotificationPanel);
    
    // Login button
    loginBtn.addEventListener('click', () => {
        window.location.href = 'auth.html';
    });
    
    // User button
    userBtn.addEventListener('click', () => {
        window.location.href = 'user.html';
    });
    
    // Add to watchlist button
    addToWatchlistBtn.addEventListener('click', addToWatchlist);
    
    // Share button
    shareButton.addEventListener('click', shareAnime);
    
    // Close notification panel when clicking outside
    document.addEventListener('click', (e) => {
        if (!notificationBtn.contains(e.target) && !notificationPanel.contains(e.target)) {
            notificationPanel.classList.remove('active');
        }
    });
}

// Toggle notification panel
function toggleNotificationPanel() {
    notificationPanel.classList.toggle('active');
}

// Load user notifications
function loadUserNotifications() {
    if (!userData) return;
    
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
    
    // Parse animeId from URL parameters
    let animeId = urlParams.get('id');
    // If animeId exists, convert to integer
    animeId = animeId ? parseInt(animeId) : 1;
    
    // Parse episodeNumber from URL parameters
    let episodeNumber = urlParams.get('ep');
    // If episodeNumber exists, convert to integer
    episodeNumber = episodeNumber ? parseInt(episodeNumber) : 1;
    
    console.log(`Loading anime ID: ${animeId}, episode: ${episodeNumber}`);
    
    // Find anime by ID
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
    if (!animeData || animeData.length === 0 || !recommendationsList || !currentAnime) return;
    
    recommendationsList.innerHTML = '';
    
    // Filter out current anime and get random 6 anime
    const recommendations = animeData
        .filter(anime => anime.id !== currentAnime.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 6);
    
    recommendations.forEach(anime => {
        createAnimeCard(anime, recommendationsList);
    });
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
        
        similarAnime.forEach(anime => {
            createAnimeCard(anime, similarGenreList);
        });
    }
}

// Create anime card
function createAnimeCard(anime, container) {
    const animeCard = document.createElement('div');
    animeCard.classList.add('anime-card');
    animeCard.innerHTML = `
        <img src="${anime.image}" alt="${anime.name}">
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
    
    // Initialize watchlist if it doesn't exist
    if (!userData.watchlist) {
        userData.watchlist = [];
    }
    
    // Check if anime is already in watchlist
    const animeIndex = userData.watchlist.indexOf(currentAnime.id);
    
    if (animeIndex === -1) {
        // Add anime to watchlist
        userData.watchlist.push(currentAnime.id);
        addToWatchlistBtn.innerHTML = '<i class="fas fa-check"></i> In Watchlist';
        showToast('Added to watchlist');
    } else {
        // Remove anime from watchlist
        userData.watchlist.splice(animeIndex, 1);
        addToWatchlistBtn.innerHTML = '<i class="fas fa-plus"></i> Add to Watchlist';
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
        case 'ArrowUp':
            // Up arrow: increase volume
            videoPlayer.volume = Math.min(1, videoPlayer.volume + 0.1);
            const volumeSlider = document.getElementById('volume-slider');
            if (volumeSlider) {
                volumeSlider.value = videoPlayer.volume;
                updateVolume();
            }
            e.preventDefault();
            break;
        case 'ArrowDown':
            // Down arrow: decrease volume
            videoPlayer.volume = Math.max(0, videoPlayer.volume - 0.1);
            const volSlider = document.getElementById('volume-slider');
            if (volSlider) {
                volSlider.value = videoPlayer.volume;
                updateVolume();
            }
            e.preventDefault();
            break;
        case 'm':
            // M key: toggle mute
            toggleMute();
            e.preventDefault();
            break;
        case 'f':
            // F key: toggle fullscreen
            toggleFullscreen();
            e.preventDefault();
            break;
    }
}

// Video ended event
if (videoPlayer) {
    videoPlayer.addEventListener('ended', () => {
        const playPauseBtn = document.getElementById('play-pause');
        if (playPauseBtn) {
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        }
        
        // Auto-play next episode if available
        if (currentAnime && currentEpisode) {
            const nextEpisodeNumber = currentEpisode.number + 1;
            const nextEpisode = currentAnime.episodes.find(ep => ep.number === nextEpisodeNumber);
            
            if (nextEpisode) {
                // Show next episode overlay
                const nextEpisodeOverlay = document.createElement('div');
                nextEpisodeOverlay.classList.add('next-episode-overlay');
                nextEpisodeOverlay.innerHTML = `
                    <div class="next-episode-content">
                        <h3>Next Episode</h3>
                        <p>Episode ${nextEpisode.number}: ${nextEpisode.title}</p>
                        <div class="next-episode-buttons">
                            <button id="play-next">Play Next</button>
                            <button id="cancel-next">Cancel</button>
                        </div>
                        <div class="autoplay-countdown">
                            <p>Playing next in <span id="countdown-timer">10</span> seconds</p>
                        </div>
                    </div>
                `;
                
                videoPlayer.parentNode.appendChild(nextEpisodeOverlay);
                
                // Play next button
                document.getElementById('play-next')?.addEventListener('click', () => {
                    window.location.href = `watch.html?id=${currentAnime.id}&ep=${nextEpisodeNumber}`;
                });
                
                // Cancel button
                document.getElementById('cancel-next')?.addEventListener('click', () => {
                    nextEpisodeOverlay.remove();
                });
                
                // Autoplay countdown
                let countdownTime = 10;
                const countdownTimer = document.getElementById('countdown-timer');
                
                const countdown = setInterval(() => {
                    countdownTime--;
                    
                    if (countdownTimer) {
                        countdownTimer.textContent = countdownTime;
                    }
                    
                    if (countdownTime <= 0) {
                        clearInterval(countdown);
                        window.location.href = `watch.html?id=${currentAnime.id}&ep=${nextEpisodeNumber}`;
                    }
                }, 1000);
            }
        }
    });
    
    // Save watch progress periodically
    videoPlayer.addEventListener('timeupdate', () => {
        if (currentAnime && currentEpisode && userData) {
            // Save progress every 5 seconds
            if (Math.floor(videoPlayer.currentTime) % 5 === 0) {
                const watchProgressKey = `watchProgress_${currentAnime.id}_${currentEpisode.number}`;
                localStorage.setItem(watchProgressKey, videoPlayer.currentTime.toString());
            }
        }
    });
}

// Video quality selector
const qualitySelector = document.getElementById('quality-selector');
if (qualitySelector) {
    qualitySelector.addEventListener('change', () => {
        const currentTime = videoPlayer.currentTime;
        const isPaused = videoPlayer.paused;
        
        // In a real implementation, we would set the video source to a different quality version
        // But for this demo, we'll just log the change
        console.log(`Quality changed to ${qualitySelector.value}`);
        
        // Resume playback from the same position
        videoPlayer.currentTime = currentTime;
        
        if (!isPaused) {
            videoPlayer.play();
        }
    });
}

// Show video controls when mouse moves
const videoControls = document.getElementById('video-controls');
if (videoPlayer && videoControls) {
    let hideControlsTimeout;
    
    // Show controls on mouse move
    videoPlayer.parentNode.addEventListener('mousemove', () => {
        videoControls.classList.add('active');
        
        // Clear previous timeout
        clearTimeout(hideControlsTimeout);
        
        // Set new timeout to hide controls after 3 seconds of inactivity
        hideControlsTimeout = setTimeout(() => {
            if (!videoPlayer.paused) {
                videoControls.classList.remove('active');
            }
        }, 3000);
    });
    
    // Keep controls visible when hovering over them
    videoControls.addEventListener('mouseover', () => {
        clearTimeout(hideControlsTimeout);
        videoControls.classList.add('active');
    });
    
    // Hide controls when mouse leaves the video container
    videoPlayer.parentNode.addEventListener('mouseleave', () => {
        if (!videoPlayer.paused) {
            videoControls.classList.remove('active');
        }
    });
}

// Add double-click to toggle fullscreen
if (videoPlayer) {
    let clickCount = 0;
    
    videoPlayer.addEventListener('click', (e) => {
        clickCount++;
        
        if (clickCount === 1) {
            setTimeout(() => {
                if (clickCount === 1) {
                    // Single click - toggle play/pause
                    togglePlayPause();
                } else {
                    // Double click - toggle fullscreen
                    toggleFullscreen();
                }
                
                clickCount = 0;
            }, 300);
        }
        
        e.stopPropagation();
    });
}

// Add episode rating functionality
const rateEpisodeBtn = document.getElementById('rate-episode');
if (rateEpisodeBtn) {
    rateEpisodeBtn.addEventListener('click', () => {
        if (!userData) {
            // Redirect to login if user is not logged in
            window.location.href = 'auth.html';
            return;
        }
        
        // Show rating overlay
        const ratingOverlay = document.createElement('div');
        ratingOverlay.classList.add('rating-overlay');
        ratingOverlay.innerHTML = `
            <div class="rating-content">
                <h3>Rate This Episode</h3>
                <div class="star-rating">
                    <i class="far fa-star" data-rating="1"></i>
                    <i class="far fa-star" data-rating="2"></i>
                    <i class="far fa-star" data-rating="3"></i>
                    <i class="far fa-star" data-rating="4"></i>
                    <i class="far fa-star" data-rating="5"></i>
                </div>
                <div class="rating-buttons">
                    <button id="submit-rating">Submit</button>
                    <button id="cancel-rating">Cancel</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(ratingOverlay);
        
        // Star rating functionality
        let selectedRating = 0;
        const stars = document.querySelectorAll('.star-rating i');
        
        stars.forEach(star => {
            // Hover effect
            star.addEventListener('mouseover', () => {
                const rating = parseInt(star.getAttribute('data-rating'));
                
                stars.forEach(s => {
                    const starRating = parseInt(s.getAttribute('data-rating'));
                    if (starRating <= rating) {
                        s.classList.remove('far');
                        s.classList.add('fas');
                    } else {
                        s.classList.remove('fas');
                        s.classList.add('far');
                    }
                });
            });
            
            // Mouse leave effect
            star.addEventListener('mouseleave', () => {
                stars.forEach(s => {
                    const starRating = parseInt(s.getAttribute('data-rating'));
                    if (starRating <= selectedRating) {
                        s.classList.remove('far');
                        s.classList.add('fas');
                    } else {
                        s.classList.remove('fas');
                        s.classList.add('far');
                    }
                });
            });
            
            // Click to select rating
            star.addEventListener('click', () => {
                selectedRating = parseInt(star.getAttribute('data-rating'));
            });
        });
        
        // Submit button
        document.getElementById('submit-rating')?.addEventListener('click', () => {
            if (selectedRating > 0) {
                // In a real implementation, we would send this rating to the server
                console.log(`Rating submitted: ${selectedRating} stars for episode ${currentEpisode.number} of ${currentAnime.name}`);
                showToast(`Thank you for rating ${selectedRating}/5!`);
                ratingOverlay.remove();
            } else {
                showToast('Please select a rating');
            }
        });
        
        // Cancel button
        document.getElementById('cancel-rating')?.addEventListener('click', () => {
            ratingOverlay.remove();
        });
    });
}

// Add comments section
const commentsSection = document.getElementById('comments-section');
const commentInput = document.getElementById('comment-input');
const submitCommentBtn = document.getElementById('submit-comment');

if (commentsSection && commentInput && submitCommentBtn) {
    // Load sample comments
    loadSampleComments();
    
    // Submit comment
    submitCommentBtn.addEventListener('click', submitComment);
    
    // Submit on Enter key
    commentInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            submitComment();
        }
    });
}

// Load sample comments
function loadSampleComments() {
    if (!commentsSection) return;
    
    const sampleComments = [
        {
            username: 'anime_lover123',
            text: 'This episode was amazing! The animation quality was top-notch.',
            timestamp: '2 days ago',
            likes: 24
        },
        {
            username: 'otaku_master',
            text: 'That fight scene at 12:45 was incredible. Best animation I\'ve seen this season!',
            timestamp: '1 day ago',
            likes: 18
        },
        {
            username: 'manga_reader',
            text: 'As a manga reader, I was worried about this adaptation, but they nailed it perfectly.',
            timestamp: '10 hours ago',
            likes: 7
        }
    ];
    
    const commentsList = document.createElement('div');
    commentsList.classList.add('comments-list');
    
    sampleComments.forEach(comment => {
        const commentElement = createCommentElement(comment);
        commentsList.appendChild(commentElement);
    });
    
    commentsSection.appendChild(commentsList);
}

// Create comment element
function createCommentElement(comment) {
    const commentElement = document.createElement('div');
    commentElement.classList.add('comment');
    
    commentElement.innerHTML = `
        <div class="comment-header">
            <strong>${comment.username}</strong>
            <span class="comment-time">${comment.timestamp}</span>
        </div>
        <div class="comment-body">
            <p>${comment.text}</p>
        </div>
        <div class="comment-actions">
            <button class="like-btn">
                <i class="far fa-heart"></i>
                <span class="likes-count">${comment.likes}</span>
            </button>
            <button class="reply-btn">Reply</button>
        </div>
    `;
    
    // Like button functionality
    const likeBtn = commentElement.querySelector('.like-btn');
    let isLiked = false;
    
    likeBtn?.addEventListener('click', () => {
        const likesCount = likeBtn.querySelector('.likes-count');
        const likeIcon = likeBtn.querySelector('i');
        
        if (isLiked) {
            // Unlike
            likesCount.textContent = (parseInt(likesCount.textContent) - 1).toString();
            likeIcon.classList.remove('fas');
            likeIcon.classList.add('far');
            isLiked = false;
        } else {
            // Like
            likesCount.textContent = (parseInt(likesCount.textContent) + 1).toString();
            likeIcon.classList.remove('far');
            likeIcon.classList.add('fas');
            isLiked = true;
        }
    });
    
    // Reply button functionality
    const replyBtn = commentElement.querySelector('.reply-btn');
    
    replyBtn?.addEventListener('click', () => {
        // Create reply box if it doesn't exist
        if (!commentElement.querySelector('.reply-box')) {
            const replyBox = document.createElement('div');
            replyBox.classList.add('reply-box');
            replyBox.innerHTML = `
                <textarea placeholder="Write a reply..."></textarea>
                <button class="submit-reply-btn">Reply</button>
                <button class="cancel-reply-btn">Cancel</button>
            `;
            
            commentElement.appendChild(replyBox);
            
            // Focus on textarea
            replyBox.querySelector('textarea').focus();
            
            // Submit reply
            replyBox.querySelector('.submit-reply-btn').addEventListener('click', () => {
                const replyText = replyBox.querySelector('textarea').value.trim();
                
                if (replyText) {
                    // Create reply element
                    const replyElement = document.createElement('div');
                    replyElement.classList.add('comment', 'reply');
                    
                    replyElement.innerHTML = `
                        <div class="comment-header">
                            <strong>${userData ? userData.username : 'Guest'}</strong>
                            <span class="comment-time">Just now</span>
                        </div>
                        <div class="comment-body">
                            <p>${replyText}</p>
                        </div>
                        <div class="comment-actions">
                            <button class="like-btn">
                                <i class="far fa-heart"></i>
                                <span class="likes-count">0</span>
                            </button>
                        </div>
                    `;
                    
                    // Add reply after the comment
                    commentElement.parentNode.insertBefore(replyElement, commentElement.nextSibling);
                    
                    // Remove reply box
                    replyBox.remove();
                }
            });
            
            // Cancel reply
            replyBox.querySelector('.cancel-reply-btn').addEventListener('click', () => {
                replyBox.remove();
            });
        }
    });
    
    return commentElement;
}

// Submit comment
function submitComment() {
    if (!commentInput || !commentsSection) return;
    
    const commentText = commentInput.value.trim();
    
    if (commentText) {
        const commentsList = commentsSection.querySelector('.comments-list');
        
        // Create new comment
        const newComment = {
            username: userData ? userData.username : 'Guest',
            text: commentText,
            timestamp: 'Just now',
            likes: 0
        };
        
        const commentElement = createCommentElement(newComment);
        
        // Add comment to the top of the list
        if (commentsList) {
            commentsList.insertBefore(commentElement, commentsList.firstChild);
        } else {
            // Create comments list if it doesn't exist
            const newCommentsList = document.createElement('div');
            newCommentsList.classList.add('comments-list');
            newCommentsList.appendChild(commentElement);
            commentsSection.appendChild(newCommentsList);
        }
        
        // Clear input
        commentInput.value = '';
        
        // Show confirmation
        showToast('Comment posted successfully');
    }
}

// Add report button functionality
const reportBtn = document.getElementById('report-button');
if (reportBtn) {
    reportBtn.addEventListener('click', () => {
        // Show report modal
        const reportModal = document.createElement('div');
        reportModal.classList.add('report-modal');
        reportModal.innerHTML = `
            <div class="report-content">
                <h3>Report Issue</h3>
                <select id="report-type">
                    <option value="">Select issue type</option>
                    <option value="video">Video playback issue</option>
                    <option value="subtitle">Subtitle issue</option>
                    <option value="audio">Audio issue</option>
                    <option value="content">Inappropriate content</option>
                    <option value="other">Other</option>
                </select>
                <textarea id="report-details" placeholder="Provide details about the issue"></textarea>
                <div class="report-buttons">
                    <button id="submit-report">Submit</button>
                    <button id="cancel-report">Cancel</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(reportModal);
        
        // Submit report
        document.getElementById('submit-report')?.addEventListener('click', () => {
            const reportType = document.getElementById('report-type').value;
            const reportDetails = document.getElementById('report-details').value.trim();
            
            if (reportType && reportDetails) {
                // In a real implementation, we would send this report to the server
                console.log(`Report submitted: ${reportType} - ${reportDetails}`);
                showToast('Thank you for your report');
                reportModal.remove();
            } else {
                showToast('Please fill in all fields');
            }
        });
        
        // Cancel report
        document.getElementById('cancel-report')?.addEventListener('click', () => {
            reportModal.remove();
        });
    });
}

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        togglePlayPause,
        toggleMute,
        updateVolume,
        toggleFullscreen,
        updateProgressBar,
        seek,
        updateTimeDisplay,
        handleKeyboardShortcuts
    };
}
