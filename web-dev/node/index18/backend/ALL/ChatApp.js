// backend/server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Configure CORS for Socket.io
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", // React app URL
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors());
app.use(express.json());

// Store online users
const onlineUsers = new Map(); // socketId -> username

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Chat server is running!' });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle user joining chat
  socket.on('joinChat', (username) => {
    console.log(`${username} joined the chat`);
    
    // Store user information
    onlineUsers.set(socket.id, username);
    socket.username = username;
    
    // Notify all users about new user
    socket.broadcast.emit('message', {
      type: 'system',
      message: `${username} joined the chat`,
      timestamp: new Date()
    });
    
    // Send current online users to all clients
    const usersList = Array.from(onlineUsers.values());
    io.emit('updateUsers', usersList);
    
    // Send welcome message to the new user
    socket.emit('message', {
      type: 'system', 
      message: 'Welcome to the chat!',
      timestamp: new Date()
    });
  });

  // Handle sending messages
  socket.on('sendMessage', (messageData) => {
    console.log(`Message from ${messageData.username}: ${messageData.message}`);
    
    // Broadcast message to all connected users
    io.emit('message', {
      type: 'user',
      username: messageData.username,
      message: messageData.message,
      timestamp: messageData.timestamp
    });
  });

  // Handle user disconnection
  socket.on('disconnect', () => {
    const username = onlineUsers.get(socket.id);
    
    if (username) {
      console.log(`${username} disconnected`);
      
      // Remove user from online users
      onlineUsers.delete(socket.id);
      
      // Notify all users about user leaving
      socket.broadcast.emit('message', {
        type: 'system',
        message: `${username} left the chat`,
        timestamp: new Date()
      });
      
      // Send updated online users list
      const usersList = Array.from(onlineUsers.values());
      io.emit('updateUsers', usersList);
    }
  });

  // Handle typing indicators (optional feature)
  socket.on('typing', (data) => {
    socket.broadcast.emit('userTyping', {
      username: data.username,
      isTyping: data.isTyping
    });
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.io server ready for connections`);
});