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
  addPracticeLocation,
  updatePracticeLocation,
  removePracticeLocation,
  upload
} = require('../controllers/authController');

const router = express.Router();

// Authentication routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', auth, getCurrentUser);
router.put('/profile', auth, updateProfile);
router.post('/change-password', auth, changePassword);
router.post('/logout', auth, logoutUser);

// Image upload routes
router.post('/upload-image', auth, upload.single('image'), uploadImage);
router.post('/upload-image/profile', auth, upload.single('image'), uploadImage);
router.post('/upload-image/background', auth, upload.single('image'), uploadImage);

// Practice location management routes (for doctors)
router.post('/practice-locations', auth, addPracticeLocation);
router.put('/practice-locations/:locationId', auth, updatePracticeLocation);
router.delete('/practice-locations/:locationId', auth, removePracticeLocation);

module.exports = router;