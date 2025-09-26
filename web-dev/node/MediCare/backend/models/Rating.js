// models/Rating.js
const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  userName: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  profileImage: {
    type: String,
    default: null
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  feedback: {
    type: String,
    maxlength: 1000,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate ratings from same user to same doctor
ratingSchema.index({ doctorId: 1, userId: 1 }, { unique: true });

// Index for efficient queries
ratingSchema.index({ doctorId: 1, isActive: 1 });
ratingSchema.index({ userId: 1, isActive: 1 });
ratingSchema.index({ rating: 1 });
ratingSchema.index({ createdAt: -1 });

const Rating = mongoose.model('Rating', ratingSchema);

module.exports = Rating;