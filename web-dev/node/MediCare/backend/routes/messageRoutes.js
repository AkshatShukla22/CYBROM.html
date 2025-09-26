// routes/messageRoutes.js - Clean message routes
const express = require('express');
const auth = require('../middleware/auth');
const {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  getUnreadCount,
  searchUsers
} = require('../controllers/messageController');

const router = express.Router();

// All message routes require authentication
router.use(auth);

// Conversation management
router.get('/conversations', getConversations);
router.get('/conversation/:userId', getMessages);

// Message operations
router.post('/send', sendMessage);
router.put('/read/:senderId', markAsRead);
router.get('/unread-count', getUnreadCount);

// User search for messaging
router.get('/search-users', searchUsers);

module.exports = router;