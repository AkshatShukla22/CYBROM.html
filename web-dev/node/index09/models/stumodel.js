const mongoose = require('mongoose');  

const studentSchema = new mongoose.Schema({
    rollno: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    classname: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Student', studentSchema);  