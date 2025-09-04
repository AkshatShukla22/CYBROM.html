const express = require("express");
const router = express.Router();
const bookController = require("../controllers/bookController");

router.post("/booksave", bookController.booksave);
router.get("/bookall", bookController.bookall);
router.get("/author/:authorId/books", bookController.getBooksByAuthor);

module.exports = router;