// controllers/appointmentController.js - FIXED VERSION
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

// FIXED: Helper function to check if appointment date falls on available day
const isDateAvailableForLocation = (appointmentDate, location, doctor = null) => {
  try {
    // Get day name in multiple formats to handle different data structures
    const dayNames = {
      full: appointmentDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase(),
      short: appointmentDate.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase(),
      index: appointmentDate.getDay() // 0=Sunday, 1=Monday, etc.
    };

    console.log('Checking availability for:', dayNames);

    // First, try to find slots in the practice location
    if (location && location.availableSlots && Array.isArray(location.availableSlots)) {
      console.log('Checking location availableSlots:', location.availableSlots);
      
      const availableSlot = location.availableSlots.find(slot => {
        if (!slot || !slot.isActive) return false;
        
        const slotDay = slot.day ? slot.day.toLowerCase() : '';
        console.log('Comparing slot day:', slotDay, 'with:', dayNames);
        
        return slotDay === dayNames.full || 
               slotDay === dayNames.short || 
               slotDay === dayNames.full.substring(0, 3); // mon, tue, etc.
      });
      
      if (availableSlot) {
        console.log('Found available slot in location:', availableSlot);
        return availableSlot;
      }
    }

    // Fallback: Check doctor's legacy availableSlots if location doesn't have any
    if (doctor && doctor.availableSlots && Array.isArray(doctor.availableSlots)) {
      console.log('Checking doctor availableSlots:', doctor.availableSlots);
      
      const availableSlot = doctor.availableSlots.find(slot => {
        if (!slot || !slot.isActive) return false;
        
        const slotDay = slot.day ? slot.day.toLowerCase() : '';
        console.log('Comparing doctor slot day:', slotDay, 'with:', dayNames);
        
        return slotDay === dayNames.full || 
               slotDay === dayNames.short || 
               slotDay === dayNames.full.substring(0, 3);
      });
      
      if (availableSlot) {
        console.log('Found available slot in doctor slots:', availableSlot);
        return availableSlot;
      }
    }
    
    console.log('No available slot found for this day');
    return null;
  } catch (error) {
    console.error('Error in isDateAvailableForLocation:', error);
    return null;
  }
};

