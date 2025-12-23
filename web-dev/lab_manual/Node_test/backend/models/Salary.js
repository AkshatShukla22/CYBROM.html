const mongoose = require('mongoose');

const salarySchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'Rs'
  }
}, { timestamps: true });

module.exports = mongoose.model('Salary', salarySchema);