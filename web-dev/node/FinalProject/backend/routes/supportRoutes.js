// routes/supportRoutes.js - WITH DEBUG LOGGING
const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');
const authenticateToken = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Add logging middleware to debug
router.use((req, res, next) => {
  console.log(`[SUPPORT ROUTE] ${req.method} ${req.path}`);
  next();
});

// User Support Routes
router.post('/tickets', authenticateToken, upload.array('images', 5), supportController.createTicket);
router.get('/tickets', authenticateToken, supportController.getUserTickets);
router.get('/tickets/:id', authenticateToken, supportController.getTicketById);
router.post('/tickets/:id/message', authenticateToken, supportController.addMessage);

console.log('[SUPPORT ROUTES] Routes registered successfully');

module.exports = router;