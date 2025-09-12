// controllers/appointmentController.js
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const mongoose = require('mongoose');

// Helper function to validate date (not in past and not too far in future)
const validateAppointmentDate = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const appointmentDate = new Date(date);
  appointmentDate.setHours(0, 0, 0, 0);
  
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 90); // Allow booking up to 90 days in advance
  maxDate.setHours(0, 0, 0, 0);
  
  return appointmentDate >= today && appointmentDate <= maxDate;
};

// Helper function to check if appointment date falls on available day
const isDateAvailableForLocation = (appointmentDate, location) => {
  const dayOfWeek = appointmentDate.toLocaleDateString('en-US', { weekday: 'lowercase' });
  const availableSlot = location.availableSlots.find(slot => 
    slot.day === dayOfWeek && slot.isActive
  );
  return availableSlot;
};

// @desc    Get doctor's available slots for a specific date
// @access  Public
const getDoctorAvailability = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date parameter is required'
      });
    }
    
    if (!validateAppointmentDate(date)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date. Please select a date between today and 90 days from now.'
      });
    }
    
    // Get doctor with practice locations
    const doctor = await User.findOne({
      _id: doctorId,
      userType: 'doctor',
      isActive: true
    }).select('-password');
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }
    
    const appointmentDate = new Date(date);
    const availability = [];
    
    // Check each practice location
    for (const location of doctor.practiceLocations) {
      if (!location.isActive) continue;
      
      const availableSlot = isDateAvailableForLocation(appointmentDate, location);
      
      if (availableSlot) {
        // Check current bookings for this location and date
        const hasCapacity = await Appointment.checkLocationCapacity(
          doctorId,
          location._id,
          appointmentDate,
          location.patientsPerDay
        );
        
        if (hasCapacity) {
          // Get current queue number for this location
          const nextQueueNumber = await Appointment.getNextQueueNumber(
            doctorId,
            location._id,
            appointmentDate
          );
          
          // Get current bookings count
          const startOfDay = new Date(appointmentDate);
          startOfDay.setHours(0, 0, 0, 0);
          const endOfDay = new Date(appointmentDate);
          endOfDay.setHours(23, 59, 59, 999);
          
          const currentBookings = await Appointment.countDocuments({
            doctorId,
            practiceLocationId: location._id,
            appointmentDate: { $gte: startOfDay, $lte: endOfDay },
            status: { $nin: ['cancelled', 'no-show'] },
            isActive: true
          });
          
          availability.push({
            locationId: location._id,
            locationName: location.name,
            address: location.address,
            consultationFee: location.consultationFee,
            timeSlot: {
              startTime: availableSlot.startTime,
              endTime: availableSlot.endTime
            },
            availableSpots: location.patientsPerDay - currentBookings,
            totalCapacity: location.patientsPerDay,
            nextQueueNumber,
            currentBookings,
            estimatedWaitTime: `${(nextQueueNumber - 1) * 15} minutes` // Assuming 15 min per patient
          });
        }
      }
    }
    
    res.json({
      success: true,
      data: {
        doctorId,
        doctorName: doctor.name,
        date: appointmentDate.toISOString().split('T')[0],
        availability
      }
    });
    
  } catch (error) {
    console.error('Get doctor availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching availability',
      error: error.message
    });
  }
};

// @desc    Book an appointment
// @access  Private (requires authentication)
const bookAppointment = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { 
      appointmentDate, 
      practiceLocationId, 
      symptoms, 
      notes 
    } = req.body;
    const patientId = req.userId;
    
    // Validate required fields
    if (!appointmentDate || !practiceLocationId) {
      return res.status(400).json({
        success: false,
        message: 'Appointment date and practice location are required'
      });
    }
    
    // Validate appointment date
    if (!validateAppointmentDate(appointmentDate)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date. Please select a date between today and 90 days from now.'
      });
    }
    
    // Get patient details
    const patient = await User.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }
    
    // Get doctor and practice location
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
    
    const practiceLocation = doctor.practiceLocations.id(practiceLocationId);
    if (!practiceLocation || !practiceLocation.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Practice location not found or inactive'
      });
    }
    
    const appointmentDateObj = new Date(appointmentDate);
    
    // Check if the date is available for this location
    const availableSlot = isDateAvailableForLocation(appointmentDateObj, practiceLocation);
    if (!availableSlot) {
      return res.status(400).json({
        success: false,
        message: 'Doctor is not available at this location on the selected date'
      });
    }
    
    // Check capacity
    const hasCapacity = await Appointment.checkLocationCapacity(
      doctorId,
      practiceLocationId,
      appointmentDateObj,
      practiceLocation.patientsPerDay
    );
    
    if (!hasCapacity) {
      return res.status(400).json({
        success: false,
        message: 'No available slots for the selected date and location. Please choose another date or location.'
      });
    }
    
    // Check if patient already has an appointment with this doctor on the same date
    const startOfDay = new Date(appointmentDateObj);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(appointmentDateObj);
    endOfDay.setHours(23, 59, 59, 999);
    
    const existingAppointment = await Appointment.findOne({
      patientId,
      doctorId,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $nin: ['cancelled', 'no-show'] },
      isActive: true
    });
    
    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'You already have an appointment with this doctor on the selected date'
      });
    }
    
    // Get next queue number
    const queueNumber = await Appointment.getNextQueueNumber(
      doctorId,
      practiceLocationId,
      appointmentDateObj
    );
    
    // Create appointment
    const appointment = new Appointment({
      patientId,
      patientName: patient.name,
      patientEmail: patient.email,
      patientPhone: patient.phone,
      doctorId,
      doctorName: doctor.name,
      practiceLocationId,
      locationName: practiceLocation.name,
      locationAddress: practiceLocation.address,
      appointmentDate: appointmentDateObj,
      timeSlot: {
        startTime: availableSlot.startTime,
        endTime: availableSlot.endTime
      },
      queueNumber,
      consultationFee: practiceLocation.consultationFee,
      symptoms: symptoms ? symptoms.trim() : '',
      notes: notes ? notes.trim() : ''
    });
    
    await appointment.save();
    
    // Update doctor's total appointments count
    await User.findByIdAndUpdate(doctorId, {
      $inc: { totalAppointments: 1 }
    });
    
    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: {
        appointmentId: appointment._id,
        appointmentDate: appointment.formattedDate,
        timeSlot: appointment.formattedTime,
        queueNumber: appointment.queueNumber,
        locationName: appointment.locationName,
        consultationFee: appointment.consultationFee,
        status: appointment.status,
        estimatedWaitTime: `${(queueNumber - 1) * 15} minutes`
      }
    });
    
  } catch (error) {
    console.error('Book appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while booking appointment',
      error: error.message
    });
  }
};

