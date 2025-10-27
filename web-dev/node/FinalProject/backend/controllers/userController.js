// controllers/userController.js
const User = require('../models/User');
const Game = require('../models/Game');

// Get user's game collection
exports.getUserCollection = async (req, res) => {
  try {
    const userId = req.user.id;
    const collection = await Collection.find({ user: userId })
      .populate('game')
      .sort({ purchasedAt: -1 });
    
    res.status(200).json({ collection });
  } catch (error) {
    console.error('Get collection error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    
    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Change email
exports.changeEmail = async (req, res) => {
  try {
    const userId = req.user.id;
    const { newEmail, password } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Password is incorrect' });
    }
    
    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    
    user.email = newEmail;
    await user.save();
    
    res.status(200).json({ message: 'Email changed successfully' });
  } catch (error) {
    console.error('Change email error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload profile picture
exports.uploadProfilePic = async (req, res) => {
  try {
    const userId = req.user.id;
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.profilePicUrl = `/uploads/${req.file.filename}`;
    await user.save();
    
    res.status(200).json({ 
      message: 'Profile picture uploaded successfully',
      profilePicUrl: user.profilePicUrl
    });
  } catch (error) {
    console.error('Upload profile pic error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get All Games (Public - no auth required)
exports.getAllGames = async (req, res) => {
  try {
    const games = await Game.find({ isActive: true }).sort({ createdAt: -1 });
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
    const games = await Game.find({ isActive: true })
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
    const games = await Game.find({ isActive: true })
      .sort({ purchaseCount: -1 })
      .limit(limit);
    res.status(200).json({ games });
  } catch (error) {
    console.error('Get most purchased games error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get Trending Games
exports.getTrendingGames = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const games = await Game.find({ isActive: true, isTrending: true })
      .sort({ purchaseCount: -1, createdAt: -1 })
      .limit(limit);
    res.status(200).json({ games });
  } catch (error) {
    console.error('Get trending games error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get Discounted Games
exports.getDiscountedGames = async (req, res) => {
  try {
    const games = await Game.find({ 
      isActive: true,
      discount: { $gt: 0 } 
    }).sort({ discount: -1 });
    res.status(200).json({ games });
  } catch (error) {
    console.error('Get discounted games error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get Free Games
exports.getFreeGames = async (req, res) => {
  try {
    const games = await Game.find({ 
      isActive: true,
      price: 0 
    });
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
    const games = await Game.find({ 
      isActive: true,
      categories: category 
    }).sort({ averageRating: -1, purchaseCount: -1 });
    res.status(200).json({ games });
  } catch (error) {
    console.error('Get games by category error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get Games by Genre
exports.getGamesByGenre = async (req, res) => {
  try {
    const { genre } = req.params;
    const games = await Game.find({ 
      isActive: true,
      genre: genre 
    }).sort({ averageRating: -1, purchaseCount: -1 });
    res.status(200).json({ games });
  } catch (error) {
    console.error('Get games by genre error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get Games by Platform
exports.getGamesByPlatform = async (req, res) => {
  try {
    const { platform } = req.params;
    const games = await Game.find({ 
      isActive: true,
      availablePlatforms: platform 
    }).sort({ averageRating: -1, purchaseCount: -1 });
    res.status(200).json({ games });
  } catch (error) {
    console.error('Get games by platform error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get Games by Developer
exports.getGamesByDeveloper = async (req, res) => {
  try {
    const { developer } = req.params;
    const games = await Game.find({ 
      isActive: true,
      developer: new RegExp(developer, 'i') 
    }).sort({ createdAt: -1 });
    res.status(200).json({ games });
  } catch (error) {
    console.error('Get games by developer error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get Games by Publisher
exports.getGamesByPublisher = async (req, res) => {
  try {
    const { publisher } = req.params;
    const games = await Game.find({ 
      isActive: true,
      publisher: new RegExp(publisher, 'i') 
    }).sort({ createdAt: -1 });
    res.status(200).json({ games });
  } catch (error) {
    console.error('Get games by publisher error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get Games by Popularity Label
exports.getGamesByPopularityLabel = async (req, res) => {
  try {
    const { label } = req.params;
    const games = await Game.find({ 
      isActive: true,
      popularityLabel: label 
    }).sort({ purchaseCount: -1, averageRating: -1 });
    res.status(200).json({ games });
  } catch (error) {
    console.error('Get games by popularity label error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get New Releases (last 30 days)
exports.getNewReleases = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const games = await Game.find({ 
      isActive: true,
      createdAt: { $gte: thirtyDaysAgo } 
    }).sort({ createdAt: -1 });
    res.status(200).json({ games });
  } catch (error) {
    console.error('Get new releases error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get Games with Multiplayer Support
exports.getMultiplayerGames = async (req, res) => {
  try {
    const games = await Game.find({ 
      isActive: true,
      multiplayerSupport: true 
    }).sort({ purchaseCount: -1 });
    res.status(200).json({ games });
  } catch (error) {
    console.error('Get multiplayer games error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get VR Games
exports.getVRGames = async (req, res) => {
  try {
    const games = await Game.find({ 
      isActive: true,
      vrSupport: true 
    }).sort({ averageRating: -1 });
    res.status(200).json({ games });
  } catch (error) {
    console.error('Get VR games error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Advanced Filter Games
exports.filterGames = async (req, res) => {
  try {
    const {
      categories,
      genre,
      consoles,
      availablePlatforms,
      ratings,
      modes,
      minPrice,
      maxPrice,
      minDiscount,
      minRating,
      maxSize,
      multiplayerSupport,
      crossPlatformSupport,
      cloudSaveSupport,
      controllerSupport,
      vrSupport,
      inGamePurchases,
      soundtrackAvailability,
      gameEngine,
      language,
      tags,
      developer,
      publisher,
      popularityLabel,
      isTrending,
      sortBy,
      search
    } = req.query;

    let query = { isActive: true };

    // Text search
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { developer: new RegExp(search, 'i') },
        { publisher: new RegExp(search, 'i') },
        { tags: new RegExp(search, 'i') }
      ];
    }

    // Category filter
    if (categories) {
      const categoryArray = categories.split(',');
      query.categories = { $in: categoryArray };
    }

    // Genre filter
    if (genre) {
      const genreArray = genre.split(',');
      query.genre = { $in: genreArray };
    }

    // Console filter
    if (consoles) {
      const consoleArray = consoles.split(',');
      query.consoles = { $in: consoleArray };
    }

    // Platform filter
    if (availablePlatforms) {
      const platformArray = availablePlatforms.split(',');
      query.availablePlatforms = { $in: platformArray };
    }

    // Rating filter
    if (ratings) {
      const ratingArray = ratings.split(',');
      query.ratings = { $in: ratingArray };
    }

    // Modes filter
    if (modes) {
      const modeArray = modes.split(',');
      query.modes = { $in: modeArray };
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

    // Game size filter
    if (maxSize !== undefined) {
      query.gameSize = { $lte: parseFloat(maxSize) };
    }

    // Boolean feature filters
    if (multiplayerSupport === 'true') query.multiplayerSupport = true;
    if (crossPlatformSupport === 'true') query.crossPlatformSupport = true;
    if (cloudSaveSupport === 'true') query.cloudSaveSupport = true;
    if (controllerSupport === 'true') query.controllerSupport = true;
    if (vrSupport === 'true') query.vrSupport = true;
    if (inGamePurchases === 'false') query.inGamePurchases = false;
    if (soundtrackAvailability === 'true') query.soundtrackAvailability = true;

    // Game Engine filter
    if (gameEngine) {
      query.gameEngine = gameEngine;
    }

    // Language filter
    if (language) {
      const languageArray = language.split(',');
      query.languageSupport = { $in: languageArray };
    }

    // Tags filter
    if (tags) {
      const tagsArray = tags.split(',');
      query.tags = { $in: tagsArray };
    }

    // Developer filter
    if (developer) {
      query.developer = new RegExp(developer, 'i');
    }

    // Publisher filter
    if (publisher) {
      query.publisher = new RegExp(publisher, 'i');
    }

    // Popularity label filter
    if (popularityLabel) {
      query.popularityLabel = popularityLabel;
    }

    // Trending filter
    if (isTrending === 'true') {
      query.isTrending = true;
    }

    // Sorting
    let sort = { createdAt: -1 }; // Default sort
    if (sortBy === 'price_asc') sort = { price: 1 };
    else if (sortBy === 'price_desc') sort = { price: -1 };
    else if (sortBy === 'rating') sort = { averageRating: -1 };
    else if (sortBy === 'popularity') sort = { purchaseCount: -1 };
    else if (sortBy === 'newest') sort = { createdAt: -1 };
    else if (sortBy === 'oldest') sort = { createdAt: 1 };
    else if (sortBy === 'discount') sort = { discount: -1 };
    else if (sortBy === 'name_asc') sort = { name: 1 };
    else if (sortBy === 'name_desc') sort = { name: -1 };
    else if (sortBy === 'size_asc') sort = { gameSize: 1 };
    else if (sortBy === 'size_desc') sort = { gameSize: -1 };

    const games = await Game.find(query).sort(sort);
    res.status(200).json({ 
      games,
      count: games.length,
      filters: req.query
    });
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

// Get Available Filters (for filter UI)
exports.getAvailableFilters = async (req, res) => {
  try {
    const games = await Game.find({ isActive: true });

    // Extract unique values for filters
    const genres = [...new Set(games.flatMap(g => g.genre || []))];
    const categories = [...new Set(games.flatMap(g => g.categories || []))];
    const platforms = [...new Set(games.flatMap(g => g.availablePlatforms || []))];
    const modes = [...new Set(games.flatMap(g => g.modes || []))];
    const ratings = [...new Set(games.flatMap(g => g.ratings || []))];
    const engines = [...new Set(games.map(g => g.gameEngine).filter(Boolean))];
    const developers = [...new Set(games.map(g => g.developer).filter(Boolean))];
    const publishers = [...new Set(games.map(g => g.publisher).filter(Boolean))];
    const languages = [...new Set(games.flatMap(g => g.languageSupport || []))];
    const tags = [...new Set(games.flatMap(g => g.tags || []))];
    const popularityLabels = [...new Set(games.map(g => g.popularityLabel).filter(Boolean))];

    res.status(200).json({
      genres: genres.sort(),
      categories: categories.sort(),
      platforms: platforms.sort(),
      modes: modes.sort(),
      ratings: ratings.sort(),
      engines: engines.sort(),
      developers: developers.sort(),
      publishers: publishers.sort(),
      languages: languages.sort(),
      tags: tags.sort(),
      popularityLabels: popularityLabels.sort()
    });
  } catch (error) {
    console.error('Get available filters error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ============ CART ENDPOINTS (Protected - Auth Required) ============

// Add to Cart
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { gameId, quantity = 1 } = req.body;

    if (!gameId) {
      return res.status(400).json({ message: 'Game ID is required' });
    }

    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const existingCartItem = user.cart.find(
      item => item.gameId.toString() === gameId
    );

    if (existingCartItem) {
      existingCartItem.quantity += quantity;
    } else {
      user.cart.push({ gameId, quantity });
    }

    await user.save();

    const populatedUser = await User.findById(userId).populate('cart.gameId');
    
    res.status(200).json({
      message: 'Added to cart successfully',
      cart: populatedUser.cart
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get Cart
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).populate('cart.gameId');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let totalPrice = 0;
    let totalDiscountedPrice = 0;

    user.cart.forEach(item => {
      if (item.gameId) {
        const gamePrice = item.gameId.price * item.quantity;
        const discountedPrice = item.gameId.discount > 0
          ? (item.gameId.price - (item.gameId.price * item.gameId.discount / 100)) * item.quantity
          : gamePrice;

        totalPrice += gamePrice;
        totalDiscountedPrice += discountedPrice;
      }
    });

    res.status(200).json({
      cart: user.cart,
      totalItems: user.cart.length,
      totalPrice: parseFloat(totalPrice.toFixed(2)),
      totalDiscountedPrice: parseFloat(totalDiscountedPrice.toFixed(2)),
      totalSavings: parseFloat((totalPrice - totalDiscountedPrice).toFixed(2))
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove from Cart
exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { gameId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const itemIndex = user.cart.findIndex(
      item => item.gameId.toString() === gameId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    user.cart.splice(itemIndex, 1);
    await user.save();

    const populatedUser = await User.findById(userId).populate('cart.gameId');

    res.status(200).json({
      message: 'Removed from cart successfully',
      cart: populatedUser.cart
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update Cart Item Quantity
exports.updateCartQuantity = async (req, res) => {
  try {
    const userId = req.user.id;
    const { gameId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const cartItem = user.cart.find(
      item => item.gameId.toString() === gameId
    );

    if (!cartItem) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    cartItem.quantity = quantity;
    await user.save();

    const populatedUser = await User.findById(userId).populate('cart.gameId');

    res.status(200).json({
      message: 'Cart updated successfully',
      cart: populatedUser.cart
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Clear Cart
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.cart = [];
    await user.save();

    res.status(200).json({
      message: 'Cart cleared successfully',
      cart: []
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add Review and Rating to Game
exports.addReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { gameId } = req.params;
    const { rating, comment } = req.body;

    // Validation
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Check if user is admin
    if (req.user.isAdmin) {
      return res.status(403).json({ message: 'Admins cannot review games' });
    }

    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user already reviewed this game
    const existingReviewIndex = game.reviews.findIndex(
      review => review.user.toString() === userId
    );

    if (existingReviewIndex !== -1) {
      return res.status(400).json({ 
        message: 'You have already reviewed this game. Use the edit option to update your review.' 
      });
    }

    // Add new review
    game.reviews.push({
      user: userId,
      rating: Number(rating),
      comment: comment || '',
      createdAt: new Date()
    });

    // Recalculate average rating
    const totalRating = game.reviews.reduce((sum, review) => sum + review.rating, 0);
    game.averageRating = (totalRating / game.reviews.length).toFixed(2);

    await game.save();

    // Populate user info for the response - UPDATED TO INCLUDE profilePicUrl
    const updatedGame = await Game.findById(gameId)
      .populate('reviews.user', 'username email profilePicUrl');

    res.status(201).json({
      message: 'Review added successfully',
      reviews: updatedGame.reviews,
      averageRating: updatedGame.averageRating
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update Review
exports.updateReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { gameId } = req.params;
    const { rating, comment } = req.body;

    // Validation
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Check if user is admin
    if (req.user.isAdmin) {
      return res.status(403).json({ message: 'Admins cannot review games' });
    }

    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    // Find user's review
    const reviewIndex = game.reviews.findIndex(
      review => review.user.toString() === userId
    );

    if (reviewIndex === -1) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Update review
    game.reviews[reviewIndex].rating = Number(rating);
    game.reviews[reviewIndex].comment = comment || '';
    game.reviews[reviewIndex].updatedAt = new Date();

    // Recalculate average rating
    const totalRating = game.reviews.reduce((sum, review) => sum + review.rating, 0);
    game.averageRating = (totalRating / game.reviews.length).toFixed(2);

    await game.save();

    // Populate user info for the response - UPDATED TO INCLUDE profilePicUrl
    const updatedGame = await Game.findById(gameId)
      .populate('reviews.user', 'username email profilePicUrl');

    res.status(200).json({
      message: 'Review updated successfully',
      reviews: updatedGame.reviews,
      averageRating: updatedGame.averageRating
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete Review
exports.deleteReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { gameId } = req.params;

    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    // Find user's review
    const reviewIndex = game.reviews.findIndex(
      review => review.user.toString() === userId
    );

    if (reviewIndex === -1) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Remove review
    game.reviews.splice(reviewIndex, 1);

    // Recalculate average rating
    if (game.reviews.length > 0) {
      const totalRating = game.reviews.reduce((sum, review) => sum + review.rating, 0);
      game.averageRating = (totalRating / game.reviews.length).toFixed(2);
    } else {
      game.averageRating = 0;
    }

    await game.save();

    // Populate user info for the response - UPDATED TO INCLUDE profilePicUrl
    const updatedGame = await Game.findById(gameId)
      .populate('reviews.user', 'username email profilePicUrl');

    res.status(200).json({
      message: 'Review deleted successfully',
      reviews: updatedGame.reviews,
      averageRating: updatedGame.averageRating
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get All Reviews for a Game
exports.getGameReviews = async (req, res) => {
  try {
    const { gameId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || 'newest'; // newest, oldest, highest, lowest

    // UPDATED TO INCLUDE profilePicUrl
    const game = await Game.findById(gameId)
      .populate('reviews.user', 'username email profilePicUrl');

    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    let reviews = [...game.reviews];

    // Sort reviews
    if (sortBy === 'newest') {
      reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'oldest') {
      reviews.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === 'highest') {
      reviews.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'lowest') {
      reviews.sort((a, b) => a.rating - b.rating);
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedReviews = reviews.slice(startIndex, endIndex);

    // Calculate rating distribution
    const ratingDistribution = {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length
    };

    res.status(200).json({
      reviews: paginatedReviews,
      totalReviews: reviews.length,
      averageRating: game.averageRating,
      ratingDistribution,
      currentPage: page,
      totalPages: Math.ceil(reviews.length / limit)
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get User's Review for a Game
exports.getUserReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { gameId } = req.params;

    // UPDATED TO INCLUDE profilePicUrl
    const game = await Game.findById(gameId)
      .populate('reviews.user', 'username email profilePicUrl');

    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    const userReview = game.reviews.find(
      review => review.user._id.toString() === userId
    );

    if (!userReview) {
      return res.status(404).json({ message: 'No review found' });
    }

    res.status(200).json({ review: userReview });
  } catch (error) {
    console.error('Get user review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};