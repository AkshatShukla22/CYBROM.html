// controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const User = require('../models/User');

// Create uploads directory if it doesn't exist
const createUploadsDir = async () => {
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  const profileDir = path.join(uploadsDir, 'profiles');
  const backgroundDir = path.join(uploadsDir, 'backgrounds');
  const tempDir = path.join(uploadsDir, 'temp');
  
  try {
    await fs.access(uploadsDir);
  } catch {
    await fs.mkdir(uploadsDir, { recursive: true });
  }
  
  try {
    await fs.access(profileDir);
  } catch {
    await fs.mkdir(profileDir, { recursive: true });
  }
  
  try {
    await fs.access(backgroundDir);
  } catch {
    await fs.mkdir(backgroundDir, { recursive: true });
  }
  
  try {
    await fs.access(tempDir);
  } catch {
    await fs.mkdir(tempDir, { recursive: true });
  }
};

// Initialize directories
createUploadsDir();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Determine type from route path first, then body
    let isBackgroundUpload = false;
    
    if (req.route.path.includes('/background')) {
      isBackgroundUpload = true;
    } else if (req.route.path.includes('/profile')) {
      isBackgroundUpload = false;
    } else if (req.body.type === 'background') {
      isBackgroundUpload = true;
    }
    
    const uploadPath = isBackgroundUpload ? 
      path.join(__dirname, '..', 'uploads', 'backgrounds') : 
      path.join(__dirname, '..', 'uploads', 'profiles');
    
    console.log('Upload destination:', uploadPath, 'Type detected:', isBackgroundUpload ? 'background' : 'profile', 'Route:', req.route.path);
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    let type = 'profile';
    
    if (req.route.path.includes('/background')) {
      type = 'background';
    } else if (req.route.path.includes('/profile')) {
      type = 'profile';
    } else if (req.body.type === 'background') {
      type = 'background';
    }
    
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = path.extname(file.originalname);
    const filename = `${type}_${req.userId}_${timestamp}_${randomString}${extension}`;
    
    console.log('Generated filename:', filename, 'Type detected:', type);
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  // Check if file is an image
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

// Create separate multer instances for different types
const createUploadMiddleware = (type) => {
  const typeStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadPath = type === 'background' ? 
        path.join(__dirname, '..', 'uploads', 'backgrounds') : 
        path.join(__dirname, '..', 'uploads', 'profiles');
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const extension = path.extname(file.originalname);
      const filename = `${type}_${req.userId}_${timestamp}_${randomString}${extension}`;
      cb(null, filename);
    }
  });

  return multer({
    storage: typeStorage,
    fileFilter: fileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB limit
    }
  });
};

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '7d'
  });
};

// Helper function to delete old image file
const deleteOldImage = async (imagePath) => {
  if (imagePath) {
    try {
      const fullPath = path.join(__dirname, '..', imagePath.replace('/uploads', 'uploads'));
      await fs.access(fullPath);
      await fs.unlink(fullPath);
      console.log(`Deleted old image: ${fullPath}`);
    } catch (error) {
      console.log(`Could not delete old image: ${imagePath}`);
    }
  }
};

// @desc    Register a new user
// @access  Public
const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      confirmPassword,
      phone,
      userType,
      specialization,
      experience,
      licenseNumber
    } = req.body;

    // Validation
    if (!name || !email || !password || !phone || !userType) {
      return res.status(400).json({
        message: 'Please provide all required fields'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: 'Passwords do not match'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        message: 'User with this email already exists'
      });
    }

    // Doctor-specific validation
    if (userType === 'doctor') {
      if (!specialization || !experience || !licenseNumber) {
        return res.status(400).json({
          message: 'Please provide all required doctor information'
        });
      }

      // Check if license number already exists
      const existingDoctor = await User.findOne({ 
        licenseNumber: licenseNumber,
        userType: 'doctor'
      });
      if (existingDoctor) {
        return res.status(400).json({
          message: 'Doctor with this license number already exists'
        });
      }
    }

    // Create user data object
    const userData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone.trim(),
      userType
    };

    // Add doctor-specific fields
    if (userType === 'doctor') {
      userData.specialization = specialization;
      userData.experience = parseInt(experience);
      userData.licenseNumber = licenseNumber.trim();
      userData.consultationFee = 500; // Default fee, can be updated later
    }

    // Create new user
    const user = new User(userData);
    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    // Return user data and token
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        specialization: user.specialization,
        experience: user.experience,
        licenseNumber: user.licenseNumber,
        isVerified: user.isVerified
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      message: 'Server error during registration',
      error: error.message
    });
  }
};

