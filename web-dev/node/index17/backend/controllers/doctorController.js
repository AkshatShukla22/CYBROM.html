// controllers/doctorController.js
const User = require('../models/User');

// @desc    Get all doctors with filters
// @access  Public
const getAllDoctors = async (req, res) => {
  try {
    const {
      specialization,
      city,
      minRating,
      maxFee,
      experience,
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

    if (city) {
      query['address.city'] = { $regex: city, $options: 'i' };
    }

    if (minRating) {
      query['ratings.average'] = { $gte: parseFloat(minRating) };
    }

    if (maxFee) {
      query.consultationFee = { $lte: parseInt(maxFee) };
    }

    if (experience) {
      query.experience = { $gte: parseInt(experience) };
    }

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build sort object
    let sort = {};
    if (sortBy && sortOrder) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
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

    // Get all unique cities for filter options
    const cities = await User.distinct('address.city', { userType: 'doctor', isActive: true });

    // Get all specializations for filter options
    const specializations = await User.distinct('specialization', { userType: 'doctor', isActive: true });

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
          cities: cities.filter(city => city), // Remove null/undefined cities
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

    // Get doctors count by city
    const cityStats = await User.aggregate([
      { $match: { userType: 'doctor', isActive: true, 'address.city': { $exists: true, $ne: null } } },
      { $group: { _id: '$address.city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

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

module.exports = {
  getAllDoctors,
  getDoctorsBySpecialization,
  getDoctorStats
};