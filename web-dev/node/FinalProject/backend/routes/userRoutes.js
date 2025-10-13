// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const supportController = require('../controllers/supportController');
const authenticateToken = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public routes - no authentication required
router.get('/games', userController.getAllGames);
router.get('/games/top-rated', userController.getTopRatedGames);
router.get('/games/most-purchased', userController.getMostPurchasedGames);
router.get('/games/discounted', userController.getDiscountedGames);
router.get('/games/free', userController.getFreeGames);
router.get('/games/new-releases', userController.getNewReleases);
router.get('/games/category/:category', userController.getGamesByCategory);
router.get('/games/filter', userController.filterGames);
router.get('/games/:id', userController.getGameById);


module.exports = router;