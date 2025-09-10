const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const doctorRoutes = require('./routes/doctorRoutes');

// Initialize Express app - MOVE THIS TO THE TOP
const app = express();

// Connect to MongoDB
mongoose.connect(process.env.mongo_DB).then(() => {
  console.log("MongoDB Connected Successfully!");
}).catch((error) => {
  console.error("MongoDB Connection Error:", error);
  process.exit(1);
});

// Middleware - Now app is defined, so this will work
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'], // Combined origins
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    message: 'Server is running successfully!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    message: 'API is working!',
    timestamp: new Date().toISOString()
  });
});

// Serve static files (for profile images, documents, etc.)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
const Port = process.env.PORT || 8000; // Fixed: PORT should be uppercase
const server = app.listen(Port, () => {
  console.log(`
🚀 MediCare Backend Server Started!
📍 Port: ${Port}
🌐 Environment: ${process.env.NODE_ENV || 'development'}
📅 Started at: ${new Date().toISOString()}
🔗 Health Check: http://localhost:${Port}/health
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

module.exports = app;