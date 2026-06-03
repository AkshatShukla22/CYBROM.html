const Razorpay = require('razorpay');
const crypto = require('crypto');
const Appointment = require('../models/Appointment');

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || ''
});

// Create a Razorpay order
const createOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt, appointmentId } = req.body;
    if (!amount) {
      return res.status(400).json({ success: false, message: 'Amount is required' });
    }

    const options = {
      amount: Math.round(Number(amount) * 100), // convert to smallest unit (paise)
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      payment_capture: 1
    };

    const order = await razorpayInstance.orders.create(options);

    // Optionally attach orderId to appointment as pendingPaymentOrder
    if (appointmentId) {
      await Appointment.findByIdAndUpdate(appointmentId, {
        $set: { pendingPaymentOrder: order.id }
      });
    }

    res.json({ success: true, order, keyId: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: 'Failed to create order', error: error.message });
  }
};

// Verify Razorpay payment signature and mark appointment paid
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, appointmentId } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Missing payment verification parameters' });
    }

    const generated_signature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    // Mark appointment as paid if appointmentId provided
    if (appointmentId) {
      await Appointment.findByIdAndUpdate(appointmentId, {
        $set: {
          paymentStatus: 'paid',
          paymentMethod: 'razorpay',
          paymentDetails: {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            paidAt: new Date()
          }
        }
      });
    }

    res.json({ success: true, message: 'Payment verified successfully' });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ success: false, message: 'Payment verification failed', error: error.message });
  }
};

module.exports = { createOrder, verifyPayment };
