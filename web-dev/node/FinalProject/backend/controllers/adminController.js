// controllers/adminController.js
const Game = require('../models/Game');
const User = require('../models/User');
const Collection = require('../models/Collection');
const News = require('../models/News');
const fs = require('fs');
const path = require('path');

// Add Game
exports.addGame = async (req, res) => {
  try {
    const { name, description, price, discount, ratings, categories, consoles } = req.body;

    // Validate required fields
    if (!name || !description || !price) {
      return res.status(400).json({ message: 'All required fields must be filled' });
    }

    const gameData = {
      name,
      description,
      price: parseFloat(price),
      discount: parseFloat(discount) || 0,
      ratings: JSON.parse(ratings || '[]'),
      categories: JSON.parse(categories || '[]'),
      consoles: JSON.parse(consoles || '[]')
    };

    // Handle file uploads
    if (req.files) {
      if (req.files.gamePic) gameData.gamePic = req.files.gamePic[0].filename;
      if (req.files.backgroundPic) gameData.backgroundPic = req.files.backgroundPic[0].filename;
      if (req.files.video) gameData.video = req.files.video[0].filename;
      
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
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// Get All Games (simplified for list view)
exports.getAllGames = async (req, res) => {
  try {
    const games = await Game.find().sort({ createdAt: -1 });
    res.status(200).json({ games });
  } catch (error) {
    console.error('Get games error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get Single Game (detailed view)
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
    const { name, description, price, discount, ratings, categories, consoles } = req.body;

    const game = await Game.findById(id);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    // Update fields
    if (name) game.name = name;
    if (description) game.description = description;
    if (price) game.price = parseFloat(price);
    if (discount !== undefined) game.discount = parseFloat(discount);
    if (ratings) game.ratings = JSON.parse(ratings);
    if (categories) game.categories = JSON.parse(categories);
    if (consoles) game.consoles = JSON.parse(consoles);

    // Handle file uploads and delete old files
    if (req.files) {
      if (req.files.gamePic) {
        if (game.gamePic) deleteFile(game.gamePic);
        game.gamePic = req.files.gamePic[0].filename;
      }
      if (req.files.backgroundPic) {
        if (game.backgroundPic) deleteFile(game.backgroundPic);
        game.backgroundPic = req.files.backgroundPic[0].filename;
      }
      if (req.files.video) {
        if (game.video) deleteFile(game.video);
        game.video = req.files.video[0].filename;
      }
      
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
    res.status(500).json({ message: 'Server error. Please try again.' });
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

    // Delete associated files
    if (game.gamePic) deleteFile(game.gamePic);
    if (game.backgroundPic) deleteFile(game.backgroundPic);
    if (game.video) deleteFile(game.video);
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

// Helper function to delete files
const deleteFile = (filename) => {
  const filePath = path.join(__dirname, '../uploads', filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

// Add News
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

    // Handle file uploads - both images are optional
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

// Get All News
exports.getAllNews = async (req, res) => {
  try {
    const news = await News.find().sort({ createdAt: -1 });
    res.status(200).json({ news });
  } catch (error) {
    console.error('Get news error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get Single News
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

// Update News
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

    // Handle file uploads
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

// Delete News
exports.deleteNews = async (req, res) => {
  try {
    const { id } = req.params;
    const news = await News.findById(id);

    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }

    // Delete associated images
    if (news.headingImage) deleteFile(news.headingImage);
    if (news.detailImage) deleteFile(news.detailImage);

    await News.findByIdAndDelete(id);

    res.status(200).json({ message: 'News deleted successfully!' });
  } catch (error) {
    console.error('Delete news error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};