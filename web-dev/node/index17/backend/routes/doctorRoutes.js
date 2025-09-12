// routes/doctorRoutes.js - Updated with appointment routes
const express = require('express');
const auth = require('../middleware/auth'); // Import auth middleware for protected routes
const {
  getAllDoctors,
  getDoctorById,
  getDoctorRatings,
  submitDoctorRating,
  deleteDoctorRating,
  getDoctorsBySpecialization,
  getDoctorStats,
  searchCities
} = require('../controllers/doctorController');

const router = express.Router();

// Public routes - no authentication required to view doctors
router.get('/', getAllDoctors);
router.get('/stats', getDoctorStats);
router.get('/search-cities', searchCities);
router.get('/specialization/:specialization', getDoctorsBySpecialization);

// Routes that must come AFTER the static routes above to avoid conflicts
router.get('/:doctorId', getDoctorById);  // Get single doctor by ID
router.get('/:doctorId/ratings', getDoctorRatings);  // Get doctor ratings

// Protected routes - require authentication
router.post('/:doctorId/ratings', auth, submitDoctorRating);  // Submit rating (requires login)
router.delete('/:doctorId/ratings/:ratingId', auth, deleteDoctorRating);  // Delete rating (requires login)

module.exports = router;