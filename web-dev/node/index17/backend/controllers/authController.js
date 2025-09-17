// controllers/authController.js - Updated with Cloudinary integration
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { uploadProfile, uploadBackground, deleteImage, extractPublicId } = require('../config/cloudinary');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '7d'
  });
};

// Helper function to delete old image from Cloudinary
const deleteOldImage = async (imageUrl) => {
  if (imageUrl) {
    try {
      const publicId = extractPublicId(imageUrl);
      if (publicId) {
        await deleteImage(publicId);
        console.log(`Deleted old image: ${publicId}`);
      }
    } catch (error) {
      console.log(`Could not delete old image: ${imageUrl}`, error.message);
    }
  }
};

// Utility function to validate time format
const validateTimeFormat = (time) => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

// Utility function to check time conflicts
const hasTimeConflict = (newSlot, existingSlots, excludeLocationId = null) => {
  const newStart = new Date(`2000-01-01 ${newSlot.startTime}`);
  const newEnd = new Date(`2000-01-01 ${newSlot.endTime}`);
  
  return existingSlots.some(location => {
    if (excludeLocationId && location._id.toString() === excludeLocationId) {
      return false;
    }
    
    return location.availableSlots.some(slot => {
      if (slot.day !== newSlot.day || !slot.isActive) return false;
      
      const existingStart = new Date(`2000-01-01 ${slot.startTime}`);
      const existingEnd = new Date(`2000-01-01 ${slot.endTime}`);
      
      return (newStart < existingEnd && newEnd > existingStart);
    });
  });
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
        success: false,
        message: 'Please provide all required fields'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Doctor-specific validation
    if (userType === 'doctor') {
      if (!specialization || !experience || !licenseNumber) {
        return res.status(400).json({
          success: false,
          message: 'Please provide all required doctor information'
        });
      }

      const existingDoctor = await User.findOne({ 
        licenseNumber: licenseNumber,
        userType: 'doctor'
      });
      if (existingDoctor) {
        return res.status(400).json({
          success: false,
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
      userType,
      contactInfo: {
        phones: [{
          number: phone.trim(),
          type: 'primary',
          isActive: true
        }],
        emails: [{
          email: email.toLowerCase().trim(),
          type: 'primary',
          isActive: true
        }]
      }
    };

    // Add doctor-specific fields
    if (userType === 'doctor') {
      userData.specialization = specialization;
      userData.experience = parseInt(experience);
      userData.licenseNumber = licenseNumber.trim();
      // Initialize with a default practice location
      userData.practiceLocations = [{
        name: 'Primary Practice',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'India'
        },
        consultationFee: 500,
        patientsPerDay: 20,
        availableSlots: [],
        facilities: [],
        isActive: true
      }];
    }

    // Create new user
    const user = new User(userData);
    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    // Return user data and token
    res.status(201).json({
      success: true,
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
        isVerified: user.isVerified,
        contactInfo: user.contactInfo,
        practiceLocations: user.practiceLocations
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Login user
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (!user.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Account has been deactivated. Please contact support.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
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
        licenseNumber: user.licenseNumber,
        isVerified: user.isVerified,
        profileImage: user.profileImage,
        backgroundImage: user.backgroundImage,
        contactInfo: user.contactInfo,
        practiceLocations: user.practiceLocations
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
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
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        specialization: user.specialization,
        experience: user.experience,
        licenseNumber: user.licenseNumber,
        isVerified: user.isVerified,
        profileImage: user.profileImage,
        backgroundImage: user.backgroundImage,
        bio: user.bio,
        address: user.address,
        contactInfo: user.contactInfo,
        practiceLocations: user.practiceLocations,
        consultationFee: user.consultationFee,
        ratings: user.ratings,
        totalAppointments: user.totalAppointments,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Upload profile image
// @access  Private
const uploadProfileImage = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Delete old profile image if exists
    if (user.profileImage) {
      await deleteOldImage(user.profileImage);
    }

    // Update user with new profile image URL from Cloudinary
    user.profileImage = req.file.path;
    await user.save();

    res.json({
      success: true,
      message: 'Profile image uploaded successfully',
      imageUrl: req.file.path,
      type: 'profile'
    });

  } catch (error) {
    console.error('Profile image upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during image upload',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Upload background image
// @access  Private
const uploadBackgroundImage = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.userType !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Only doctors can upload background images'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Delete old background image if exists
    if (user.backgroundImage) {
      await deleteOldImage(user.backgroundImage);
    }

    // Update user with new background image URL from Cloudinary
    user.backgroundImage = req.file.path;
    await user.save();

    res.json({
      success: true,
      message: 'Background image uploaded successfully',
      imageUrl: req.file.path,
      type: 'background'
    });

  } catch (error) {
    console.error('Background image upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during image upload',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Update user profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const {
      name,
      bio,
      address,
      contactInfo,
      practiceLocations,
      consultationFee,
      specialization,
      experience
    } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update basic fields
    if (name) user.name = name.trim();
    if (bio !== undefined) user.bio = bio.trim();

    // Update address for regular users
    if (user.userType === 'user' && address) {
      user.address = address;
    }

    // Update contact info - handle both old and new format
    if (contactInfo) {
      user.contactInfo = contactInfo;
      // Also update the legacy phone field from primary phone
      if (contactInfo.phones && contactInfo.phones.length > 0) {
        const primaryPhone = contactInfo.phones.find(p => p.type === 'primary') || contactInfo.phones[0];
        user.phone = primaryPhone.number;
      }
    }

    // Doctor-specific updates
    if (user.userType === 'doctor') {
      if (consultationFee !== undefined) user.consultationFee = consultationFee;
      if (specialization) user.specialization = specialization;
      if (experience !== undefined) user.experience = experience;
      
      // Update practice locations with basic validation
      if (practiceLocations && Array.isArray(practiceLocations)) {
        user.practiceLocations = practiceLocations;
      }
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        specialization: user.specialization,
        experience: user.experience,
        licenseNumber: user.licenseNumber,
        isVerified: user.isVerified,
        profileImage: user.profileImage,
        backgroundImage: user.backgroundImage,
        bio: user.bio,
        address: user.address,
        contactInfo: user.contactInfo,
        practiceLocations: user.practiceLocations,
        consultationFee: user.consultationFee,
        ratings: user.ratings,
        totalAppointments: user.totalAppointments,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during profile update',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Add practice location for doctors
// @access  Private
const addPracticeLocation = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.userType !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Only doctors can add practice locations'
      });
    }

    const { name, address, consultationFee, patientsPerDay, availableSlots, facilities } = req.body;

    // Validate required fields
    if (!name || !address || !consultationFee || !patientsPerDay) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Validate time slots for conflicts
    for (let slot of availableSlots || []) {
      if (!slot.isActive) continue;
      
      if (!validateTimeFormat(slot.startTime) || !validateTimeFormat(slot.endTime)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid time format. Use HH:MM format.'
        });
      }

      if (hasTimeConflict(slot, user.practiceLocations)) {
        return res.status(400).json({
          success: false,
          message: `Time slot conflict: ${slot.day} ${slot.startTime}-${slot.endTime} is already assigned to another location`
        });
      }
    }

    const newLocation = {
      name: name.trim(),
      address,
      consultationFee,
      patientsPerDay,
      availableSlots: availableSlots || [],
      facilities: facilities || [],
      isActive: true
    };

    user.practiceLocations.push(newLocation);
    await user.save();

    res.json({
      success: true,
      message: 'Practice location added successfully',
      location: user.practiceLocations[user.practiceLocations.length - 1]
    });
  } catch (error) {
    console.error('Add practice location error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Update practice location
// @access  Private
const updatePracticeLocation = async (req, res) => {
  try {
    const { locationId } = req.params;
    const user = await User.findById(req.userId);
    
    if (!user || user.userType !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Only doctors can update practice locations'
      });
    }

    const location = user.practiceLocations.id(locationId);
    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Practice location not found'
      });
    }

    const { availableSlots } = req.body;

    // Validate time conflicts if updating slots
    if (availableSlots) {
      for (let slot of availableSlots) {
        if (!slot.isActive) continue;
        
        if (!validateTimeFormat(slot.startTime) || !validateTimeFormat(slot.endTime)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid time format. Use HH:MM format.'
          });
        }

        const otherLocations = user.practiceLocations.filter(loc => 
          loc._id.toString() !== locationId
        );
        
        if (hasTimeConflict(slot, otherLocations)) {
          return res.status(400).json({
            success: false,
            message: `Time slot conflict: ${slot.day} ${slot.startTime}-${slot.endTime} is already assigned to another location`
          });
        }
      }
    }

    // Update location fields
    Object.assign(location, req.body);
    await user.save();

    res.json({
      success: true,
      message: 'Practice location updated successfully',
      location
    });
  } catch (error) {
    console.error('Update practice location error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Remove practice location
// @access  Private
const removePracticeLocation = async (req, res) => {
  try {
    const { locationId } = req.params;
    const user = await User.findById(req.userId);
    
    if (!user || user.userType !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Only doctors can remove practice locations'
      });
    }

    if (user.practiceLocations.length <= 1) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove the last practice location. Doctors must have at least one location.'
      });
    }

    user.practiceLocations.pull(locationId);
    await user.save();

    res.json({
      success: true,
      message: 'Practice location removed successfully'
    });
  } catch (error) {
    console.error('Remove practice location error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Change user password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: 'New passwords do not match'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password change',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Logout user
// @access  Private
const logoutUser = (req, res) => {
  res.json({
    success: true,
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
  uploadProfileImage,
  uploadBackgroundImage,
  addPracticeLocation,
  updatePracticeLocation,
  removePracticeLocation
};