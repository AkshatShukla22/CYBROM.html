const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
    bookname: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

const Book = mongoose.model("Book", bookSchema);
module.exports = Book;