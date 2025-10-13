// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const supportController = require('../controllers/supportController');
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

// News management
// Add these routes to your adminRoutes.js

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

// Support Management (Admin)
router.get('/support/tickets', supportController.getAllTickets);
router.get('/support/tickets/:id', supportController.getTicketByIdAdmin);
router.post('/support/tickets/:id/reply', supportController.addAdminReply);
router.patch('/support/tickets/:id/status', supportController.updateTicketStatus);
router.delete('/support/tickets/:id', supportController.deleteTicket);

module.exports = router;