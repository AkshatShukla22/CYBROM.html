// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
    sparse: true // Allows multiple null values but unique non-null values
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
    maxlength: 500
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  // Doctor-specific additional fields
  consultationFee: {
    type: Number,
    required: function() {
      return this.userType === 'doctor';
    }
  },
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
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Hash password with cost of 12
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