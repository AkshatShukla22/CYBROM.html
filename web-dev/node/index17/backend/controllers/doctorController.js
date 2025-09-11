// controllers/doctorController.js
const User = require('../models/User');
const Rating = require('../models/Rating');

// Helper function to update doctor ratings
const updateDoctorRatings = async (doctorId) => {
  try {
    const ratings = await Rating.find({ doctorId, isActive: true });
    
    if (ratings.length > 0) {
      const totalRating = ratings.reduce((sum, rating) => sum + rating.rating, 0);
      const averageRating = totalRating / ratings.length;
      
      await User.findByIdAndUpdate(doctorId, {
        'ratings.average': Math.round(averageRating * 10) / 10, // Round to 1 decimal
        'ratings.count': ratings.length
      });
    } else {
      await User.findByIdAndUpdate(doctorId, {
        'ratings.average': 0,
        'ratings.count': 0
      });
    }
  } catch (error) {
    console.error('Error updating doctor ratings:', error);
  }
};

// @desc    Get all doctors with filters
// @access  Public
const getAllDoctors = async (req, res) => {
  try {
    const {
      specialization,
      city,
      minRating,
      maxFee,
      minFee,
      experience,
      showLocalOnly,
      userCity,
      page = 1,
      limit = 10,
      sortBy = 'ratings.average',
      sortOrder = 'desc'
    } = req.query;

    // Build query object
    let query = { userType: 'doctor', isActive: true };

    // Add filters
    if (specialization) {
      query.specialization = specialization;
    }

    if (minRating) {
      query['ratings.average'] = { $gte: parseFloat(minRating) };
    }

    if (experience) {
      query.experience = { $gte: parseInt(experience) };
    }

    // Handle city filtering - check both old address.city and new practiceLocations
    if (city || (showLocalOnly === 'true' && userCity)) {
      const searchCity = city || userCity;
      query.$or = [
        // Check old address structure
        { 'address.city': { $regex: searchCity, $options: 'i' } },
        // Check new practiceLocations structure
        { 'practiceLocations.address.city': { $regex: searchCity, $options: 'i' } }
      ];
    }

    // Handle fee filtering - check both old consultationFee and new practiceLocations fees
    let feeQuery = [];
    if (minFee || maxFee) {
      const feeFilter = {};
      if (minFee) feeFilter.$gte = parseInt(minFee);
      if (maxFee) feeFilter.$lte = parseInt(maxFee);
      
      // Check both old and new fee structures
      feeQuery = [
        { consultationFee: feeFilter },
        { 'practiceLocations.consultationFee': feeFilter }
      ];
      
      if (query.$or) {
        // Combine city and fee queries
        query.$and = [
          { $or: query.$or },
          { $or: feeQuery }
        ];
        delete query.$or;
      } else {
        query.$or = feeQuery;
      }
    }

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build sort object
    let sort = {};
    if (sortBy && sortOrder) {
      // Handle sorting by consultation fee (prioritize practiceLocations over legacy field)
      if (sortBy === 'consultationFee') {
        sort = { 'practiceLocations.consultationFee': sortOrder === 'desc' ? -1 : 1, consultationFee: sortOrder === 'desc' ? -1 : 1 };
      } else {
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
      }
    }

    // Execute query with pagination
    const doctors = await User.find(query)
      .select('-password')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get total count for pagination
    const totalDoctors = await User.countDocuments(query);
    const totalPages = Math.ceil(totalDoctors / limitNum);

    // Get all unique cities from both old and new structures
    const oldCities = await User.distinct('address.city', { 
      userType: 'doctor', 
      isActive: true,
      'address.city': { $exists: true, $ne: null, $ne: '' }
    });
    
    const newCities = await User.aggregate([
      { $match: { userType: 'doctor', isActive: true } },
      { $unwind: '$practiceLocations' },
      { $match: { 'practiceLocations.address.city': { $exists: true, $ne: null, $ne: '' } } },
      { $group: { _id: '$practiceLocations.address.city' } }
    ]);

    const allCities = [...new Set([
      ...oldCities.filter(city => city),
      ...newCities.map(item => item._id).filter(city => city)
    ])].sort();

    // Get all specializations for filter options
    const specializations = await User.distinct('specialization', { 
      userType: 'doctor', 
      isActive: true,
      specialization: { $exists: true, $ne: null }
    });

    res.json({
      success: true,
      data: {
        doctors,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalDoctors,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        },
        filters: {
          cities: allCities,
          specializations: specializations.filter(spec => spec)
        }
      }
    });

  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching doctors',
      error: error.message
    });
  }
};

