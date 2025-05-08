// db.js
// Database handler for anime streaming site
class Database {
  constructor() {
    // Initialize database from localStorage or create new one
    this.initDB();
  }

  async initDB() {
    // Check if database exists in localStorage
    let data = localStorage.getItem('animeDB');
    
    if (!data) {
      // Fetch from db.json if not available in localStorage
      try {
        const response = await fetch('./db.json');
        if (!response.ok) {
          throw new Error('Failed to load database');
        }
        const jsonData = await response.json();
        localStorage.setItem('animeDB', JSON.stringify(jsonData));
        this.data = jsonData;
        console.log('Database initialized from db.json');
      } catch (error) {
        console.error('Error loading database:', error);
        // Initialize with empty data if fetch fails
        this.data = { users: [], anime: [] };
        localStorage.setItem('animeDB', JSON.stringify(this.data));
        
        // Add sample data for testing
        this.addSampleData();
      }
    } else {
      this.data = JSON.parse(data);
      console.log('Database loaded from localStorage');
    }
  }

  // Add sample data if database is empty
  addSampleData() {
    // Add sample anime if none exist
    if (!this.data.anime || this.data.anime.length === 0) {
      this.data.anime = [
        {
          id: 1,
          name: "Naruto",
          description: "A ninja's journey to become the Hokage of the Hidden Leaf Village.",
          genres: ["Action", "Adventure", "Fantasy"],
          rating: 4.8,
          image: "./images/naruto.jpg",
          episodes: [
            {
              number: 1,
              title: "Enter Naruto Uzumaki!",
              video: "./videos/naruto_ep1.mp4"
            }
          ]
        },
        {
          id: 2,
          name: "Attack on Titan",
          description: "Humanity fights for survival against man-eating giants.",
          genres: ["Action", "Drama", "Fantasy"],
          rating: 4.9,
          image: "./images/aot.jpg",
          episodes: [
            {
              number: 1,
              title: "To You, 2000 Years From Now",
              video: "./videos/aot_ep1.mp4"
            }
          ]
        }
      ];
    }
    this.saveData();
  }

  // User related methods
  saveUser(user) {
    // Check if user already exists
    const existingUserIndex = this.data.users.findIndex(u => u.email === user.email);
    
    if (existingUserIndex >= 0) {
      // Update existing user
      this.data.users[existingUserIndex] = user;
    } else {
      // Add new user
      this.data.users.push(user);
    }
    
    this.saveData();
    return true;
  }

  loginUser(email, password) {
    // For admin login
    if (email === "admin@gmail.com" && password === "admin") {
      localStorage.setItem('currentUserEmail', email);
      localStorage.setItem('isAdmin', 'true');
      return { success: true, isAdmin: true };
    }
    
    // For regular users
    const user = this.data.users.find(u => u.email === email && u.password === password);
    
    if (user) {
      localStorage.setItem('currentUserEmail', email);
      localStorage.setItem('isAdmin', 'false');
      return { success: true, isAdmin: false };
    }
    
    return { success: false };
  }

  logoutUser() {
    localStorage.removeItem('currentUserEmail');
    localStorage.removeItem('isAdmin');
  }

  getCurrentUser() {
    const email = localStorage.getItem('currentUserEmail');
    if (!email) return null;
    
    return this.data.users.find(user => user.email === email);
  }

  isAdmin() {
    return localStorage.getItem('isAdmin') === 'true';
  }

  // Anime related methods
  getAllAnime() {
    return this.data.anime || [];
  }

  getAnimeById(id) {
    return this.data.anime.find(anime => anime.id === Number(id));
  }

  getAnimeByGenre(genre) {
    return this.data.anime.filter(anime => 
      anime.genres && anime.genres.includes(genre)
    );
  }

  searchAnime(query) {
    if (!query) return [];
    
    query = query.toLowerCase();
    return this.data.anime.filter(anime => 
      anime.name.toLowerCase().includes(query)
    );
  }

  addAnime(anime) {
    // Generate new ID
    const newId = this.data.anime.length > 0 
      ? Math.max(...this.data.anime.map(a => a.id)) + 1 
      : 1;
    
    anime.id = newId;
    this.data.anime.push(anime);
    this.saveData();
    return newId;
  }

  updateAnime(anime) {
    const index = this.data.anime.findIndex(a => a.id === anime.id);
    if (index >= 0) {
      this.data.anime[index] = anime;
      this.saveData();
      return true;
    }
    return false;
  }

  removeAnime(id) {
    this.data.anime = this.data.anime.filter(anime => anime.id !== Number(id));
    this.saveData();
  }

  // Episode related methods
  addEpisode(animeId, episode) {
    const anime = this.getAnimeById(animeId);
    if (!anime) return false;
    
    if (!anime.episodes) anime.episodes = [];
    anime.episodes.push(episode);
    
    this.updateAnime(anime);
    return true;
  }

  removeEpisode(animeId, episodeNumber) {
    const anime = this.getAnimeById(animeId);
    if (!anime || !anime.episodes) return false;
    
    anime.episodes = anime.episodes.filter(ep => ep.number !== Number(episodeNumber));
    
    this.updateAnime(anime);
    return true;
  }

  // Watchlist related methods
  getUserWatchlist() {
    const user = this.getCurrentUser();
    if (!user || !user.watchlist) return [];
    
    // Return full anime objects for each ID in watchlist
    return user.watchlist.map(id => this.getAnimeById(id)).filter(anime => anime);
  }

  addToWatchlist(animeId) {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    if (!user.watchlist) user.watchlist = [];
    
    // Check if anime is already in watchlist
    if (!user.watchlist.includes(Number(animeId))) {
      user.watchlist.push(Number(animeId));
      this.saveUser(user);
      return true;
    }
    
    return false;
  }

  removeFromWatchlist(animeId) {
    const user = this.getCurrentUser();
    if (!user || !user.watchlist) return false;
    
    user.watchlist = user.watchlist.filter(id => id !== Number(animeId));
    this.saveUser(user);
    return true;
  }

  // Notification methods
  getNotifications() {
    const user = this.getCurrentUser();
    if (!user || !user.watchlist) return [];
    
    // For now, just show new episodes for animes in watchlist
    const watchlistAnime = this.getUserWatchlist();
    
    return watchlistAnime
      .filter(anime => anime.episodes && anime.episodes.length > 0)
      .map(anime => ({
        animeId: anime.id,
        animeName: anime.name,
        message: `New episode added to ${anime.name}!`,
        latestEpisode: Math.max(...anime.episodes.map(ep => ep.number))
      }));
  }

  // Helper method to save data back to localStorage
  saveData() {
    localStorage.setItem('animeDB', JSON.stringify(this.data));
  }
}

// Create database instance
window.db = new Database();