// @desc    Get doctor's available slots for a specific date
// @access  Public
const getDoctorAvailability = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;
    
    console.log('Getting availability for doctor:', doctorId, 'date:', date);
    
    // Validate inputs
    if (!doctorId) {
      return res.status(400).json({
        success: false,
        message: 'Doctor ID is required'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid doctor ID format'
      });
    }
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date parameter is required'
      });
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Please use YYYY-MM-DD format.'
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
    }).select('-password').lean();
    
    console.log('Found doctor:', doctor ? doctor.name : 'Not found');
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found or inactive'
      });
    }

    const appointmentDate = new Date(date);
    const availability = [];
    
    console.log('Doctor practiceLocations:', doctor.practiceLocations);
    console.log('Doctor legacy availableSlots:', doctor.availableSlots);
    
    // FIXED: Handle both cases - with and without practice locations
    if (doctor.practiceLocations && Array.isArray(doctor.practiceLocations) && doctor.practiceLocations.length > 0) {
      console.log('Checking', doctor.practiceLocations.length, 'practice locations');
      
      // Check each practice location
      for (const location of doctor.practiceLocations) {
        try {
          console.log('Checking location:', location.name, 'isActive:', location.isActive);
          
          if (!location.isActive) {
            console.log('Location inactive, skipping');
            continue;
          }
          
          const availableSlot = isDateAvailableForLocation(appointmentDate, location, doctor);
          console.log('Available slot for location:', location.name, ':', availableSlot);
          
          if (availableSlot) {
            // Check current bookings for this location and date
            const patientsPerDay = location.patientsPerDay || 10; // Default to 10 if not set
            
            const hasCapacity = await Appointment.checkLocationCapacity(
              doctorId,
              location._id,
              appointmentDate,
              patientsPerDay
            );
            
            console.log('Has capacity for location', location.name, ':', hasCapacity);
            
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
              
              const availabilitySlot = {
                locationId: location._id,
                locationName: location.name || 'Unnamed Location',
                address: location.address || {},
                consultationFee: location.consultationFee || doctor.consultationFee || 500,
                timeSlot: {
                  startTime: availableSlot.startTime || '09:00',
                  endTime: availableSlot.endTime || '17:00'
                },
                availableSpots: Math.max(0, patientsPerDay - currentBookings),
                totalCapacity: patientsPerDay,
                nextQueueNumber,
                currentBookings,
                estimatedWaitTime: `${Math.max(0, (nextQueueNumber - 1) * 15)} minutes`
              };
              
              console.log('Adding availability slot:', availabilitySlot);
              availability.push(availabilitySlot);
            }
          }
        } catch (locationError) {
          console.error('Error processing location:', location.name, locationError);
          continue;
        }
      }
    } else {
      // FIXED: Fallback to legacy system - create a default location using doctor's availableSlots
      console.log('No practice locations found, using legacy system');
      
      const availableSlot = isDateAvailableForLocation(appointmentDate, null, doctor);
      console.log('Available slot from legacy system:', availableSlot);
      
      if (availableSlot) {
        // Create a virtual location using doctor's information
        const virtualLocationId = new mongoose.Types.ObjectId(); // Generate a temp ID
        const patientsPerDay = 10; // Default capacity
        
        // For legacy system, we don't have per-location booking tracking
        // So we'll check total appointments for this doctor on this date
        const startOfDay = new Date(appointmentDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(appointmentDate);
        endOfDay.setHours(23, 59, 59, 999);
        
        const currentBookings = await Appointment.countDocuments({
          doctorId,
          appointmentDate: { $gte: startOfDay, $lte: endOfDay },
          status: { $nin: ['cancelled', 'no-show'] },
          isActive: true
        });
        
        console.log('Current bookings for legacy system:', currentBookings);
        
        if (currentBookings < patientsPerDay) {
          const nextQueueNumber = currentBookings + 1;
          
          const availabilitySlot = {
            locationId: virtualLocationId,
            locationName: `${doctor.name}'s Clinic`,
            address: doctor.address || {},
            consultationFee: doctor.consultationFee || 500,
            timeSlot: {
              startTime: availableSlot.startTime || '09:00',
              endTime: availableSlot.endTime || '17:00'
            },
            availableSpots: Math.max(0, patientsPerDay - currentBookings),
            totalCapacity: patientsPerDay,
            nextQueueNumber,
            currentBookings,
            estimatedWaitTime: `${Math.max(0, (nextQueueNumber - 1) * 15)} minutes`
          };
          
          console.log('Adding legacy availability slot:', availabilitySlot);
          availability.push(availabilitySlot);
        }
      }
    }
    
    console.log('Final availability count:', availability.length);
    
    res.json({
      success: true,
      data: {
        doctorId,
        doctorName: doctor.name,
        date: appointmentDate.toISOString().split('T')[0],
        availability,
        totalAvailableSlots: availability.length
      }
    });
    
  } catch (error) {
    console.error('Get doctor availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching availability',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// FIXED: Book appointment function with better location handling
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
    
    console.log('Booking appointment:', { doctorId, appointmentDate, practiceLocationId, patientId });
    
    // Validate required fields
    if (!appointmentDate || !practiceLocationId) {
      return res.status(400).json({
        success: false,
        message: 'Appointment date and practice location are required'
      });
    }

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid doctor ID'
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
    
    const appointmentDateObj = new Date(appointmentDate);
    let practiceLocation = null;
    let locationName = '';
    let locationAddress = {};
    let consultationFee = doctor.consultationFee || 500;
    let patientsPerDay = 10;
    
    // FIXED: Handle both practice locations and legacy system
    if (doctor.practiceLocations && doctor.practiceLocations.length > 0) {
      practiceLocation = doctor.practiceLocations.id(practiceLocationId);
      if (!practiceLocation || !practiceLocation.isActive) {
        return res.status(404).json({
          success: false,
          message: 'Practice location not found or inactive'
        });
      }
      locationName = practiceLocation.name || 'Unnamed Location';
      locationAddress = practiceLocation.address || {};
      consultationFee = practiceLocation.consultationFee || doctor.consultationFee || 500;
      patientsPerDay = practiceLocation.patientsPerDay || 10;
    } else {
      // Legacy system - use doctor's basic info
      locationName = `${doctor.name}'s Clinic`;
      locationAddress = doctor.address || {};
    }
    
    // Check if the date is available
    const availableSlot = isDateAvailableForLocation(appointmentDateObj, practiceLocation, doctor);
    if (!availableSlot) {
      return res.status(400).json({
        success: false,
        message: 'Doctor is not available on the selected date'
      });
    }
    
    // Check capacity
    let hasCapacity = false;
    if (practiceLocation) {
      hasCapacity = await Appointment.checkLocationCapacity(
        doctorId,
        practiceLocationId,
        appointmentDateObj,
        patientsPerDay
      );
    } else {
      // Legacy system - check total appointments for this doctor
      const startOfDay = new Date(appointmentDateObj);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(appointmentDateObj);
      endOfDay.setHours(23, 59, 59, 999);
      
      const currentBookings = await Appointment.countDocuments({
        doctorId,
        appointmentDate: { $gte: startOfDay, $lte: endOfDay },
        status: { $nin: ['cancelled', 'no-show'] },
        isActive: true
      });
      
      hasCapacity = currentBookings < patientsPerDay;
    }
    
    if (!hasCapacity) {
      return res.status(400).json({
        success: false,
        message: 'No available slots for the selected date. Please choose another date.'
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
    let queueNumber = 1;
    if (practiceLocation) {
      queueNumber = await Appointment.getNextQueueNumber(
        doctorId,
        practiceLocationId,
        appointmentDateObj
      );
    } else {
      // Legacy system
      const currentBookings = await Appointment.countDocuments({
        doctorId,
        appointmentDate: { $gte: startOfDay, $lte: endOfDay },
        status: { $nin: ['cancelled', 'no-show'] },
        isActive: true
      });
      queueNumber = currentBookings + 1;
    }
    
    // Create appointment
    const appointment = new Appointment({
      patientId,
      patientName: patient.name,
      patientEmail: patient.email,
      patientPhone: patient.phone || '',
      doctorId,
      doctorName: doctor.name,
      practiceLocationId: practiceLocationId,
      locationName,
      locationAddress,
      appointmentDate: appointmentDateObj,
      timeSlot: {
        startTime: availableSlot.startTime || '09:00',
        endTime: availableSlot.endTime || '17:00'
      },
      queueNumber,
      consultationFee,
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
        estimatedWaitTime: `${Math.max(0, (queueNumber - 1) * 15)} minutes`
      }
    });
    
  } catch (error) {
    console.error('Book appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while booking appointment',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Keep all other functions the same...
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
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

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
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const getAppointmentById = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const userId = req.userId;
    
    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid appointment ID'
      });
    }
    
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
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const cancelAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { cancellationReason } = req.body;
    const userId = req.userId;
    
    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid appointment ID'
      });
    }
    
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
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status, notes } = req.body;
    const doctorId = req.userId;
    
    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid appointment ID'
      });
    }
    
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
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
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