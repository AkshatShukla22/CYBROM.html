const mongoose = require('mongoose');

const stuSchema = new mongoose.Schema({
    rollno: String,
    name: String,
    city: String,
    fees: Number
});

const StuModel = mongoose.model('Student', stuSchema);

module.exports = StuModel;