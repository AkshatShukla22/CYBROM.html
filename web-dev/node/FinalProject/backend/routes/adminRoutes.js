// routes/adminRoutes.js - ADD THESE NEW ROUTES
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const supportController = require('../controllers/supportController');
const authenticateToken = require('../middleware/authMiddleware');
const verifyAdmin = require('../middleware/adminMiddleware');
const upload = require('../middleware/uploadMiddleware');

// All admin routes require authentication AND admin privileges
router.use(authenticateToken);
router.use(verifyAdmin);

// Game management with enhanced file uploads
router.post('/games', upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'backgroundPic', maxCount: 1 },
  { name: 'trailer', maxCount: 1 },
  { name: 'additionalImage0', maxCount: 1 },
  { name: 'additionalImage1', maxCount: 1 },
  { name: 'additionalImage2', maxCount: 1 },
  { name: 'gameplayPic0', maxCount: 1 },
  { name: 'gameplayPic1', maxCount: 1 },
  { name: 'gameplayPic2', maxCount: 1 },
  { name: 'gameplayPic3', maxCount: 1 }
]), adminController.addGame);

router.get('/games', adminController.getAllGames);
router.get('/games/:id', adminController.getGameById);

router.put('/games/:id', upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'backgroundPic', maxCount: 1 },
  { name: 'trailer', maxCount: 1 },
  { name: 'additionalImage0', maxCount: 1 },
  { name: 'additionalImage1', maxCount: 1 },
  { name: 'additionalImage2', maxCount: 1 },
  { name: 'gameplayPic0', maxCount: 1 },
  { name: 'gameplayPic1', maxCount: 1 },
  { name: 'gameplayPic2', maxCount: 1 },
  { name: 'gameplayPic3', maxCount: 1 }
]), adminController.updateGame);

router.delete('/games/:id', adminController.deleteGame);
router.patch('/games/:id/discount', adminController.setDiscount);

// NEW: Featured & Trending Management
router.patch('/games/:id/featured', adminController.setFeaturedStatus);
router.patch('/games/:id/trending', adminController.setTrendingStatus);
router.get('/games/featured/list', adminController.getFeaturedGames);
router.get('/games/trending/list', adminController.getTrendingGames);
router.put('/games/featured/order', adminController.updateFeaturedOrder);
router.put('/games/trending/order', adminController.updateTrendingOrder);
router.post('/games/:id/view', adminController.incrementViewCount);

// User management
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserDetails);
router.patch('/users/:id/admin-status', adminController.updateUserAdminStatus);

// Purchase tracking
router.get('/purchases', adminController.getAllPurchases);

// News management
router.post('/news', upload.fields([
  { name: 'headingImage', maxCount: 1 },
  { name: 'detailImage', maxCount: 1 }
]), adminController.addNews);

router.get('/news', adminController.getAllNews);
router.get('/news/:id', adminController.getNewsById);

router.put('/news/:id', upload.fields([
  { name: 'headingImage', maxCount: 1 },
  { name: 'detailImage', maxCount: 1 }
]), adminController.updateNews);

router.delete('/news/:id', adminController.deleteNews);

// Support management routes
router.get('/support/tickets', supportController.getAllTickets);
router.get('/support/tickets/:id', supportController.getTicketByIdAdmin);
router.post('/support/tickets/:id/reply', supportController.addAdminReply);
router.patch('/support/tickets/:id/status', supportController.updateTicketStatus);
router.delete('/support/tickets/:id', supportController.deleteTicket);

console.log('[ADMIN ROUTES] All admin routes including featured/trending management registered successfully');

module.exports = router;