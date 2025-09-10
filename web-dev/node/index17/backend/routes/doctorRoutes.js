// routes/doctorRoutes.js
const express = require('express');
const {
  getAllDoctors,
  getDoctorsBySpecialization,
  getDoctorStats
} = require('../controllers/doctorController');

const router = express.Router();

// Public routes - no authentication required to view doctors
router.get('/', getAllDoctors);
router.get('/stats', getDoctorStats);
router.get('/specialization/:specialization', getDoctorsBySpecialization);

module.exports = router;