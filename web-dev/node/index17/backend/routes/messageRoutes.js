// routes/messageRoutes.js
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

// Get user's conversations
router.get('/conversations', getConversations);

// Get messages between two users
router.get('/conversation/:userId', getMessages);

// Send a message
router.post('/send', sendMessage);

// Mark messages as read
router.put('/read/:senderId', markAsRead);

// Get unread message count
router.get('/unread-count', getUnreadCount);

// Search users for messaging
router.get('/search-users', searchUsers);

module.exports = router;