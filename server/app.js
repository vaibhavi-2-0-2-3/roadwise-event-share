require("dotenv").config();
console.log('✅ RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID);
console.log('✅ RAZORPAY_SECRET:', process.env.RAZORPAY_SECRET);

const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');

const app = express();
const server = http.createServer(app);

// ✅ Middleware
app.use(cors()); // Allow requests from React frontend (e.g., localhost:5173)
app.use(express.json()); // Parse JSON
app.use(express.urlencoded({ extended: false })); // Parse form data

// ✅ View engine for Razorpay EJS fallback (if needed)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ✅ Static files (optional)
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Routes
const paymentRoute = require('./routes/paymentRoute');
app.use('/api/payment', paymentRoute); // for React (calls like /api/payment/create-order)

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
