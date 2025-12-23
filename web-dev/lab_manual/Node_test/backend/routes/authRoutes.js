const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

router.get('/register', authController.getRegister);
router.post('/register', authController.postRegister);
router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);
router.get('/logout', authController.logout);
router.get('/profile', verifyToken, authController.getProfile);

router.get('/token', authController.getToken);

router.post('/token/refresh', authController.refreshToken);

module.exports = router;