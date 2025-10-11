// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authenticateToken = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// All admin routes require authentication
router.use(authenticateToken);

// Game management
router.post('/games', upload.fields([
  { name: 'gamePic', maxCount: 1 },
  { name: 'backgroundPic', maxCount: 1 },
  { name: 'gameplayPic0', maxCount: 1 },
  { name: 'gameplayPic1', maxCount: 1 },
  { name: 'gameplayPic2', maxCount: 1 },
  { name: 'gameplayPic3', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]), adminController.addGame);

router.get('/games', adminController.getAllGames);
router.get('/games/:id', adminController.getGameById); // New route for single game details
router.put('/games/:id', upload.fields([
  { name: 'gamePic', maxCount: 1 },
  { name: 'backgroundPic', maxCount: 1 },
  { name: 'gameplayPic0', maxCount: 1 },
  { name: 'gameplayPic1', maxCount: 1 },
  { name: 'gameplayPic2', maxCount: 1 },
  { name: 'gameplayPic3', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]), adminController.updateGame);
router.delete('/games/:id', adminController.deleteGame);
router.patch('/games/:id/discount', adminController.setDiscount);

// User management
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserDetails);

// Purchase tracking
router.get('/purchases', adminController.getAllPurchases);

module.exports = router;