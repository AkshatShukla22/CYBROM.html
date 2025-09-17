const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const messageRoutes = require('./routes/messageRoutes');

// Import Message model for socket operations
const Message = require('./models/Message');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Socket.io setup with CORS
const io = socketIo(server, {
  cors: {
    origin: [process.env.FRONTEND_URL],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Connect to MongoDB
mongoose.connect(process.env.mongo_DB).then(() => {
  console.log("MongoDB Connected Successfully!");
}).catch((error) => {
  console.error("MongoDB Connection Error:", error);
  process.exit(1);
});

// Middleware
app.use(cors({
  origin: [process.env.FRONTEND_URL],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: process.env.MAX_FILE_SIZE  }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Store active users for socket connections
const activeUsers = new Map();

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // User joins with their user ID
  socket.on('join', (userId) => {
    activeUsers.set(userId, socket.id);
    socket.userId = userId;
    console.log(`User ${userId} joined with socket ${socket.id}`);
    
    // Notify others that user is online
    socket.broadcast.emit('userOnline', userId);
  });

  // Handle sending messages
  // In your index.js, update the sendMessage socket handler with more logging:

  socket.on('sendMessage', async (messageData) => {
    try {
      console.log('Socket sendMessage received:', messageData);
      console.log('Socket user ID:', socket.userId);
      
      const { receiverId, content, senderName, senderImage } = messageData;
      
      if (!socket.userId) {
        console.error('No user ID on socket');
        socket.emit('messageError', { error: 'User not authenticated' });
        return;
      }
      
      // Save message to database
      const message = new Message({
        senderId: socket.userId,
        receiverId,
        content: content.trim(),
        senderName,
        senderImage,
        messageType: 'text',
        isRead: false
      });
      
      console.log('About to save message:', {
        senderId: message.senderId,
        receiverId: message.receiverId,
        content: message.content
      });
      
      await message.save();
      console.log('Message saved successfully with ID:', message._id);

      // Send message to receiver if they're online
      const receiverSocketId = activeUsers.get(receiverId);
      console.log('Receiver socket ID:', receiverSocketId);
      
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('newMessage', {
          messageId: message._id,
          senderId: socket.userId,
          senderName,
          senderImage,
          content,
          timestamp: message.createdAt,
          isRead: false
        });
        console.log('Message sent to receiver via socket');
      } else {
        console.log('Receiver not online');
      }

      // Confirm message sent to sender
      socket.emit('messageSent', {
        messageId: message._id,
        timestamp: message.createdAt
      });
      console.log('Message confirmation sent to sender');

    } catch (error) {
      console.error('Send message error:', error);
      console.error('Error stack:', error.stack);
      socket.emit('messageError', { error: 'Failed to send message' });
    }
  });

  // Handle message read status
  socket.on('markAsRead', async (messageIds) => {
    try {
      await Message.updateMany(
        { _id: { $in: messageIds }, receiverId: socket.userId },
        { isRead: true, readAt: new Date() }
      );
      
      socket.emit('messagesMarkedRead', messageIds);
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  });

  // Handle typing indicators
  socket.on('typing', (receiverId) => {
    const receiverSocketId = activeUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('userTyping', socket.userId);
    }
  });

  socket.on('stopTyping', (receiverId) => {
    const receiverSocketId = activeUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('userStoppedTyping', socket.userId);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    if (socket.userId) {
      activeUsers.delete(socket.userId);
      socket.broadcast.emit('userOffline', socket.userId);
      console.log(`User ${socket.userId} disconnected`);
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    message: 'Server is running successfully!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    activeConnections: activeUsers.size
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/messages', messageRoutes);

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    message: 'API is working!',
    timestamp: new Date().toISOString()
  });
});

// Serve static files (for profile images, documents, etc.)
app.use(process.env.UPLOAD_ROUTE, express.static(path.join(__dirname, process.env.UPLOAD_DIR)));

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  
  // Mongoose validation error
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => err.message);
    return res.status(400).json({
      message: 'Validation Error',
      errors
    });
  }

  // Mongoose duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return res.status(400).json({
      message: `${field} already exists`
    });
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      message: 'Invalid token'
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      message: 'Token expired'
    });
  }

  // Default error
  res.status(error.status || 500).json({
    message: error.message || 'Internal Server Error'
  });
});

// Handle 404 - Route not found
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Start server
const Port = process.env.PORT || 8000;
server.listen(Port, () => {
  console.log(`
🚀 MediCare Backend Server Started!
📍 Port: ${Port}
🌐 Environment: ${process.env.NODE_ENV || 'development'}
📅 Started at: ${new Date().toISOString()}
🔗 Health Check: http://localhost:${Port}/health
💬 Socket.io enabled for real-time messaging
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error('Unhandled Promise Rejection:', err.message);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
  process.exit(1);
});

module.exports = { app, server, io };