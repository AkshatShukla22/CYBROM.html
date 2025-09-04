const express = require("express");
const router = express.Router();
const authorController = require("../controllers/authorController");

router.post("/authorsave", authorController.authorsave);
router.get("/authorall", authorController.authorall);
router.get("/author/:id", authorController.getAuthorWithBooks);

module.exports = router;