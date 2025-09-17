// routes/authRoutes.js - Updated with Cloudinary integration
const express = require('express');
const auth = require('../middleware/auth');
const { uploadProfile, uploadBackground } = require('../config/cloudinary');
const {
  registerUser,
  loginUser,
  getCurrentUser,
  updateProfile,
  changePassword,
  logoutUser,
  uploadProfileImage,
  uploadBackgroundImage,
  addPracticeLocation,
  updatePracticeLocation,
  removePracticeLocation
} = require('../controllers/authController');

const router = express.Router();

// Authentication routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', auth, getCurrentUser);
router.put('/profile', auth, updateProfile);
router.post('/change-password', auth, changePassword);
router.post('/logout', auth, logoutUser);

// Image upload routes with Cloudinary
router.post('/upload-image/profile', auth, uploadProfile.single('image'), uploadProfileImage);
router.post('/upload-image/background', auth, uploadBackground.single('image'), uploadBackgroundImage);

// Backward compatibility - generic upload route that defaults to profile
router.post('/upload-image', auth, uploadProfile.single('image'), uploadProfileImage);

// Practice location management routes (for doctors)
router.post('/practice-locations', auth, addPracticeLocation);
router.put('/practice-locations/:locationId', auth, updatePracticeLocation);
router.delete('/practice-locations/:locationId', auth, removePracticeLocation);

module.exports = router;