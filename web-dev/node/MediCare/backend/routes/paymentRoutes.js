const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createOrder, verifyPayment } = require('../controllers/paymentController');

// Create Razorpay order (protected)
router.post('/razorpay/order', auth, createOrder);

// Verify Razorpay payment
router.post('/razorpay/verify', auth, verifyPayment);

module.exports = router;
