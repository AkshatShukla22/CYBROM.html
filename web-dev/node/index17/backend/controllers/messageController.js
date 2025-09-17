// controllers/messageController.js - Updated with better error handling
const Message = require('../models/Message');
const User = require('../models/User');
const mongoose = require('mongoose');

// @desc    Get user's conversations
// @access  Private
const getConversations = async (req, res) => {
  try {
    const userId = req.userId;
    console.log('Getting conversations for user:', userId);
    
    // First, let's just get all messages for this user
    const userMessages = await Message.find({
      $or: [
        { senderId: userId },
        { receiverId: userId }
      ]
    })
    .sort({ createdAt: -1 })
    .populate('senderId', 'name profileImage userType specialization')
    .populate('receiverId', 'name profileImage userType specialization')
    .lean();

    console.log('Found messages:', userMessages.length);

    if (userMessages.length === 0) {
      return res.json({
        success: true,
        conversations: []
      });
    }

    // Group conversations manually
    const conversationsMap = new Map();
    
    userMessages.forEach(message => {
      // Determine the other user (not the current user)
      const otherUserId = message.senderId._id.toString() === userId ? 
        message.receiverId._id.toString() : message.senderId._id.toString();
      
      const otherUser = message.senderId._id.toString() === userId ? 
        message.receiverId : message.senderId;
      
      // If this conversation doesn't exist yet, or this message is newer
      if (!conversationsMap.has(otherUserId)) {
        conversationsMap.set(otherUserId, {
          userId: otherUserId,
          name: otherUser.name,
          email: otherUser.email || '',
          profileImage: otherUser.profileImage,
          userType: otherUser.userType,
          specialization: otherUser.specialization,
          isOnline: false,
          lastMessage: {
            content: message.content,
            timestamp: message.createdAt,
            senderId: message.senderId._id.toString(),
            isRead: message.isRead
          },
          unreadCount: 0 // We'll calculate this separately
        });
      }
    });

    // Convert map to array and calculate unread counts
    const conversations = Array.from(conversationsMap.values());
    
    // Calculate unread count for each conversation
    for (let conversation of conversations) {
      const unreadCount = await Message.countDocuments({
        senderId: conversation.userId,
        receiverId: userId,
        isRead: false
      });
      conversation.unreadCount = unreadCount;
    }

    // Sort by last message timestamp
    conversations.sort((a, b) => 
      new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp)
    );

    console.log('Returning conversations:', conversations.length);
    
    res.json({
      success: true,
      conversations
    });
    
  } catch (error) {
    console.error('Get conversations error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching conversations',
      error: error.message
    });
  }
};

// Rest of your controller functions remain the same...
const getMessages = async (req, res) => {
  try {
    const userId = req.userId;
    const { userId: otherUserId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    console.log('Getting messages between:', userId, 'and', otherUserId);
    
    if (!otherUserId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }
    
    // Check if the other user exists
    const otherUser = await User.findById(otherUserId).select('name email profileImage userType specialization');
    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId }
      ],
      isDeleted: { $ne: true }
    })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit))
    .lean();
    
    // Reverse to show oldest first
    const reversedMessages = messages.reverse();
    
    console.log('Messages found:', reversedMessages.length);
    
    res.json({
      success: true,
      messages: reversedMessages,
      otherUser: {
        id: otherUser._id,
        name: otherUser.name,
        email: otherUser.email,
        profileImage: otherUser.profileImage,
        userType: otherUser.userType,
        specialization: otherUser.specialization
      }
    });
    
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching messages',
      error: error.message
    });
  }
};

// Keep all other functions the same as before...
const sendMessage = async (req, res) => {
  try {
    const senderId = req.userId;
    const { receiverId, content } = req.body;
    
    console.log('Sending message from:', senderId, 'to:', receiverId);
    
    if (!receiverId || !content) {
      return res.status(400).json({
        success: false,
        message: 'Receiver ID and content are required'
      });
    }
    
    if (!receiverId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid receiver ID format'
      });
    }
    
    if (content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message content cannot be empty'
      });
    }
    
    if (content.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Message content is too long (max 1000 characters)'
      });
    }
    
    // Check if sender and receiver exist
    const [sender, receiver] = await Promise.all([
      User.findById(senderId).select('name profileImage'),
      User.findById(receiverId).select('name profileImage')
    ]);
    
    if (!sender || !receiver) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (senderId === receiverId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send message to yourself'
      });
    }
    
    const message = new Message({
      senderId,
      receiverId,
      content: content.trim(),
      senderName: sender.name,
      senderImage: sender.profileImage
    });
    
    await message.save();
    
    console.log('Message saved:', message._id);
    
    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: {
        messageId: message._id,
        content: message.content,
        timestamp: message.createdAt,
        senderName: message.senderName,
        senderImage: message.senderImage
      }
    });
    
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending message',
      error: error.message
    });
  }
};

const markAsRead = async (req, res) => {
  try {
    const receiverId = req.userId;
    const { senderId } = req.params;
    
    if (!senderId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid sender ID format'
      });
    }
    
    const result = await Message.updateMany(
      {
        senderId: senderId,
        receiverId: receiverId,
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );
    
    console.log('Marked as read:', result.modifiedCount, 'messages');
    
    res.json({
      success: true,
      message: 'Messages marked as read'
    });
    
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while marking messages as read',
      error: error.message
    });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const userId = req.userId;
    
    const unreadCount = await Message.countDocuments({
      receiverId: userId,
      isRead: false,
      isDeleted: { $ne: true }
    });
    
    res.json({
      success: true,
      unreadCount
    });
    
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while getting unread count',
      error: error.message
    });
  }
};

const searchUsers = async (req, res) => {
  try {
    const currentUserId = req.userId;
    const { q, type } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.json({
        success: true,
        users: []
      });
    }
    
    const searchQuery = q.trim();
    const searchRegex = new RegExp(searchQuery, 'i');
    
    // Build query
    let query = {
      _id: { $ne: currentUserId }, // Exclude current user
      isActive: true,
      $or: [
        { name: searchRegex },
        { email: searchRegex }
      ]
    };
    
    // Filter by user type if specified
    if (type && ['doctor', 'user'].includes(type)) {
      query.userType = type;
    }
    
    const users = await User.find(query)
      .select('name email profileImage userType specialization')
      .limit(20)
      .sort({ name: 1 })
      .lean();
    
    res.json({
      success: true,
      users: users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        userType: user.userType,
        specialization: user.specialization
      }))
    });
    
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching users',
      error: error.message
    });
  }
};

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  getUnreadCount,
  searchUsers
};