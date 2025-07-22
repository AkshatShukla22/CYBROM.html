const mongoose = require('mongoose');

const stuSchema = new mongoose.Schema({
  rollno:Number,
  name:String,  
  ciity:String,  
  fees:Number
});

module.exports = mongoose.model('employee', stuSchema);