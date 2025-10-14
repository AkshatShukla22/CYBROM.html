// controllers/userController.js
const User = require('../models/User');
const Game = require('../models/Game');

// ============ GAME ENDPOINTS ============

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