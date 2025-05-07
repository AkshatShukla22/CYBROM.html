// db.js 
class Database {
    constructor() {
      this.data = JSON.parse(localStorage.getItem('animeDB')) || { users: [], anime: [] };
    }
  
    getAllAnime() {
      return this.data.anime || [];
    }
  
    getAnimeByGenre(genre) {
      return this.data.anime.filter(anime => 
        anime.genera && anime.genera.includes(genre)
      );
    }
  
    searchAnime(query) {
      query = query.toLowerCase();
      return this.data.anime.filter(anime => 
        anime.name.toLowerCase().includes(query)
      );
    }
  
    getCurrentUser() {
      const email = localStorage.getItem('currentUserEmail');
      if (!email) return null;
      return this.data.users.find(user => user.email === email);
    }
  
    getUserWatchlist() {
      const user = this.getCurrentUser();
      if (!user || !user.watchlist) return [];
      return user.watchlist;
    }
  
    // Add more methods as needed
  }

  addToWatchlist =(animeId) => {
    const user = this.getCurrentUser();
    if (!user) return; // Ensure a user is logged in
    if (!user.watchlist) user.watchlist = [];
    user.watchlist.push(animeId);
    this.saveData();
  }
  
  // Helper function to save data back to localStorage
  saveData = () => {
    localStorage.setItem('animeDB', JSON.stringify(this.data));
  }

  removeFromWatchlist = (animeId) => {
    const user = this.getCurrentUser();
    if (!user || !user.watchlist) return;
    user.watchlist = user.watchlist.filter(id => id !== animeId);
    this.saveData();
  }
  
  
  
  const db = new Database();