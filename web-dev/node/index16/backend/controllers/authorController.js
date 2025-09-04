const authorModel = require("../models/authorModel");
const bookModel = require("../models/bookModel");

const authorall = async (req, res) => {
    try {
        const authors = await authorModel.find().populate('books');
        res.json(authors);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const authorsave = async (req, res) => {
    try {
        const { email, authorName, bookname, price } = req.body;

        const newBook = new bookModel({
            bookname,
            price: parseFloat(price)
        });

        const savedBook = await newBook.save();

        let author = await authorModel.findOne({ email });

        if (author) {
            author.books.push(savedBook._id);
            await author.save();
            res.status(201).json({ message: "Book added to existing author successfully", author });
        } else {
            const newAuthor = new authorModel({
                email,
                authorName,
                books: [savedBook._id]
            });

            const savedAuthor = await newAuthor.save();
            res.status(201).json({ message: "Author and book saved successfully", author: savedAuthor });
        }

        console.log("Author and book saved:", { email, authorName, bookname, price });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getAuthorWithBooks = async (req, res) => {
    try {
        const author = await authorModel.findById(req.params.id).populate('books');
        if (!author) {
            return res.status(404).json({ message: "Author not found" });
        }
        res.json(author);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { 
    authorsave,
    authorall,
    getAuthorWithBooks
};