const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.verifyToken = async (req, res, next) => {
  try {
    const userId = req.session.userId;
    
    const authHeader = req.headers.authorization;
    let token = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!userId && !token) {
      return res.redirect('/auth/login');
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findOne({ _id: decoded.id, 'tokens.token': token });
      
      if (!user) {
        return res.redirect('/auth/login');
      }
      
      req.user = user;
      req.token = token;
    } else {
      const user = await User.findById(userId);
      if (!user) {
        return res.redirect('/auth/login');
      }
      req.user = user;
    }

    next();
  } catch (error) {
    res.redirect('/auth/login');
  }
};

exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).send('Access denied. Admin only.');
  }
};