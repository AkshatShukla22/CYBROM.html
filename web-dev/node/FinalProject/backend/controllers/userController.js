// controllers/userController.js
const Game = require('../models/Game');

// Get All Games (Public - no auth required)
exports.getAllGames = async (req, res) => {
  try {
    const games = await Game.find().sort({ createdAt: -1 });
    res.status(200).json({ games });
  } catch (error) {
    console.error('Get games error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get Top Rated Games
exports.getTopRatedGames = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const games = await Game.find()
      .sort({ averageRating: -1, purchaseCount: -1 })
      .limit(limit);
    res.status(200).json({ games });
  } catch (error) {
    console.error('Get top rated games error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get Most Purchased Games
exports.getMostPurchasedGames = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const games = await Game.find()
      .sort({ purchaseCount: -1 })
      .limit(limit);
    res.status(200).json({ games });
  } catch (error) {
    console.error('Get most purchased games error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get Discounted Games
exports.getDiscountedGames = async (req, res) => {
  try {
    const games = await Game.find({ discount: { $gt: 0 } })
      .sort({ discount: -1 });
    res.status(200).json({ games });
  } catch (error) {
    console.error('Get discounted games error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get Free Games
exports.getFreeGames = async (req, res) => {
  try {
    const games = await Game.find({ price: 0 });
    res.status(200).json({ games });
  } catch (error) {
    console.error('Get free games error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get Games by Category
exports.getGamesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const games = await Game.find({ categories: category })
      .sort({ averageRating: -1, purchaseCount: -1 });
    res.status(200).json({ games });
  } catch (error) {
    console.error('Get games by category error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get New Releases (last 30 days)
exports.getNewReleases = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const games = await Game.find({ createdAt: { $gte: thirtyDaysAgo } })
      .sort({ createdAt: -1 });
    res.status(200).json({ games });
  } catch (error) {
    console.error('Get new releases error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Filter Games
exports.filterGames = async (req, res) => {
  try {
    const {
      categories,
      consoles,
      ratings,
      minPrice,
      maxPrice,
      minDiscount,
      minRating,
      sortBy
    } = req.query;

    let query = {};

    // Category filter
    if (categories) {
      const categoryArray = categories.split(',');
      query.categories = { $in: categoryArray };
    }

    // Console filter
    if (consoles) {
      const consoleArray = consoles.split(',');
      query.consoles = { $in: consoleArray };
    }

    // Rating filter
    if (ratings) {
      const ratingArray = ratings.split(',');
      query.ratings = { $in: ratingArray };
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = parseFloat(minPrice);
      if (maxPrice !== undefined) query.price.$lte = parseFloat(maxPrice);
    }

    // Discount filter
    if (minDiscount !== undefined) {
      query.discount = { $gte: parseFloat(minDiscount) };
    }

    // User rating filter
    if (minRating !== undefined) {
      query.averageRating = { $gte: parseFloat(minRating) };
    }

    // Sorting
    let sort = { createdAt: -1 }; // Default sort
    if (sortBy === 'price_asc') sort = { price: 1 };
    else if (sortBy === 'price_desc') sort = { price: -1 };
    else if (sortBy === 'rating') sort = { averageRating: -1 };
    else if (sortBy === 'popularity') sort = { purchaseCount: -1 };
    else if (sortBy === 'newest') sort = { createdAt: -1 };
    else if (sortBy === 'discount') sort = { discount: -1 };

    const games = await Game.find(query).sort(sort);
    res.status(200).json({ games });
  } catch (error) {
    console.error('Filter games error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get Single Game Details (Public)
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