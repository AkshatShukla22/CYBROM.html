// controllers/doctorController.js - FIXED city filtering logic
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
      sortOrder = 'desc',
      search // ADD THIS LINE
    } = req.query;

    console.log('Filter parameters received:', { 
      specialization, city, minRating, maxFee, minFee, experience, showLocalOnly, userCity, search // ADD search HERE
    });

    // Build query object
    let query = { userType: 'doctor', isActive: true };

    // ADD THIS SEARCH FUNCTIONALITY BLOCK AFTER THE QUERY INITIALIZATION:
    // Add search functionality
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      console.log('Applying search filter:', search);
      
      const searchConditions = [
        { name: searchRegex },
        { specialization: searchRegex },
        { bio: searchRegex },
        { email: searchRegex },
        { 'address.city': searchRegex },
        { 'address.state': searchRegex },
        { 
          'practiceLocations': {
            $elemMatch: {
              'isActive': { $ne: false },
              $or: [
                { 'address.city': searchRegex },
                { 'address.state': searchRegex }
              ]
            }
          }
        }
      ];

      // If query already has conditions, combine them
      if (query.$and) {
        query.$and.push({ $or: searchConditions });
      } else if (query.$or) {
        query.$and = [
          { $or: query.$or },
          { $or: searchConditions }
        ];
        delete query.$or;
      } else {
        query.$or = searchConditions;
      }
    }

    if (minRating) {
      query['ratings.average'] = { $gte: parseFloat(minRating) };
    }

    if (experience) {
      query.experience = { $gte: parseInt(experience) };
    }

    // FIXED: Improved city filtering logic for both single city search and local-only filter
    let cityQueryConditions = [];
    
    if (city) {
      // Direct city search - user typed a specific city
      const cityRegex = new RegExp(city.trim(), 'i');
      console.log('Searching for specific city:', city);
      
      cityQueryConditions = [
        // Check old address structure
        { 'address.city': { $regex: cityRegex } },
        // Check new practiceLocations structure
        { 
          'practiceLocations': {
            $elemMatch: {
              'isActive': { $ne: false },
              'address.city': { $regex: cityRegex }
            }
          }
        }
      ];
    } else if (showLocalOnly === 'true' && userCity) {
      // Show local only - filter by user's city from their profile
      const userCityRegex = new RegExp(userCity.trim(), 'i');
      console.log('Filtering for local doctors in user city:', userCity);
      
      cityQueryConditions = [
        // Check old address structure
        { 'address.city': { $regex: userCityRegex } },
        // Check new practiceLocations structure
        { 
          'practiceLocations': {
            $elemMatch: {
              'isActive': { $ne: false },
              'address.city': { $regex: userCityRegex }
            }
          }
        }
      ];
    }

    // Apply city conditions if any exist
    if (cityQueryConditions.length > 0) {
      if (query.$or) {
        // If we already have $or conditions, combine them with $and
        query.$and = [
          { $or: query.$or },
          { $or: cityQueryConditions }
        ];
        delete query.$or;
      } else {
        query.$or = cityQueryConditions;
      }
    }

    // FIXED: Handle fee filtering - improved logic for multiple practice locations
    let feeQueryConditions = [];
    if (minFee || maxFee) {
      const feeFilter = {};
      if (minFee) feeFilter.$gte = parseInt(minFee);
      if (maxFee) feeFilter.$lte = parseInt(maxFee);
      
      console.log('Applying fee filter:', feeFilter);
      
      // Check both old consultationFee and new practiceLocations fees
      feeQueryConditions = [
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
      
      // Combine with existing query conditions
      if (query.$and) {
        // Already have $and conditions, add fee filter
        query.$and.push({ $or: feeQueryConditions });
      } else if (query.$or) {
        // Have $or conditions, convert to $and
        query.$and = [
          { $or: query.$or },
          { $or: feeQueryConditions }
        ];
        delete query.$or;
      } else {
        query.$or = feeQueryConditions;
      }
    }

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build sort object
    let sort = {};
    if (sortBy && sortOrder) {
      if (sortBy === 'consultationFee') {
        sort = { 
          'practiceLocations.consultationFee': sortOrder === 'desc' ? -1 : 1, 
          consultationFee: sortOrder === 'desc' ? -1 : 1 
        };
      } else {
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
      }
    }

    console.log('Final MongoDB query:', JSON.stringify(query, null, 2));

    // Execute query with pagination
    const doctors = await User.find(query)
      .select('-password')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();

    console.log(`Found ${doctors.length} doctors matching criteria`);

    // Get total count for pagination
    const totalDoctors = await User.countDocuments(query);
    const totalPages = Math.ceil(totalDoctors / limitNum);

    // Get all unique cities from both old and new structures using aggregation
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

// Keep all other existing functions unchanged...
const getDoctorById = async (req, res) => {
  try {
    const { doctorId } = req.params;
    
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

const getDoctorRatings = async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    if (!doctorId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid doctor ID format'
      });
    }
    
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

const submitDoctorRating = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { rating, feedback } = req.body;
    const userId = req.userId;
    
    console.log('Submit rating request:', { doctorId, userId, rating, feedback });
    
    if (!doctorId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid doctor ID format'
      });
    }
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }
    
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
    
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (doctorId === userId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot rate yourself'
      });
    }
    
    try {
      const existingRating = await Rating.findOne({ 
        doctorId, 
        userId, 
        isActive: true 
      });
      
      if (existingRating) {
        existingRating.rating = rating;
        existingRating.feedback = feedback ? feedback.trim() : '';
        existingRating.userName = currentUser.name;
        existingRating.profileImage = currentUser.profileImage;
        await existingRating.save();
        
        console.log('Updated existing rating');
      } else {
        const newRating = new Rating({
          doctorId,
          userId,
          userName: currentUser.name,
          userEmail: currentUser.email,
          profileImage: currentUser.profileImage,
          rating,
          feedback: feedback ? feedback.trim() : ''
        });
        
        await newRating.save();
        console.log('Created new rating');
      }
      
      await updateDoctorRatings(doctorId);
      
      res.json({
        success: true,
        message: existingRating ? 'Rating updated successfully' : 'Rating submitted successfully'
      });
      
    } catch (error) {
      if (error.code === 11000) {
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

const getDoctorStats = async (req, res) => {
  try {
    const totalDoctors = await User.countDocuments({ userType: 'doctor', isActive: true });

    const specializationStats = await User.aggregate([
      { $match: { userType: 'doctor', isActive: true } },
      { $group: { _id: '$specialization', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

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

const searchCities = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({
        success: true,
        data: { cities: [] }
      });
    }

    const searchRegex = new RegExp(q, 'i');

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

    const newCities = newCitiesAgg.map(item => item.city);

    const allCities = [...new Set([
      ...oldCities.filter(city => city && city.trim() !== ''),
      ...newCities.filter(city => city && city.trim() !== '')
    ])];

    const sortedCities = allCities
      .sort((a, b) => {
        const aLower = a.toLowerCase();
        const bLower = b.toLowerCase();
        const qLower = q.toLowerCase();
        
        if (aLower === qLower && bLower !== qLower) return -1;
        if (bLower === qLower && aLower !== qLower) return 1;
        
        if (aLower.startsWith(qLower) && !bLower.startsWith(qLower)) return -1;
        if (bLower.startsWith(qLower) && !aLower.startsWith(qLower)) return 1;
        
        return aLower.localeCompare(bLower);
      })
      .slice(0, 10);

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

const deleteDoctorRating = async (req, res) => {
  try {
    const { doctorId, ratingId } = req.params;
    const userId = req.userId;
    
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
    
    rating.isActive = false;
    await rating.save();
    
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

const searchDoctors = async (req, res) => {
  try {
    const { q, limit = 8 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }

    const searchQuery = q.trim();
    const searchLimit = Math.min(parseInt(limit), 20); // Max 20 results
    const searchRegex = new RegExp(searchQuery, 'i');

    console.log(`Searching for: "${searchQuery}"`);

    // Search doctors by name, email, and bio
    const doctorResults = await User.find({
      userType: 'doctor',
      isActive: true,
      $or: [
        { name: searchRegex },
        { email: searchRegex },
        { bio: searchRegex }
      ]
    })
    // FIXED: Include profileImage and backgroundImage in the selection
    .select('_id name specialization ratings practiceLocations email profileImage backgroundImage bio')
    .sort({ 'ratings.average': -1 }) // Sort by rating first
    .limit(searchLimit)
    .lean();

    console.log(`Found ${doctorResults.length} doctors matching search`);

    // Get unique specializations that match search
    const allSpecializations = [
      'cardiology', 'dermatology', 'neurology', 'pediatrics',
      'orthopedics', 'psychiatry', 'general', 'gynecology',
      'ophthalmology', 'dentistry', 'other'
    ];

    const specializationDisplayNames = {
      'cardiology': 'Cardiologist',
      'dermatology': 'Dermatologist',
      'neurology': 'Neurologist',
      'pediatrics': 'Pediatrician',
      'orthopedics': 'Orthopedic Surgeon',
      'psychiatry': 'Psychiatrist',
      'general': 'General Physician',
      'gynecology': 'Gynecologist',
      'ophthalmology': 'Ophthalmologist',
      'dentistry': 'Dentist',
      'other': 'Specialist'
    };

    const matchingSpecializations = allSpecializations.filter(spec => {
      const displayName = specializationDisplayNames[spec] || spec;
      const searchLower = searchQuery.toLowerCase();
      
      return spec.includes(searchLower) || 
             displayName.toLowerCase().includes(searchLower) ||
             // Add common search terms
             (searchLower.includes('cardio') && spec === 'cardiology') ||
             (searchLower.includes('heart') && spec === 'cardiology') ||
             (searchLower.includes('dermat') && spec === 'dermatology') ||
             (searchLower.includes('skin') && spec === 'dermatology') ||
             (searchLower.includes('neuro') && spec === 'neurology') ||
             (searchLower.includes('brain') && spec === 'neurology') ||
             (searchLower.includes('pediatr') && spec === 'pediatrics') ||
             (searchLower.includes('child') && spec === 'pediatrics') ||
             (searchLower.includes('orthop') && spec === 'orthopedics') ||
             (searchLower.includes('bone') && spec === 'orthopedics') ||
             (searchLower.includes('joint') && spec === 'orthopedics') ||
             (searchLower.includes('psychiat') && spec === 'psychiatry') ||
             (searchLower.includes('mental') && spec === 'psychiatry') ||
             (searchLower.includes('gynec') && spec === 'gynecology') ||
             (searchLower.includes('women') && spec === 'gynecology') ||
             (searchLower.includes('ophthal') && spec === 'ophthalmology') ||
             (searchLower.includes('eye') && spec === 'ophthalmology') ||
             (searchLower.includes('dent') && spec === 'dentistry') ||
             (searchLower.includes('teeth') && spec === 'dentistry') ||
             (searchLower.includes('tooth') && spec === 'dentistry');
    });

    // Search cities from both old and new address structures
    const citiesAggregation = await User.aggregate([
      {
        $match: {
          userType: 'doctor',
          isActive: true,
          $or: [
            { 'address.city': searchRegex },
            { 
              'practiceLocations.address.city': searchRegex,
              'practiceLocations.isActive': { $ne: false }
            }
          ]
        }
      },
      {
        $project: {
          cities: {
            $setUnion: [
              // Get cities from legacy address field
              {
                $cond: {
                  if: { 
                    $and: [
                      { $ne: ['$address.city', null] }, 
                      { $ne: ['$address.city', ''] },
                      { $regexMatch: { input: '$address.city', regex: searchQuery, options: 'i' } }
                    ] 
                  },
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
                          { $ne: ['$$this.address.city', ''] },
                          { $regexMatch: { input: '$$this.address.city', regex: searchQuery, options: 'i' } }
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
      { $limit: Math.floor(searchLimit / 3) }, // Limit city results
      { $sort: { _id: 1 } }
    ]);

    const cityResults = citiesAggregation.map(item => item._id).filter(city => city);

    console.log(`Found ${matchingSpecializations.length} specializations and ${cityResults.length} cities`);

    const response = {
      success: true,
      data: {
        doctors: doctorResults,
        specializations: matchingSpecializations.slice(0, Math.floor(searchLimit / 2)),
        cities: cityResults
      }
    };

    res.json(response);

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed',
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
  searchCities,
  searchDoctors
};