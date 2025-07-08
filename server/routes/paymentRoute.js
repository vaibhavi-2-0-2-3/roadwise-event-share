const express = require('express');
const payment_route = express();

const bodyParser = require('body-parser');
payment_route.use(bodyParser.json());
payment_route.use(bodyParser.urlencoded({ extended:false }));

const path = require('path');

payment_route.set('view engine','ejs');
payment_route.set('views',path.join(__dirname, '../views'));

const paymentController = require('../controllers/paymentController');

console.log("Key ID:", process.env.RAZORPAY_KEY_ID);
console.log("Key Secret:", process.env.RAZORPAY_SECRET);


// payment_route.get('/', paymentController.renderRidePage);
payment_route.post('/createOrder', paymentController.createOrder);
const Razorpay = require('razorpay');

payment_route.post('/create-order', async (req, res) => {
  const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'YOUR_KEY_ID',
    key_secret: process.env.RAZORPAY_SECRET || 'YOUR_SECRET',
  });

  const { amount, name } = req.body;

  const options = {
    amount: amount * 100, // Convert ₹ to paise
    currency: 'INR',
    receipt: `receipt_${Date.now()}`,
  };

  try {
    const order = await razorpayInstance.orders.create(options);
    res.status(200).json({
      order,
      key: razorpayInstance.key_id,
      name,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Order creation failed' });
  }
});

module.exports = payment_route;