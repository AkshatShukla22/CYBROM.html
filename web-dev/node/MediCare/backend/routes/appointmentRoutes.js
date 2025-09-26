// routes/appointmentRoutes.js - Clean appointment routes
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
router.get('/doctors/:doctorId/availability', getDoctorAvailability);

// Protected routes (require authentication)
router.post('/doctors/:doctorId/book', auth, bookAppointment);
router.get('/patient/appointments', auth, getPatientAppointments);
router.get('/doctor/appointments', auth, getDoctorAppointments);
router.get('/:appointmentId', auth, getAppointmentById);
router.put('/:appointmentId/cancel', auth, cancelAppointment);
router.put('/:appointmentId/status', auth, updateAppointmentStatus);

module.exports = router;