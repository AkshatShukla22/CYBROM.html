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
    const animeId = parseInt(urlParams.get('id')) || 1;
    const episodeNumber = parseInt(urlParams.get('ep')) || 1;
    
    currentAnime = animeData.find(anime => anime.id === animeId);
    
    if (currentAnime) {
        currentEpisode = currentAnime.episodes.find(ep => ep.number === episodeNumber);
        
        if (!currentEpisode && currentAnime.episodes.length > 0) {
            currentEpisode = currentAnime.episodes[0];
        }
        
        updatePageContent();
        loadEpisodesList();
        loadRecommendations();
        loadSimilarGenreAnime();
    } else {
        // Anime not found, redirect to home
        window.location.href = 'index.html';
    }
}

// Update page content with current anime and episode data
function updatePageContent() {
    if (!currentAnime || !currentEpisode) return;
    
    // Update title and meta information
    document.title = `${currentAnime.name} - Episode ${currentEpisode.number} | AniStream`;
    animeTitle.textContent = currentAnime.name;
    episodeTitle.textContent = `Episode ${currentEpisode.number}: ${currentEpisode.title}`;
    episodeRating.textContent = currentEpisode.rating;
    
    // Update video player
    videoPlayer.setAttribute('src', currentEpisode.videoSrc);
    videoPlayer.load(); // Reload video with new source
    
    // Update watchlist button text based on whether anime is in user's watchlist
    if (userData && userData.watchlist && userData.watchlist.includes(currentAnime.id)) {
        addToWatchlistBtn.innerHTML = '<i class="fas fa-check"></i> In Watchlist';
    } else {
        addToWatchlistBtn.innerHTML = '<i class="fas fa-plus"></i> Add to Watchlist';
    }
}

// Load episodes list
function loadEpisodesList() {
    if (!currentAnime) return;
    
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
    if (!animeData || animeData.length === 0) return;
    
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
    if (!currentAnime || !animeData || animeData.length === 0) return;
    
    similarGenreList.innerHTML = '';
    
    // Get the first genre of current anime
    const primaryGenre = currentAnime.genera[0];
    similarGenreTitle.textContent = `More ${primaryGenre.charAt(0).toUpperCase() + primaryGenre.slice(1)} Anime`;
    
    // Filter anime with the same primary genre
    const similarAnime = animeData
        .filter(anime => anime.id !== currentAnime.id && anime.genera.includes(primaryGenre))
        .slice(0, 6);
    
    similarAnime.forEach(anime => {
        createAnimeCard(anime, similarGenreList);
    });
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
        playPauseBtn.addEventListener('click', togglePlayPause);
        videoPlayer.addEventListener('click', togglePlayPause);
        
        // Mute/Unmute
        muteBtn.addEventListener('click', toggleMute);
        
        // Volume control
        volumeSlider.addEventListener('input', updateVolume);
        
        // Fullscreen
        fullscreenBtn.addEventListener('click', toggleFullscreen);
        
        // Progress bar
        videoPlayer.addEventListener('timeupdate', updateProgressBar);
        progressBar.addEventListener('click', seek);
        
        // Time displays
        videoPlayer.addEventListener('loadedmetadata', updateTimeDisplay);
        videoPlayer.addEventListener('timeupdate', updateTimeDisplay);
        
        // Keyboard shortcuts
        document.addEventListener('keydown', handleKeyboardShortcuts);
    }
});

