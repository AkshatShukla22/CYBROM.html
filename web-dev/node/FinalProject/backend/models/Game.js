// models/Game.js
const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Game name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  
  // Media Assets
  coverImage: {
    type: String
  },
  additionalImages: [{
    type: String
  }],
  trailer: {
    type: String
  },
  gameplayPics: [{
    type: String
  }],
  backgroundPic: {
    type: String
  },

  // Developer & Publisher Info
  developer: {
    type: String,
    trim: true
  },
  publisher: {
    type: String,
    trim: true
  },
  releaseDate: {
    type: Date
  },
  version: {
    type: String,
    default: '1.0.0'
  },

  // Classification
  genre: [{
    type: String,
    enum: ['Action', 'Adventure', 'RPG', 'Horror', 'Sports', 'Racing', 'Strategy', 'Simulation', 'Puzzle', 'Fighting', 'Shooter', 'Open World', 'Indie', 'Casual', 'Educational']
  }],
  categories: [{
    type: String,
    enum: ['Action', 'Adventure', 'RPG', 'Horror', 'Sports', 'Racing', 'Strategy', 'Simulation', 'Puzzle', 'Fighting', 'Shooter', 'Open World', 'Indie', 'Casual', 'Educational']
  }],
  tags: [{
    type: String
  }],
  ratings: [{
    type: String,
    enum: ['Everyone', 'Teen', '10+', '12+', '16+', '18+', 'Mature', 'Violence', 'Horror', 'Sexual Content']
  }],

  // Gameplay Modes
  modes: [{
    type: String,
    enum: ['Single Player', 'Multiplayer', 'Co-op', 'PvP', 'Online', 'Local']
  }],
  multiplayerSupport: {
    type: Boolean,
    default: false
  },
  crossPlatformSupport: {
    type: Boolean,
    default: false
  },
  cloudSaveSupport: {
    type: Boolean,
    default: false
  },

  // Features & Tech
  controllerSupport: {
    type: Boolean,
    default: false
  },
  vrSupport: {
    type: Boolean,
    default: false
  },
  gameEngine: {
    type: String,
    enum: ['Unreal Engine', 'Unity', 'Godot', 'Proprietary', 'Custom', 'Other']
  },
  gameSize: {
    type: Number, // in GB
  },

  // System Requirements
  minimumRequirements: {
    os: String,
    cpu: String,
    ram: String,
    gpu: String,
    storage: String,
    directX: String,
    additional: String
  },
  recommendedRequirements: {
    os: String,
    cpu: String,
    ram: String,
    gpu: String,
    storage: String,
    directX: String,
    additional: String
  },

  // Display Support
  supportedResolutions: [{
    type: String,
    enum: ['1080p', '1440p', '2160p (4K)', '3440x1440 (Ultrawide)', '5120x1440 (Dual Ultrawide)']
  }],

  // Platform Availability
  availablePlatforms: [{
    type: String,
    enum: ['PlayStation 5', 'PlayStation 4', 'Xbox Series X/S', 'Xbox One', 'Nintendo Switch', 'PC', 'Mac', 'Linux', 'Mobile', 'Cloud Gaming']
  }],
  consoles: [{
    type: String,
    enum: ['PlayStation 5', 'PlayStation 4', 'Xbox Series X/S', 'Xbox One', 'Nintendo Switch', 'PC', 'Mac', 'Linux']
  }],

  // Localization
  languageSupport: [{
    type: String,
    enum: ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Russian', 'Japanese', 'Chinese', 'Korean', 'Arabic', 'Hindi', 'Dutch', 'Polish', 'Turkish', 'Thai', 'Vietnamese', 'Swedish', 'Norwegian', 'Danish', 'Finnish']
  }],
  subtitleLanguages: [{
    type: String
  }],
  audioLanguages: [{
    type: String
  }],

  // Audio & Soundtrack
  soundtrackAvailability: {
    type: Boolean,
    default: false
  },
  soundtrackUrl: {
    type: String
  },

  // Monetization & Pricing
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  offerDuration: {
    startDate: Date,
    endDate: Date
  },
  inGamePurchases: {
    type: Boolean,
    default: false
  },
  inGamePurchasesInfo: {
    type: String // Description of in-game purchases
  },

  // Popularity & Trending
  isTrending: {
    type: Boolean,
    default: false
  },
  popularityLabel: {
    type: String,
    enum: ['New Release', 'Trending', 'Best Seller', 'Editor\'s Choice', 'Hidden Gem', 'Classic']
  },
  purchaseCount: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },

  // Reviews & Engagement
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Metadata
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Virtual field to calculate discounted price
gameSchema.virtual('discountedPrice').get(function() {
  if (this.discount > 0) {
    return this.price - (this.price * this.discount / 100);
  }
  return this.price;
});

// Check if offer is currently active
gameSchema.virtual('isOfferActive').get(function() {
  if (!this.offerDuration.startDate || !this.offerDuration.endDate) {
    return false;
  }
  const now = new Date();
  return now >= this.offerDuration.startDate && now <= this.offerDuration.endDate;
});

gameSchema.set('toJSON', { virtuals: true });
gameSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Game', gameSchema);