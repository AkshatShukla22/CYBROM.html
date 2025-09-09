// routes/authRoutes.js
const express = require('express');
const auth = require('../middleware/auth');
const {
  registerUser,
  loginUser,
  getCurrentUser,
  updateProfile,
  changePassword,
  logoutUser,
  uploadImage,
  upload,
  createUploadMiddleware
} = require('../controllers/authController');

const router = express.Router();

// Create specific upload middleware for each type
const profileUpload = createUploadMiddleware('profile');
const backgroundUpload = createUploadMiddleware('background');

// Authentication routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', auth, getCurrentUser);
router.put('/profile', auth, updateProfile);
router.post('/change-password', auth, changePassword);
router.post('/logout', auth, logoutUser);

// Image upload routes - using specific middleware for each type
router.post('/upload-image/profile', auth, profileUpload.single('image'), (req, res, next) => {
  req.body.type = 'profile';
  next();
}, uploadImage);

router.post('/upload-image/background', auth, backgroundUpload.single('image'), (req, res, next) => {
  req.body.type = 'background';
  next();
}, uploadImage);

// Fallback route for backwards compatibility - this handles the general upload-image route
router.post('/upload-image', auth, upload.single('image'), uploadImage);

module.exports = router;