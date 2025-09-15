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

    // FIXED: Handle city filtering - improved logic for multiple practice locations
    if (city || (showLocalOnly === 'true' && userCity)) {
      const searchCity = city || userCity;
      const cityRegex = new RegExp(searchCity, 'i');
      
      // Create comprehensive city search across both old and new structures
      query.$or = [
        // Check old address structure (case-insensitive)
        { 'address.city': { $regex: cityRegex } },
        // Check new practiceLocations structure (case-insensitive)
        { 
          'practiceLocations': {
            $elemMatch: {
              'isActive': { $ne: false },
              'address.city': { $regex: cityRegex }
            }
          }
        }
      ];
    }

    // FIXED: Handle fee filtering - improved logic for multiple practice locations
    let feeQuery = [];
    if (minFee || maxFee) {
      const feeFilter = {};
      if (minFee) feeFilter.$gte = parseInt(minFee);
      if (maxFee) feeFilter.$lte = parseInt(maxFee);
      
      // Check both old consultationFee and new practiceLocations fees
      feeQuery = [
        { consultationFee: feeFilter },
        { 
          'practiceLocations': {
            $elemMatch: {
              'isActive': { $ne: false },
              'consultationFee': feeFilter
            }
          }
        }
      ];
      
      if (query.$or) {
        // Combine city and fee queries using $and
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
        sort = { 
          'practiceLocations.consultationFee': sortOrder === 'desc' ? -1 : 1, 
          consultationFee: sortOrder === 'desc' ? -1 : 1 
        };
      } else {
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
      }
    }

    console.log('Doctor search query:', JSON.stringify(query, null, 2));

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

    // FIXED: Get all unique cities from both old and new structures using aggregation
    const citiesAggregation = await User.aggregate([
      { $match: { userType: 'doctor', isActive: true } },
      {
        $project: {
          cities: {
            $setUnion: [
              // Get cities from legacy address field
              {
                $cond: {
                  if: { $and: [{ $ne: ['$address.city', null] }, { $ne: ['$address.city', ''] }] },
                  then: ['$address.city'],
                  else: []
                }
              },
              // Get cities from practice locations
              {
                $map: {
                  input: {
                    $filter: {
                      input: '$practiceLocations',
                      cond: {
                        $and: [
                          { $ne: ['$$this.isActive', false] },
                          { $ne: ['$$this.address.city', null] },
                          { $ne: ['$$this.address.city', ''] }
                        ]
                      }
                    }
                  },
                  as: 'location',
                  in: '$$location.address.city'
                }
              }
            ]
          }
        }
      },
      { $unwind: '$cities' },
      { $group: { _id: '$cities' } },
      { $sort: { _id: 1 } }
    ]);

    const allCities = citiesAggregation.map(item => item._id).filter(city => city);

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

    // Create a case-insensitive regex pattern
    const searchRegex = new RegExp(q, 'i');

    // Search in legacy address.city field
    const oldCities = await User.distinct('address.city', {
      userType: 'doctor',
      isActive: true,
      'address.city': { 
        $regex: searchRegex, 
        $exists: true, 
        $ne: null, 
        $ne: '' 
      }
    });

    // Search in practice locations using aggregation
    const newCitiesAgg = await User.aggregate([
      { 
        $match: { 
          userType: 'doctor', 
          isActive: true,
          practiceLocations: { $exists: true, $ne: [] }
        } 
      },
      { $unwind: '$practiceLocations' },
      { 
        $match: { 
          'practiceLocations.isActive': { $ne: false },
          'practiceLocations.address.city': { 
            $regex: searchRegex,
            $exists: true, 
            $ne: null, 
            $ne: '' 
          } 
        } 
      },
      { 
        $group: { 
          _id: '$practiceLocations.address.city' 
        } 
      },
      {
        $project: {
          _id: 0,
          city: '$_id'
        }
      }
    ]);

    // Extract cities from aggregation result
    const newCities = newCitiesAgg.map(item => item.city);

    // Combine both sources and remove duplicates
    const allCities = [...new Set([
      ...oldCities.filter(city => city && city.trim() !== ''),
      ...newCities.filter(city => city && city.trim() !== '')
    ])];

    // Sort cities alphabetically and prioritize exact matches
    const sortedCities = allCities
      .sort((a, b) => {
        const aLower = a.toLowerCase();
        const bLower = b.toLowerCase();
        const qLower = q.toLowerCase();
        
        // Exact match first
        if (aLower === qLower && bLower !== qLower) return -1;
        if (bLower === qLower && aLower !== qLower) return 1;
        
        // Starts with query second
        if (aLower.startsWith(qLower) && !bLower.startsWith(qLower)) return -1;
        if (bLower.startsWith(qLower) && !aLower.startsWith(qLower)) return 1;
        
        // Alphabetical order for the rest
        return aLower.localeCompare(bLower);
      })
      .slice(0, 10); // Limit to 10 results

    console.log(`City search for "${q}": found ${sortedCities.length} cities`);

    res.json({
      success: true,
      data: { cities: sortedCities }
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