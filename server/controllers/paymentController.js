const Razorpay = require('razorpay');

exports.createOrder = async (req, res) => {
  // Validate Razorpay credentials
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_SECRET;
  

  if (!key_id || !key_secret) {
    console.error("❌ Razorpay credentials are missing in environment variables.");
    return res.status(500).json({ error: 'Razorpay credentials not configured properly' });
  }

  const razorpayInstance = new Razorpay({
   key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
  });

  const { amount, name } = req.body;

  if (!amount || typeof amount !== 'number') {
    return res.status(400).json({ error: 'Invalid amount provided' });
  }

  const options = {
    amount: amount * 100, // ₹ → paise
    currency: 'INR',
    receipt: `receipt_${Date.now()}`,
  };

  try {
    const order = await razorpayInstance.orders.create(options);

    res.status(200).json({
      order,
      key: key_id,
      // name: name || 'Passenger',
    });
  } catch (error) {
    console.error('❌ Error creating Razorpay order:', error);
    res.status(500).json({ error: 'Order creation failed' });
  }
};
