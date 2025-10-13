// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  try {
    // Get token from cookie
    const token = req.cookies.token;
    
    // Debug log
    console.log('Auth Middleware - Token exists:', !!token);
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required. Please log in.' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Debug log
    console.log('Auth Middleware - Decoded token:', decoded);
    
    // Set user info in request
    // IMPORTANT: Use 'id' to match the token payload from authController
    req.user = {
      id: decoded.id,
      userId: decoded.id, // Add userId as alias for compatibility
      username: decoded.username,
      email: decoded.email,
      isAdmin: decoded.isAdmin || false
    };
    
    console.log('Auth Middleware - Set req.user:', req.user);
    
    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token. Please log in again.' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired. Please log in again.' });
    }
    
    return res.status(401).json({ message: 'Authentication failed.' });
  }
};

module.exports = authenticateToken;