// Toggle play/pause
function togglePlayPause() {
    const playPauseBtn = document.getElementById('play-pause');
    
    if (videoPlayer.paused) {
        videoPlayer.play();
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    } else {
        videoPlayer.pause();
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
}

// Toggle mute
function toggleMute() {
    const muteBtn = document.getElementById('mute');
    const volumeSlider = document.getElementById('volume-slider');
    
    videoPlayer.muted = !videoPlayer.muted;
    
    if (videoPlayer.muted) {
        muteBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
        volumeSlider.value = 0;
    } else {
        muteBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
        volumeSlider.value = videoPlayer.volume;
    }
}

// Update volume
function updateVolume() {
    const volumeSlider = document.getElementById('volume-slider');
    const muteBtn = document.getElementById('mute');
    
    videoPlayer.volume = volumeSlider.value;
    
    if (videoPlayer.volume === 0) {
        videoPlayer.muted = true;
        muteBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
    } else {
        videoPlayer.muted = false;
        muteBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
    }
}

// Toggle fullscreen
function toggleFullscreen() {
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
    
    if (videoPlayer.duration) {
        const percentage = (videoPlayer.currentTime / videoPlayer.duration) * 100;
        progressBar.value = percentage;
    }
}

// Seek to position
function seek(e) {
    const progressBar = document.getElementById('progress-bar');
    const position = e.offsetX / progressBar.offsetWidth;
    videoPlayer.currentTime = position * videoPlayer.duration;
}

// Update time display
function updateTimeDisplay() {
    const currentTimeDisplay = document.getElementById('current-time');
    const durationDisplay = document.getElementById('duration');
    
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
            document.getElementById('volume-slider').value = videoPlayer.volume;
            updateVolume();
            e.preventDefault();
            break;
        case 'ArrowDown':
            // Down arrow: decrease volume
            videoPlayer.volume = Math.max(0, videoPlayer.volume - 0.1);
            document.getElementById('volume-slider').value = videoPlayer.volume;
            updateVolume();
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
videoPlayer.addEventListener('ended', () => {
    const playPauseBtn = document.getElementById('play-pause');
    playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    
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
                        <p>Playing next in <span id="countdown">10</span> seconds</p>
                    </div>
                </div>
            `;
            
            videoPlayer.parentNode.appendChild(nextEpisodeOverlay);
            
            // Setup countdown
            let countdown = 10;
            const countdownElement = document.getElementById('countdown');
            
            const countdownInterval = setInterval(() => {
                countdown--;
                countdownElement.textContent = countdown;
                
                if (countdown <= 0) {
                    clearInterval(countdownInterval);
                    window.location.href = `watch.html?id=${currentAnime.id}&ep=${nextEpisode.number}`;
                }
            }, 1000);
            
            // Setup buttons
            document.getElementById('play-next').addEventListener('click', () => {
                clearInterval(countdownInterval);
                window.location.href = `watch.html?id=${currentAnime.id}&ep=${nextEpisode.number}`;
            });
            
            document.getElementById('cancel-next').addEventListener('click', () => {
                clearInterval(countdownInterval);
                nextEpisodeOverlay.remove();
            });
        }
    }
});

// Window unload event - save current time for resume watching feature
window.addEventListener('beforeunload', () => {
    if (currentAnime && currentEpisode && videoPlayer.currentTime > 0) {
        // Save current watching progress
        const watchProgress = JSON.parse(localStorage.getItem('watchProgress') || '{}');
        
        if (!watchProgress[currentAnime.id]) {
            watchProgress[currentAnime.id] = {};
        }
        
        watchProgress[currentAnime.id][currentEpisode.number] = videoPlayer.currentTime;
        
        localStorage.setItem('watchProgress', JSON.stringify(watchProgress));
    }
});

// Check if there's a saved progress for the current episode
function checkSavedProgress() {
    if (currentAnime && currentEpisode) {
        const watchProgress = JSON.parse(localStorage.getItem('watchProgress') || '{}');
        
        if (watchProgress[currentAnime.id] && watchProgress[currentAnime.id][currentEpisode.number]) {
            const savedTime = watchProgress[currentAnime.id][currentEpisode.number];
            
            // If the saved time is more than 30 seconds into the video and not near the end
            if (savedTime > 30 && savedTime < videoPlayer.duration - 60) {
                // Show resume watching overlay
                const resumeOverlay = document.createElement('div');
                resumeOverlay.classList.add('resume-overlay');
                
                const savedMinutes = Math.floor(savedTime / 60);
                const savedSeconds = Math.floor(savedTime % 60);
                
                resumeOverlay.innerHTML = `
                    <div class="resume-content">
                        <h3>Resume Watching</h3>
                        <p>Continue from ${savedMinutes}:${savedSeconds < 10 ? '0' : ''}${savedSeconds}</p>
                        <div class="resume-buttons">
                            <button id="resume-yes">Yes</button>
                            <button id="resume-no">No, Start Over</button>
                        </div>
                    </div>
                `;
                
                videoPlayer.parentNode.appendChild(resumeOverlay);
                
                // Setup buttons
                document.getElementById('resume-yes').addEventListener('click', () => {
                    videoPlayer.currentTime = savedTime;
                    resumeOverlay.remove();
                    videoPlayer.play();
                });
                
                document.getElementById('resume-no').addEventListener('click', () => {
                    resumeOverlay.remove();
                    videoPlayer.play();
                });
            }
        }
    }
}

// Call checkSavedProgress when video metadata is loaded
videoPlayer.addEventListener('loadedmetadata', checkSavedProgress);