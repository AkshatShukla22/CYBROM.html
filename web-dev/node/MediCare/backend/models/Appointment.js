// models/Appointment.js
const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  // Patient information
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  patientName: {
    type: String,
    required: true
  },
  patientEmail: {
    type: String,
    required: true
  },
  patientPhone: {
    type: String,
    required: true
  },
  
  // Doctor information
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorName: {
    type: String,
    required: true
  },
  
  // Location and timing
  practiceLocationId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  locationName: {
    type: String,
    required: true
  },
  locationAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  
  // Appointment details
  appointmentDate: {
    type: Date,
    required: true
  },
  timeSlot: {
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    }
  },
  
  // Queue and payment info
  queueNumber: {
    type: Number,
    required: true
  },
  consultationFee: {
    type: Number,
    required: true
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  
  // Additional information
  symptoms: {
    type: String,
    maxlength: 500
  },
  notes: {
    type: String,
    maxlength: 1000
  },
  
  // Payment status
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'online', 'insurance'],
    default: 'cash'
  },
  
  // Cancellation details
  cancellationReason: String,
  cancelledAt: Date,
  cancelledBy: {
    type: String,
    enum: ['patient', 'doctor', 'system']
  },
  
  // Metadata
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
appointmentSchema.index({ doctorId: 1, appointmentDate: 1 });
appointmentSchema.index({ patientId: 1, appointmentDate: 1 });
appointmentSchema.index({ practiceLocationId: 1, appointmentDate: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ appointmentDate: 1, queueNumber: 1 });

// Virtual for formatted date
appointmentSchema.virtual('formattedDate').get(function() {
  return this.appointmentDate.toLocaleDateString('en-IN');
});

// Virtual for formatted time
appointmentSchema.virtual('formattedTime').get(function() {
  return `${this.timeSlot.startTime} - ${this.timeSlot.endTime}`;
});

// Static method to get next queue number for a specific date and location
appointmentSchema.statics.getNextQueueNumber = async function(doctorId, practiceLocationId, appointmentDate) {
  const startOfDay = new Date(appointmentDate);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(appointmentDate);
  endOfDay.setHours(23, 59, 59, 999);
  
  const lastAppointment = await this.findOne({
    doctorId,
    practiceLocationId,
    appointmentDate: {
      $gte: startOfDay,
      $lte: endOfDay
    },
    status: { $nin: ['cancelled'] },
    isActive: true
  }).sort({ queueNumber: -1 });
  
  return lastAppointment ? lastAppointment.queueNumber + 1 : 1;
};

// Static method to check location capacity
appointmentSchema.statics.checkLocationCapacity = async function(doctorId, practiceLocationId, appointmentDate, patientsPerDay) {
  const startOfDay = new Date(appointmentDate);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(appointmentDate);
  endOfDay.setHours(23, 59, 59, 999);
  
  const currentBookings = await this.countDocuments({
    doctorId,
    practiceLocationId,
    appointmentDate: {
      $gte: startOfDay,
      $lte: endOfDay
    },
    status: { $nin: ['cancelled', 'no-show'] },
    isActive: true
  });
  
  return currentBookings < patientsPerDay;
};

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;