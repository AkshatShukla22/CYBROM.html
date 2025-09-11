// models/User.js - Simplified version that works with existing database
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Simple contact info schema
const contactInfoSchema = new mongoose.Schema({
  phones: [{
    number: String,
    type: {
      type: String,
      enum: ['primary', 'secondary', 'emergency'],
      default: 'primary'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  emails: [{
    email: String,
    type: {
      type: String,
      enum: ['primary', 'secondary'],
      default: 'primary'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }]
});

// Simple practice location schema
const practiceLocationSchema = new mongoose.Schema({
  name: {
    type: String,
    default: 'Practice Location'
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'India'
    }
  },
  consultationFee: {
    type: Number,
    default: 500
  },
  patientsPerDay: {
    type: Number,
    default: 20
  },
  availableSlots: [{
    day: String,
    startTime: String,
    endTime: String,
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  facilities: [String],
  isActive: {
    type: Boolean,
    default: true
  }
});

// Main user schema - backward compatible
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  userType: {
    type: String,
    enum: ['user', 'doctor'],
    default: 'user',
    required: true
  },
  
  // Enhanced contact information (optional)
  contactInfo: contactInfoSchema,
  
  // Address for all users
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'India'
    }
  },
  
  // Doctor-specific fields
  specialization: {
    type: String,
    required: function() {
      return this.userType === 'doctor';
    },
    enum: ['cardiology', 'dermatology', 'neurology', 'pediatrics', 'orthopedics', 'psychiatry', 'general', 'other']
  },
  experience: {
    type: Number,
    required: function() {
      return this.userType === 'doctor';
    },
    min: 0
  },
  licenseNumber: {
    type: String,
    required: function() {
      return this.userType === 'doctor';
    },
    unique: true,
    sparse: true
  },
  
  // Practice locations for doctors (optional, falls back to single consultation fee)
  practiceLocations: [practiceLocationSchema],
  
  // General consultation fee (fallback)
  consultationFee: {
    type: Number,
    required: function() {
      return this.userType === 'doctor';
    },
    default: 500
  },
  
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  profileImage: {
    type: String,
    default: null
  },
  backgroundImage: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: 1000
  },
  
  // Legacy fields for backward compatibility
  availableSlots: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    startTime: String,
    endTime: String,
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  totalAppointments: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Transform JSON output to remove sensitive information
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

// Create indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ userType: 1 });
userSchema.index({ specialization: 1 });
userSchema.index({ 'ratings.average': -1 });

const User = mongoose.model('User', userSchema);

module.exports = User;