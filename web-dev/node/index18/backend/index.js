const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Store connected users
const users = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle user joining
  socket.on('join', (username) => {
    users.set(socket.id, username);
    socket.broadcast.emit('userJoined', `${username} joined the chat`);
    console.log(`${username} joined`);
  });

  // Handle new messages
  socket.on('message', (data) => {
    const username = users.get(socket.id);
    const messageData = {
      id: Date.now(),
      username: username,
      message: data.message,
      timestamp: new Date().toLocaleTimeString()
    };
    
    // Send message to all clients including sender
    io.emit('message', messageData);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const username = users.get(socket.id);
    if (username) {
      users.delete(socket.id);
      socket.broadcast.emit('userLeft', `${username} left the chat`);
      console.log(`${username} disconnected`);
    }
  });
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});