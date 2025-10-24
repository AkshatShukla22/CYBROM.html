// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../middleware/authMiddleware');

// ============ PUBLIC ROUTES (No Auth Required) ============

// Basic Game Routes
router.get('/games', userController.getAllGames);
router.get('/games/top-rated', userController.getTopRatedGames);
router.get('/games/most-purchased', userController.getMostPurchasedGames);
router.get('/games/trending', userController.getTrendingGames);
router.get('/games/discounted', userController.getDiscountedGames);
router.get('/games/free', userController.getFreeGames);
router.get('/games/new-releases', userController.getNewReleases);

// Feature-based Routes
router.get('/games/multiplayer', userController.getMultiplayerGames);
router.get('/games/vr', userController.getVRGames);

// Category & Classification Routes
router.get('/games/category/:category', userController.getGamesByCategory);
router.get('/games/genre/:genre', userController.getGamesByGenre);
router.get('/games/platform/:platform', userController.getGamesByPlatform);

// Publisher & Developer Routes
router.get('/games/developer/:developer', userController.getGamesByDeveloper);
router.get('/games/publisher/:publisher', userController.getGamesByPublisher);

// Popularity Routes
router.get('/games/label/:label', userController.getGamesByPopularityLabel);

// Advanced Filter Route
router.get('/games/filter', userController.filterGames);

// Get Available Filters (for building filter UI)
router.get('/games/filters/available', userController.getAvailableFilters);

// Single Game Details
router.get('/games/:id', userController.getGameById);

// ============ PROTECTED ROUTES (Auth Required) ============

// Cart Routes - All require authentication
router.post('/cart/add', authenticateToken, userController.addToCart);
router.get('/cart', authenticateToken, userController.getCart);
router.delete('/cart/remove/:gameId', authenticateToken, userController.removeFromCart);
router.put('/cart/update/:gameId', authenticateToken, userController.updateCartQuantity);
router.delete('/cart/clear', authenticateToken, userController.clearCart);

// Get all reviews for a game (public)
router.get('/games/:gameId/reviews', userController.getGameReviews);

// Get user's own review for a game (protected)
router.get('/games/:gameId/reviews/my-review', authenticateToken, userController.getUserReview);

// Add review (protected)
router.post('/games/:gameId/reviews', authenticateToken, userController.addReview);

// Update review (protected)
router.put('/games/:gameId/reviews', authenticateToken, userController.updateReview);

// Delete review (protected)
router.delete('/games/:gameId/reviews', authenticateToken, userController.deleteReview);

module.exports = router;