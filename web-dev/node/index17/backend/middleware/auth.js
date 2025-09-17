// middleware/auth.js - Authentication middleware
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Main authentication middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided, authorization denied'
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      const user = await User.findById(decoded.userId).select('-password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Token is not valid - user not found'
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account has been deactivated'
        });
      }

      req.userId = decoded.userId;
      req.user = user;
      next();

    } catch (tokenError) {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid'
      });
    }

  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

// Middleware to check if user is a doctor
const requireDoctor = (req, res, next) => {
  if (req.user.userType !== 'doctor') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Doctor privileges required.'
    });
  }
  next();
};

// Middleware to check if user is a regular user (patient)
const requireUser = (req, res, next) => {
  if (req.user.userType !== 'user') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Patient privileges required.'
    });
  }
  next();
};

// Middleware to check if user is verified
const requireVerified = (req, res, next) => {
  if (!req.user.isVerified) {
    return res.status(403).json({
      success: false,
      message: 'Account verification required to access this resource.'
    });
  }
  next();
};

module.exports = {
  auth,
  requireDoctor,
  requireUser,
  requireVerified
};

// Export auth as default for backward compatibility
module.exports = auth;
module.exports.requireDoctor = requireDoctor;
module.exports.requireUser = requireUser;
module.exports.requireVerified = requireVerified;