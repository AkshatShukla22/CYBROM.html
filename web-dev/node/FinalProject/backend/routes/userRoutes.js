// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// ============ PUBLIC ROUTES (No Auth Required) ============

// Profile Routes
router.get('/collection', authenticateToken, userController.getUserCollection);
router.put('/change-password', authenticateToken, userController.changePassword);
router.put('/change-email', authenticateToken, userController.changeEmail);
router.post('/upload-profile-pic', authenticateToken, upload.single('profilePic'), userController.uploadProfilePic);

// Basic Game Routes
router.get('/games', userController.getAllGames);
router.get('/games/top-rated', userController.getTopRatedGames);
router.get('/games/most-purchased', userController.getMostPurchasedGames);

// NEW: Featured & Trending Routes
router.get('/games/featured', userController.getFeaturedGames);
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

// Single Game Details (with optional view tracking)
router.get('/games/:id', userController.getGameById);

// NEW: Increment view count
router.post('/games/:id/view', userController.incrementViewCount);

// ============ PROTECTED ROUTES (Auth Required) ============

// Cart Routes - All require authentication
router.post('/cart/add', authenticateToken, userController.addToCart);
router.get('/cart', authenticateToken, userController.getCart);
router.delete('/cart/remove/:gameId', authenticateToken, userController.removeFromCart);
router.put('/cart/update/:gameId', authenticateToken, userController.updateCartQuantity);
router.delete('/cart/clear', authenticateToken, userController.clearCart);

// Review Routes
router.get('/games/:gameId/reviews', userController.getGameReviews);
router.get('/games/:gameId/reviews/my-review', authenticateToken, userController.getUserReview);
router.post('/games/:gameId/reviews', authenticateToken, userController.addReview);
router.put('/games/:gameId/reviews', authenticateToken, userController.updateReview);
router.delete('/games/:gameId/reviews', authenticateToken, userController.deleteReview);

// Payment Routes
router.post('/payment/create-order', authenticateToken, userController.createOrder);
router.post('/payment/verify', authenticateToken, userController.verifyPayment);
router.post('/payment/create-order-single', authenticateToken, userController.createOrderSingle);


module.exports = router;