// @desc    Login user
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        message: 'Please provide email and password'
      });
    }

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({
        message: 'Invalid email or password'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(400).json({
        message: 'Account has been deactivated. Please contact support.'
      });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Return user data and token
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        specialization: user.specialization,
        experience: user.experience,
        isVerified: user.isVerified,
        profileImage: user.profileImage,
        backgroundImage: user.backgroundImage
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Server error during login',
      error: error.message
    });
  }
};

// @desc    Get current user
// @access  Private
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        specialization: user.specialization,
        experience: user.experience,
        isVerified: user.isVerified,
        profileImage: user.profileImage,
        backgroundImage: user.backgroundImage,
        bio: user.bio,
        address: user.address,
        consultationFee: user.consultationFee,
        availableSlots: user.availableSlots,
        ratings: user.ratings,
        totalAppointments: user.totalAppointments,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Upload user image
// @access  Private
const uploadImage = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: 'No image file provided'
      });
    }

    // Determine image type from the route path
    let imageType = 'profile'; // default
    
    if (req.route.path.includes('/profile')) {
      imageType = 'profile';
    } else if (req.route.path.includes('/background')) {
      imageType = 'background';
    } else if (req.body.type) {
      // Fallback to body type if route doesn't specify
      imageType = req.body.type;
    }
    
    // Construct the correct image URL based on the actual file location
    const imageUrl = `/uploads/${imageType === 'background' ? 'backgrounds' : 'profiles'}/${req.file.filename}`;

    console.log('Image uploaded:', {
      type: imageType,
      filename: req.file.filename,
      path: req.file.path,
      url: imageUrl,
      route: req.route.path
    });

    // Delete old image if exists
    if (imageType === 'profile' && user.profileImage) {
      await deleteOldImage(user.profileImage);
    } else if (imageType === 'background' && user.backgroundImage) {
      await deleteOldImage(user.backgroundImage);
    }

    res.json({
      message: 'Image uploaded successfully',
      imageUrl: imageUrl,
      type: imageType
    });

  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({
      message: 'Server error during image upload',
      error: error.message
    });
  }
};

// @desc    Update user profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const {
      name,
      phone,
      bio,
      address,
      consultationFee,
      specialization,
      experience,
      profileImage,
      backgroundImage
    } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Update fields if provided
    if (name) user.name = name.trim();
    if (phone) user.phone = phone.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (address) user.address = address;

    // Update profile image if provided
    if (profileImage && profileImage !== user.profileImage) {
      // Delete old profile image
      if (user.profileImage) {
        await deleteOldImage(user.profileImage);
      }
      user.profileImage = profileImage;
    }

    // Update background image if provided (only for doctors)
    if (user.userType === 'doctor' && backgroundImage && backgroundImage !== user.backgroundImage) {
      // Delete old background image
      if (user.backgroundImage) {
        await deleteOldImage(user.backgroundImage);
      }
      user.backgroundImage = backgroundImage;
    }

    // Doctor-specific updates
    if (user.userType === 'doctor') {
      if (consultationFee) user.consultationFee = consultationFee;
      if (specialization) user.specialization = specialization;
      if (experience !== undefined) user.experience = experience;
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        specialization: user.specialization,
        experience: user.experience,
        isVerified: user.isVerified,
        profileImage: user.profileImage,
        backgroundImage: user.backgroundImage,
        bio: user.bio,
        address: user.address,
        consultationFee: user.consultationFee,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      message: 'Server error during profile update',
      error: error.message
    });
  }
};

// @desc    Change user password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({
        message: 'Please provide all required fields'
      });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        message: 'New passwords do not match'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: 'New password must be at least 6 characters long'
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({
      message: 'Server error during password change',
      error: error.message
    });
  }
};

// @desc    Logout user (client-side token removal)
// @access  Private
const logoutUser = (req, res) => {
  // In a JWT implementation, logout is typically handled client-side
  // by removing the token from localStorage/sessionStorage
  res.json({
    message: 'Logged out successfully'
  });
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  updateProfile,
  changePassword,
  logoutUser,
  uploadImage,
  upload,
  createUploadMiddleware
};