// @desc    Get single doctor by ID
// @access  Public
const getDoctorById = async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    // Validate ObjectId format
    if (!doctorId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid doctor ID format'
      });
    }
    
    const doctor = await User.findOne({ 
      _id: doctorId, 
      userType: 'doctor', 
      isActive: true 
    }).select('-password').lean();
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }
    
    res.json({
      success: true,
      doctor
    });
    
  } catch (error) {
    console.error('Get single doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching doctor',
      error: error.message
    });
  }
};

// @desc    Get doctor ratings
// @access  Public
const getDoctorRatings = async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    // Validate ObjectId format
    if (!doctorId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid doctor ID format'
      });
    }
    
    // Fetch actual ratings from the Rating model
    const ratings = await Rating.find({ 
      doctorId, 
      isActive: true 
    })
    .sort({ createdAt: -1 })
    .lean();
    
    console.log(`Found ${ratings.length} ratings for doctor ${doctorId}`);
    
    res.json({
      success: true,
      ratings
    });
    
  } catch (error) {
    console.error('Get doctor ratings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching ratings',
      error: error.message
    });
  }
};

// @desc    Submit doctor rating
// @access  Private (requires authentication)
const submitDoctorRating = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { rating, feedback } = req.body;
    const userId = req.userId; // From auth middleware
    
    console.log('Submit rating request:', { doctorId, userId, rating, feedback });
    
    // Validate ObjectId format
    if (!doctorId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid doctor ID format'
      });
    }
    
    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }
    
    // Check if doctor exists
    const doctor = await User.findOne({ 
      _id: doctorId, 
      userType: 'doctor', 
      isActive: true 
    });
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }
    
    // Get current user details
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Prevent doctors from rating themselves
    if (doctorId === userId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot rate yourself'
      });
    }
    
    try {
      // Check if user has already rated this doctor
      const existingRating = await Rating.findOne({ 
        doctorId, 
        userId, 
        isActive: true 
      });
      
      if (existingRating) {
        // Update existing rating
        existingRating.rating = rating;
        existingRating.feedback = feedback ? feedback.trim() : '';
        existingRating.userName = currentUser.name; // Update user name in case it changed
        existingRating.profileImage = currentUser.profileImage; // Update profile image
        await existingRating.save();
        
        console.log('Updated existing rating');
      } else {
        // Create new rating
        const newRating = new Rating({
          doctorId,
          userId,
          userName: currentUser.name,
          userEmail: currentUser.email,
          profileImage: currentUser.profileImage, // Include profile image
          rating,
          feedback: feedback ? feedback.trim() : ''
        });
        
        await newRating.save();
        console.log('Created new rating');
      }
      
      // Update doctor's overall rating
      await updateDoctorRatings(doctorId);
      
      res.json({
        success: true,
        message: existingRating ? 'Rating updated successfully' : 'Rating submitted successfully'
      });
      
    } catch (error) {
      if (error.code === 11000) {
        // Duplicate key error - this shouldn't happen with our check above, but just in case
        return res.status(400).json({
          success: false,
          message: 'You have already rated this doctor'
        });
      }
      throw error;
    }
    
  } catch (error) {
    console.error('Submit rating error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting rating',
      error: error.message
    });
  }
};

