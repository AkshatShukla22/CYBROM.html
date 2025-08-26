const express = require("express");
const router = express.Router();    
const userController = require("../controller/userController");

router.post("/register", userController.userRegistration);
router.post("/login", userController.userLogin);
router.post("/verify-token", userController.verifyToken);

module.exports = router;