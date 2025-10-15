// controllers/adminController.js
const Game = require('../models/Game');
const User = require('../models/User');
const Collection = require('../models/Collection');
const News = require('../models/News');
const fs = require('fs');
const path = require('path');

// Helper function to delete files
const deleteFile = (filename) => {
  const filePath = path.join(__dirname, '../uploads', filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

// Add Game with all enhanced fields
exports.addGame = async (req, res) => {
  try {
    const {
      name, description, developer, publisher, releaseDate, version,
      genre, categories, tags, ratings, modes,
      price, discount, offerDuration,
      multiplayerSupport, crossPlatformSupport, cloudSaveSupport,
      controllerSupport, vrSupport, gameEngine, gameSize,
      availablePlatforms, consoles, languageSupport, subtitleLanguages, audioLanguages,
      minimumRequirements, recommendedRequirements, supportedResolutions,
      soundtrackAvailability, soundtrackUrl,
      inGamePurchases, inGamePurchasesInfo,
      isTrending, popularityLabel
    } = req.body;

    if (!name || !description || !price) {
      return res.status(400).json({ message: 'Required fields: name, description, price' });
    }

    const gameData = {
      name,
      description,
      developer: developer || '',
      publisher: publisher || '',
      releaseDate: releaseDate || null,
      version: version || '1.0.0',
      
      genre: JSON.parse(genre || '[]'),
      categories: JSON.parse(categories || '[]'),
      tags: JSON.parse(tags || '[]'),
      ratings: JSON.parse(ratings || '[]'),
      modes: JSON.parse(modes || '[]'),
      
      price: parseFloat(price),
      discount: parseFloat(discount) || 0,
      offerDuration: offerDuration ? JSON.parse(offerDuration) : {},
      
      multiplayerSupport: multiplayerSupport === 'true',
      crossPlatformSupport: crossPlatformSupport === 'true',
      cloudSaveSupport: cloudSaveSupport === 'true',
      controllerSupport: controllerSupport === 'true',
      vrSupport: vrSupport === 'true',
      gameEngine: gameEngine || '',
      gameSize: parseFloat(gameSize) || 0,
      
      availablePlatforms: JSON.parse(availablePlatforms || '[]'),
      consoles: JSON.parse(consoles || '[]'),
      languageSupport: JSON.parse(languageSupport || '[]'),
      subtitleLanguages: JSON.parse(subtitleLanguages || '[]'),
      audioLanguages: JSON.parse(audioLanguages || '[]'),
      
      minimumRequirements: minimumRequirements ? JSON.parse(minimumRequirements) : {},
      recommendedRequirements: recommendedRequirements ? JSON.parse(recommendedRequirements) : {},
      supportedResolutions: JSON.parse(supportedResolutions || '[]'),
      
      soundtrackAvailability: soundtrackAvailability === 'true',
      soundtrackUrl: soundtrackUrl || '',
      
      inGamePurchases: inGamePurchases === 'true',
      inGamePurchasesInfo: inGamePurchasesInfo || '',
      
      isTrending: isTrending === 'true',
      popularityLabel: popularityLabel || ''
    };

    // Handle file uploads
    if (req.files) {
      if (req.files.coverImage) gameData.coverImage = req.files.coverImage[0].filename;
      if (req.files.backgroundPic) gameData.backgroundPic = req.files.backgroundPic[0].filename;
      if (req.files.trailer) gameData.trailer = req.files.trailer[0].filename;
      
      // Additional Images
      gameData.additionalImages = [];
      for (let i = 0; i < 3; i++) {
        if (req.files[`additionalImage${i}`]) {
          gameData.additionalImages.push(req.files[`additionalImage${i}`][0].filename);
        }
      }
      
      // Gameplay Pictures
      gameData.gameplayPics = [];
      for (let i = 0; i < 4; i++) {
        if (req.files[`gameplayPic${i}`]) {
          gameData.gameplayPics.push(req.files[`gameplayPic${i}`][0].filename);
        }
      }
    }

    const game = new Game(gameData);
    await game.save();

    res.status(201).json({
      message: 'Game added successfully!',
      game
    });
  } catch (error) {
    console.error('Add game error:', error);
    res.status(500).json({ message: 'Server error. Please try again.', error: error.message });
  }
};

// Get All Games
exports.getAllGames = async (req, res) => {
  try {
    const games = await Game.find().sort({ createdAt: -1 });
    res.status(200).json({ games });
  } catch (error) {
    console.error('Get games error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get Single Game
exports.getGameById = async (req, res) => {
  try {
    const { id } = req.params;
    const game = await Game.findById(id);
    
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    res.status(200).json({ game });
  } catch (error) {
    console.error('Get game error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Update Game
exports.updateGame = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, description, developer, publisher, releaseDate, version,
      genre, categories, tags, ratings, modes,
      price, discount, offerDuration,
      multiplayerSupport, crossPlatformSupport, cloudSaveSupport,
      controllerSupport, vrSupport, gameEngine, gameSize,
      availablePlatforms, consoles, languageSupport, subtitleLanguages, audioLanguages,
      minimumRequirements, recommendedRequirements, supportedResolutions,
      soundtrackAvailability, soundtrackUrl,
      inGamePurchases, inGamePurchasesInfo,
      isTrending, popularityLabel
    } = req.body;

    const game = await Game.findById(id);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    // Update basic fields
    if (name) game.name = name;
    if (description) game.description = description;
    if (developer !== undefined) game.developer = developer;
    if (publisher !== undefined) game.publisher = publisher;
    if (releaseDate !== undefined) game.releaseDate = releaseDate;
    if (version !== undefined) game.version = version;
    
    // Update arrays
    if (genre) game.genre = JSON.parse(genre);
    if (categories) game.categories = JSON.parse(categories);
    if (tags) game.tags = JSON.parse(tags);
    if (ratings) game.ratings = JSON.parse(ratings);
    if (modes) game.modes = JSON.parse(modes);
    
    // Update pricing
    if (price !== undefined) game.price = parseFloat(price);
    if (discount !== undefined) game.discount = parseFloat(discount);
    if (offerDuration) game.offerDuration = JSON.parse(offerDuration);
    
    // Update boolean features
    if (multiplayerSupport !== undefined) game.multiplayerSupport = multiplayerSupport === 'true';
    if (crossPlatformSupport !== undefined) game.crossPlatformSupport = crossPlatformSupport === 'true';
    if (cloudSaveSupport !== undefined) game.cloudSaveSupport = cloudSaveSupport === 'true';
    if (controllerSupport !== undefined) game.controllerSupport = controllerSupport === 'true';
    if (vrSupport !== undefined) game.vrSupport = vrSupport === 'true';
    
    if (gameEngine !== undefined) game.gameEngine = gameEngine;
    if (gameSize !== undefined) game.gameSize = parseFloat(gameSize);
    
    // Update platforms and languages
    if (availablePlatforms) game.availablePlatforms = JSON.parse(availablePlatforms);
    if (consoles) game.consoles = JSON.parse(consoles);
    if (languageSupport) game.languageSupport = JSON.parse(languageSupport);
    if (subtitleLanguages) game.subtitleLanguages = JSON.parse(subtitleLanguages);
    if (audioLanguages) game.audioLanguages = JSON.parse(audioLanguages);
    
    // Update system requirements
    if (minimumRequirements) game.minimumRequirements = JSON.parse(minimumRequirements);
    if (recommendedRequirements) game.recommendedRequirements = JSON.parse(recommendedRequirements);
    if (supportedResolutions) game.supportedResolutions = JSON.parse(supportedResolutions);
    
    // Update soundtrack
    if (soundtrackAvailability !== undefined) game.soundtrackAvailability = soundtrackAvailability === 'true';
    if (soundtrackUrl !== undefined) game.soundtrackUrl = soundtrackUrl;
    
    // Update monetization
    if (inGamePurchases !== undefined) game.inGamePurchases = inGamePurchases === 'true';
    if (inGamePurchasesInfo !== undefined) game.inGamePurchasesInfo = inGamePurchasesInfo;
    
    // Update popularity
    if (isTrending !== undefined) game.isTrending = isTrending === 'true';
    if (popularityLabel !== undefined) game.popularityLabel = popularityLabel;

    // Handle file uploads and delete old files
    if (req.files) {
      if (req.files.coverImage) {
        if (game.coverImage) deleteFile(game.coverImage);
        game.coverImage = req.files.coverImage[0].filename;
      }
      if (req.files.backgroundPic) {
        if (game.backgroundPic) deleteFile(game.backgroundPic);
        game.backgroundPic = req.files.backgroundPic[0].filename;
      }
      if (req.files.trailer) {
        if (game.trailer) deleteFile(game.trailer);
        game.trailer = req.files.trailer[0].filename;
      }
      
      // Additional Images
      for (let i = 0; i < 3; i++) {
        if (req.files[`additionalImage${i}`]) {
          if (game.additionalImages[i]) deleteFile(game.additionalImages[i]);
          game.additionalImages[i] = req.files[`additionalImage${i}`][0].filename;
        }
      }
      
      // Gameplay Pictures
      for (let i = 0; i < 4; i++) {
        if (req.files[`gameplayPic${i}`]) {
          if (game.gameplayPics[i]) deleteFile(game.gameplayPics[i]);
          game.gameplayPics[i] = req.files[`gameplayPic${i}`][0].filename;
        }
      }
    }

    await game.save();

    res.status(200).json({
      message: 'Game updated successfully!',
      game
    });
  } catch (error) {
    console.error('Update game error:', error);
    res.status(500).json({ message: 'Server error. Please try again.', error: error.message });
  }
};

// Delete Game
exports.deleteGame = async (req, res) => {
  try {
    const { id } = req.params;
    const game = await Game.findById(id);

    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    // Delete all associated files
    if (game.coverImage) deleteFile(game.coverImage);
    if (game.backgroundPic) deleteFile(game.backgroundPic);
    if (game.trailer) deleteFile(game.trailer);
    game.additionalImages.forEach(pic => deleteFile(pic));
    game.gameplayPics.forEach(pic => deleteFile(pic));

    await Game.findByIdAndDelete(id);
    await Collection.deleteMany({ game: id });

    res.status(200).json({ message: 'Game deleted successfully!' });
  } catch (error) {
    console.error('Delete game error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Set Discount
exports.setDiscount = async (req, res) => {
  try {
    const { id } = req.params;
    const { discount } = req.body;

    if (discount < 0 || discount > 100) {
      return res.status(400).json({ message: 'Discount must be between 0 and 100' });
    }

    const game = await Game.findByIdAndUpdate(
      id,
      { discount: parseFloat(discount) },
      { new: true }
    );

    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    res.status(200).json({
      message: 'Discount updated successfully!',
      game
    });
  } catch (error) {
    console.error('Set discount error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get All Users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get User Details with Collection
exports.getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const collection = await Collection.find({ user: id })
      .populate('game')
      .sort({ purchasedAt: -1 });

    res.status(200).json({
      user,
      collection
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get All Purchases
exports.getAllPurchases = async (req, res) => {
  try {
    const purchases = await Collection.find()
      .populate('user', 'username email')
      .populate('game', 'name price')
      .sort({ purchasedAt: -1 });

    res.status(200).json({ purchases });
  } catch (error) {
    console.error('Get purchases error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// News Management
exports.addNews = async (req, res) => {
  try {
    const { heading, description, gameName } = req.body;

    if (!heading || !description) {
      return res.status(400).json({ message: 'Heading and description are required' });
    }

    const newsData = {
      heading,
      description,
      gameName: gameName || ''
    };

    if (req.files) {
      if (req.files.headingImage) {
        newsData.headingImage = req.files.headingImage[0].filename;
      }
      if (req.files.detailImage) {
        newsData.detailImage = req.files.detailImage[0].filename;
      }
    }

    const news = new News(newsData);
    await news.save();

    res.status(201).json({
      message: 'News added successfully!',
      news
    });
  } catch (error) {
    console.error('Add news error:', error);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

exports.getAllNews = async (req, res) => {
  try {
    const news = await News.find().sort({ createdAt: -1 });
    res.status(200).json({ news });
  } catch (error) {
    console.error('Get news error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getNewsById = async (req, res) => {
  try {
    const { id } = req.params;
    const news = await News.findById(id);
    
    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }

    res.status(200).json({ news });
  } catch (error) {
    console.error('Get news error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.updateNews = async (req, res) => {
  try {
    const { id } = req.params;
    const { heading, description, gameName } = req.body;

    const news = await News.findById(id);
    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }

    if (heading) news.heading = heading;
    if (description) news.description = description;
    if (gameName !== undefined) news.gameName = gameName;

    if (req.files) {
      if (req.files.headingImage) {
        if (news.headingImage) deleteFile(news.headingImage);
        news.headingImage = req.files.headingImage[0].filename;
      }
      if (req.files.detailImage) {
        if (news.detailImage) deleteFile(news.detailImage);
        news.detailImage = req.files.detailImage[0].filename;
      }
    }

    await news.save();

    res.status(200).json({
      message: 'News updated successfully!',
      news
    });
  } catch (error) {
    console.error('Update news error:', error);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

exports.deleteNews = async (req, res) => {
  try {
    const { id } = req.params;
    const news = await News.findById(id);

    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }

    if (news.headingImage) deleteFile(news.headingImage);
    if (news.detailImage) deleteFile(news.detailImage);

    await News.findByIdAndDelete(id);

    res.status(200).json({ message: 'News deleted successfully!' });
  } catch (error) {
    console.error('Delete news error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};