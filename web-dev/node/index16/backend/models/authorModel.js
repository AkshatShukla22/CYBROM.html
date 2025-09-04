const mongoose = require("mongoose");

const authorSchema = new mongoose.Schema({
  authorName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  books: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Book' 
  }]
}, {
  timestamps: true
});

const Author = mongoose.model("Author", authorSchema);
module.exports = Author;