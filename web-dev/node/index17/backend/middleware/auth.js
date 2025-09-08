// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        message: 'No token provided, authorization denied'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      // Check if user still exists
      const user = await User.findById(decoded.userId).select('-password');
      if (!user) {
        return res.status(401).json({
          message: 'Token is not valid - user not found'
        });
      }

      // Check if user account is active
      if (!user.isActive) {
        return res.status(401).json({
          message: 'Account has been deactivated'
        });
      }

      // Add user to request object
      req.userId = decoded.userId;
      req.user = user;
      next();

    } catch (tokenError) {
      return res.status(401).json({
        message: 'Token is not valid'
      });
    }

  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      message: 'Server error in authentication'
    });
  }
};

// Middleware to check if user is a doctor
const requireDoctor = (req, res, next) => {
  if (req.user.userType !== 'doctor') {
    return res.status(403).json({
      message: 'Access denied. Doctor privileges required.'
    });
  }
  next();
};

// Middleware to check if user is a regular user (patient)
const requireUser = (req, res, next) => {
  if (req.user.userType !== 'user') {
    return res.status(403).json({
      message: 'Access denied. Patient privileges required.'
    });
  }
  next();
};

// Middleware to check if user is verified
const requireVerified = (req, res, next) => {
  if (!req.user.isVerified) {
    return res.status(403).json({
      message: 'Account verification required to access this resource.'
    });
  }
  next();
};


auth => {
  auth,
  requireDoctor,
  requireUser,
  requireVerified
};

module.exports = auth;