// @desc    Get doctors by specialization
// @access  Public
const getDoctorsBySpecialization = async (req, res) => {
  try {
    const { specialization } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const doctors = await User.find({
      userType: 'doctor',
      isActive: true,
      specialization: specialization
    })
      .select('-password')
      .sort({ 'ratings.average': -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const totalDoctors = await User.countDocuments({
      userType: 'doctor',
      isActive: true,
      specialization: specialization
    });

    const totalPages = Math.ceil(totalDoctors / limitNum);

    res.json({
      success: true,
      data: {
        doctors,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalDoctors,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }
    });

  } catch (error) {
    console.error('Get doctors by specialization error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching doctors',
      error: error.message
    });
  }
};

// @desc    Get doctor statistics
// @access  Public
const getDoctorStats = async (req, res) => {
  try {
    // Get total doctors count
    const totalDoctors = await User.countDocuments({ userType: 'doctor', isActive: true });

    // Get doctors count by specialization
    const specializationStats = await User.aggregate([
      { $match: { userType: 'doctor', isActive: true } },
      { $group: { _id: '$specialization', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get doctors count by city (including practice locations)
    const oldCityStats = await User.aggregate([
      { $match: { userType: 'doctor', isActive: true, 'address.city': { $exists: true, $ne: null } } },
      { $group: { _id: '$address.city', count: { $sum: 1 } } }
    ]);

    const newCityStats = await User.aggregate([
      { $match: { userType: 'doctor', isActive: true } },
      { $unwind: '$practiceLocations' },
      { $match: { 'practiceLocations.address.city': { $exists: true, $ne: null } } },
      { $group: { _id: '$practiceLocations.address.city', count: { $sum: 1 } } }
    ]);

    // Combine and deduplicate city stats
    const cityStatsMap = new Map();
    [...oldCityStats, ...newCityStats].forEach(stat => {
      if (stat._id) {
        cityStatsMap.set(stat._id, (cityStatsMap.get(stat._id) || 0) + stat.count);
      }
    });

    const cityStats = Array.from(cityStatsMap.entries())
      .map(([city, count]) => ({ _id: city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Get average ratings
    const avgRating = await User.aggregate([
      { $match: { userType: 'doctor', isActive: true } },
      { $group: { _id: null, avgRating: { $avg: '$ratings.average' } } }
    ]);

    res.json({
      success: true,
      data: {
        totalDoctors,
        specializationStats,
        cityStats,
        averageRating: avgRating[0]?.avgRating || 0
      }
    });

  } catch (error) {
    console.error('Get doctor stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statistics',
      error: error.message
    });
  }
};

// @desc    Search cities
// @access  Public
const searchCities = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({
        success: true,
        data: { cities: [] }
      });
    }

    // Search in both old and new city structures
    const oldCities = await User.distinct('address.city', {
      userType: 'doctor',
      isActive: true,
      'address.city': { $regex: q, $options: 'i', $exists: true, $ne: null }
    });

    const newCities = await User.aggregate([
      { $match: { userType: 'doctor', isActive: true } },
      { $unwind: '$practiceLocations' },
      { 
        $match: { 
          'practiceLocations.address.city': { 
            $regex: q, 
            $options: 'i', 
            $exists: true, 
            $ne: null 
          } 
        } 
      },
      { $group: { _id: '$practiceLocations.address.city' } }
    ]);

    const allCities = [...new Set([
      ...oldCities.filter(city => city),
      ...newCities.map(item => item._id).filter(city => city)
    ])].sort();

    res.json({
      success: true,
      data: { cities: allCities.slice(0, 10) } // Limit to 10 results
    });

  } catch (error) {
    console.error('Search cities error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching cities',
      error: error.message
    });
  }
};

// @desc    Delete doctor rating (for users to delete their own ratings)
// @access  Private
const deleteDoctorRating = async (req, res) => {
  try {
    const { doctorId, ratingId } = req.params;
    const userId = req.userId; // From auth middleware
    
    const rating = await Rating.findOne({
      _id: ratingId,
      doctorId: doctorId,
      userId: userId,
      isActive: true
    });
    
    if (!rating) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found or you do not have permission to delete it'
      });
    }
    
    // Soft delete - mark as inactive
    rating.isActive = false;
    await rating.save();
    
    // Update doctor's ratings
    await updateDoctorRatings(doctorId);
    
    res.json({
      success: true,
      message: 'Rating deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete rating error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting rating',
      error: error.message
    });
  }
};

module.exports = {
  getAllDoctors,
  getDoctorById,
  getDoctorRatings,
  submitDoctorRating,
  deleteDoctorRating,
  getDoctorsBySpecialization,
  getDoctorStats,
  searchCities
};