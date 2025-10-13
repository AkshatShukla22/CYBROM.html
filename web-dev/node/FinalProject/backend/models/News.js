// models/News.js
const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  heading: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  gameName: {
    type: String,
    trim: true,
    default: ''
  },
  headingImage: {
    type: String,
    default: null
  },
  detailImage: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
newsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('News', newsSchema);