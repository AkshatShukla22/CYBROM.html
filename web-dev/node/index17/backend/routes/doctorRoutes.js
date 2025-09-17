// routes/doctorRoutes.js - Clean and organized doctor routes
const express = require('express');
const auth = require('../middleware/auth');
const {
  getAllDoctors,
  getDoctorById,
  getDoctorRatings,
  submitDoctorRating,
  deleteDoctorRating,
  getDoctorsBySpecialization,
  getDoctorStats,
  searchCities,
  searchDoctors
} = require('../controllers/doctorController');

const router = express.Router();

// Public routes - no authentication required
router.get('/', getAllDoctors);
router.get('/stats', getDoctorStats);
router.get('/search', searchDoctors); // Must be before /:doctorId to avoid conflicts
router.get('/search-cities', searchCities);
router.get('/specialization/:specialization', getDoctorsBySpecialization);

// Doctor-specific routes (must come after static routes)
router.get('/:doctorId', getDoctorById);
router.get('/:doctorId/ratings', getDoctorRatings);

// Protected routes - require authentication
router.post('/:doctorId/ratings', auth, submitDoctorRating);
router.delete('/:doctorId/ratings/:ratingId', auth, deleteDoctorRating);

module.exports = router;