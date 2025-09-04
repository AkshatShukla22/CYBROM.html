const bookModel = require("../models/bookModel");
const authorModel = require("../models/authorModel");

const bookall = async (req, res) => {
    try {
        const books = await bookModel.find();
        res.json(books);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const booksave = async (req, res) => {
    try {
        const { bookname, price, authorId } = req.body;

        const newBook = new bookModel({
            bookname,
            price: parseFloat(price)
        });

        const savedBook = await newBook.save();

        if (authorId) {
            await authorModel.findByIdAndUpdate(
                authorId,
                { $push: { books: savedBook._id } }
            );
        }

        res.status(201).json({ message: "Book saved successfully", book: savedBook });
        console.log("Book saved:", { bookname, price });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getBooksByAuthor = async (req, res) => {
    try {
        const author = await authorModel.findById(req.params.authorId).populate('books');
        if (!author) {
            return res.status(404).json({ message: "Author not found" });
        }
        res.json(author.books);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    bookall,
    booksave,
    getBooksByAuthor
};
