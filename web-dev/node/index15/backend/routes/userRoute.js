const express = require("express");
const router = express.Router();    
const userController = require("../controller/userController");
const e = require("express");

router.post("/register", userController.userRegistration);
router.post("/login", userController.userLogin);

router.post("/auth", userController.userAuth);

module.exports = router;