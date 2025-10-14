// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const supportController = require('../controllers/supportController');
const authenticateToken = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// ============ PUBLIC ROUTES (No Auth Required) ============

// Game Routes
router.get('/games', userController.getAllGames);
router.get('/games/top-rated', userController.getTopRatedGames);
router.get('/games/most-purchased', userController.getMostPurchasedGames);
router.get('/games/discounted', userController.getDiscountedGames);
router.get('/games/free', userController.getFreeGames);
router.get('/games/new-releases', userController.getNewReleases);
router.get('/games/category/:category', userController.getGamesByCategory);
router.get('/games/filter', userController.filterGames);
router.get('/games/:id', userController.getGameById);

// ============ PROTECTED ROUTES (Auth Required) ============

// Cart Routes - All require authentication
router.post('/cart/add', authenticateToken, userController.addToCart);
router.get('/cart', authenticateToken, userController.getCart);
router.delete('/cart/remove/:gameId', authenticateToken, userController.removeFromCart);
router.put('/cart/update/:gameId', authenticateToken, userController.updateCartQuantity);
router.delete('/cart/clear', authenticateToken, userController.clearCart);

module.exports = router;