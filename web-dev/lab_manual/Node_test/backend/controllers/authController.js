const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.getRegister = (req, res) => {
  res.render('register');
};

exports.postRegister = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).send('All fields are required');
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).send('User already exists');
    }

    const user = new User({
      username,
      email,
      password,
      role: role || 'user'
    });

    await user.save();
    const token = await user.generateAuthToken();
    
    req.session.userId = user._id;
    res.redirect('/employees');
  } catch (error) {
    res.status(500).send('Error registering user: ' + error.message);
  }
};

exports.getLogin = (req, res) => {
  res.render('login');
};

exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send('Email and password are required');
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).send('Invalid credentials');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).send('Invalid credentials');
    }

    const token = await user.generateAuthToken();
    
    req.session.userId = user._id;
    res.redirect('/employees');
  } catch (error) {
    res.status(500).send('Error logging in: ' + error.message);
  }
};

exports.logout = async (req, res) => {
  try {
    const token = req.session.token;
    if (token && req.user) {
      // Remove specific token
      req.user.tokens = req.user.tokens.filter(t => t.token !== token);
      await req.user.save();
    }
    req.session.destroy();
    res.redirect('/auth/login');
  } catch (error) {
    res.status(500).send('Error logging out');
  }
};

exports.getProfile = async (req, res) => {
  res.render('profile', { user: req.user });
};

// NEW: API to get current user's tokens
exports.getToken = async (req, res) => {
  try {
    const userId = req.session.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return the most recent token
    const latestToken = user.tokens[user.tokens.length - 1];
    
    res.json({
      success: true,
      token: latestToken ? latestToken.token : null,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving token: ' + error.message });
  }
};

// NEW: API to generate a new token for authenticated user
exports.refreshToken = async (req, res) => {
  try {
    const userId = req.session.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const token = await user.generateAuthToken();
    
    res.json({
      success: true,
      token: token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error generating token: ' + error.message });
  }
};