// @desc    Get patient's appointments
// @access  Private
const getPatientAppointments = async (req, res) => {
  try {
    const patientId = req.userId;
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = { patientId, isActive: true };
    if (status) {
      query.status = status;
    }
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    const appointments = await Appointment.find(query)
      .sort({ appointmentDate: -1, queueNumber: 1 })
      .skip(skip)
      .limit(limitNum)
      .lean();
    
    const totalAppointments = await Appointment.countDocuments(query);
    const totalPages = Math.ceil(totalAppointments / limitNum);
    
    res.json({
      success: true,
      data: {
        appointments,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalAppointments,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }
    });
    
  } catch (error) {
    console.error('Get patient appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching appointments',
      error: error.message
    });
  }
};

// @desc    Get doctor's appointments
// @access  Private
const getDoctorAppointments = async (req, res) => {
  try {
    const doctorId = req.userId;
    const { date, status, locationId, page = 1, limit = 20 } = req.query;
    
    // Verify user is a doctor
    const doctor = await User.findOne({ _id: doctorId, userType: 'doctor' });
    if (!doctor) {
      return res.status(403).json({
        success: false,
        message: 'Only doctors can access this endpoint'
      });
    }
    
    const query = { doctorId, isActive: true };
    
    if (status) {
      query.status = status;
    }
    
    if (locationId) {
      query.practiceLocationId = locationId;
    }
    
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.appointmentDate = { $gte: startOfDay, $lte: endOfDay };
    }
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    const appointments = await Appointment.find(query)
      .sort({ appointmentDate: 1, queueNumber: 1 })
      .skip(skip)
      .limit(limitNum)
      .lean();
    
    const totalAppointments = await Appointment.countDocuments(query);
    const totalPages = Math.ceil(totalAppointments / limitNum);
    
    res.json({
      success: true,
      data: {
        appointments,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalAppointments,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }
    });
    
  } catch (error) {
    console.error('Get doctor appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching appointments',
      error: error.message
    });
  }
};

// @desc    Get single appointment details
// @access  Private
const getAppointmentById = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const userId = req.userId;
    
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      isActive: true
    }).lean();
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    // Check if user has permission to view this appointment
    if (appointment.patientId.toString() !== userId && appointment.doctorId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this appointment'
      });
    }
    
    res.json({
      success: true,
      data: { appointment }
    });
    
  } catch (error) {
    console.error('Get appointment by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching appointment',
      error: error.message
    });
  }
};

// @desc    Cancel appointment
// @access  Private
const cancelAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { cancellationReason } = req.body;
    const userId = req.userId;
    
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      isActive: true
    });
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    // Check if user has permission to cancel this appointment
    const isPatient = appointment.patientId.toString() === userId;
    const isDoctor = appointment.doctorId.toString() === userId;
    
    if (!isPatient && !isDoctor) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to cancel this appointment'
      });
    }
    
    // Check if appointment can be cancelled (not in the past or already completed)
    if (appointment.status === 'completed' || appointment.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: `Appointment is already ${appointment.status}`
      });
    }
    
    // Update appointment status
    appointment.status = 'cancelled';
    appointment.cancellationReason = cancellationReason || '';
    appointment.cancelledAt = new Date();
    appointment.cancelledBy = isPatient ? 'patient' : 'doctor';
    
    await appointment.save();
    
    res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: {
        appointmentId: appointment._id,
        status: appointment.status,
        cancelledAt: appointment.cancelledAt,
        cancelledBy: appointment.cancelledBy
      }
    });
    
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling appointment',
      error: error.message
    });
  }
};

// @desc    Update appointment status (for doctors)
// @access  Private
const updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status, notes } = req.body;
    const doctorId = req.userId;
    
    // Verify user is a doctor
    const doctor = await User.findOne({ _id: doctorId, userType: 'doctor' });
    if (!doctor) {
      return res.status(403).json({
        success: false,
        message: 'Only doctors can update appointment status'
      });
    }
    
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctorId,
      isActive: true
    });
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    // Validate status transition
    const validStatuses = ['confirmed', 'in-progress', 'completed', 'no-show'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
    
    appointment.status = status;
    if (notes) {
      appointment.notes = notes.trim();
    }
    
    await appointment.save();
    
    res.json({
      success: true,
      message: 'Appointment status updated successfully',
      data: {
        appointmentId: appointment._id,
        status: appointment.status,
        updatedAt: appointment.updatedAt
      }
    });
    
  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating appointment status',
      error: error.message
    });
  }
};

module.exports = {
  getDoctorAvailability,
  bookAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  getAppointmentById,
  cancelAppointment,
  updateAppointmentStatus
};