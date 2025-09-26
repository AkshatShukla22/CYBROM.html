// sockets/socketHandler.js - Socket.io connection management
const Message = require('../models/Message');

// Store active users for socket connections
const activeUsers = new Map();

const socketHandler = (io) => {
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

  // Return active users count for health check
  return () => activeUsers.size;
};

module.exports = socketHandler;