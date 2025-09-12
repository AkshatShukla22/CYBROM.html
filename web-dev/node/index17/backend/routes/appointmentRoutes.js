// routes/appointmentRoutes.js
const express = require('express');
const auth = require('../middleware/auth');
const {
  getDoctorAvailability,
  bookAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  getAppointmentById,
  cancelAppointment,
  updateAppointmentStatus
} = require('../controllers/appointmentController');

const router = express.Router();

// Public routes
router.get('/doctors/:doctorId/availability', getDoctorAvailability); // Get doctor availability for a specific date

// Protected routes (require authentication)
router.post('/doctors/:doctorId/book', auth, bookAppointment); // Book appointment with doctor
router.get('/patient/appointments', auth, getPatientAppointments); // Get patient's appointments
router.get('/doctor/appointments', auth, getDoctorAppointments); // Get doctor's appointments
router.get('/:appointmentId', auth, getAppointmentById); // Get single appointment details
router.put('/:appointmentId/cancel', auth, cancelAppointment); // Cancel appointment
router.put('/:appointmentId/status', auth, updateAppointmentStatus); // Update appointment status (doctors only)

module.exports = router;