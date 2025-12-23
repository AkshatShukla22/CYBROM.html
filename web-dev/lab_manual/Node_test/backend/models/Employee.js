const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  position: {
    type: String,
    required: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  hireDate: {
    type: Date,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  salary: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Salary',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);