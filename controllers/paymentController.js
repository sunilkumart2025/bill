const db = require('../db');
const razorpay = require('../utils/razorpay');
const mailer = require('../utils/mailer');
const crypto = require('crypto');

// Step 1: Create Order with actual cart total
exports.createOrder = async (req, res) => {
  const { total } = req.body;

  const options = {
    amount: total * 100, // Razorpay works in paise
    currency: "INR",
    receipt: `receipt_${Date.now()}`
  };

  try {
    const order = await razorpay.orders.create(options);
    res.send(order);
  } catch (err) {
    res.status(500).send({ error: "Failed to create order", details: err });
  }
};

// Step 2: Verify payment and send bill
exports.verifyPaymentAndEmail = (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, cart, email, total } = req.body;

  // Signature verification
  const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET);
  hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const generatedSignature = hmac.digest("hex");

  if (generatedSignature !== razorpay_signature) {
    return res.status(400).send({ success: false, message: "Invalid payment signature" });
  }

  // Save order
  db.query(
    'INSERT INTO orders SET ?',
    { email, total, payment_id: razorpay_payment_id },
    (err, orderResult) => {
      if (err) return res.status(500).send(err);
      const order_id = orderResult.insertId;

      // Insert order items and update stock
      cart.forEach(item => {
        db.query('INSERT INTO order_items SET ?', {
          order_id,
          product_id: item.id,
          quantity: item.qty
        });

        db.query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.qty, item.id]);
      });

      // Build bill HTML
      const html = `
        <h2>🧾 Your Supermarket Invoice</h2>
        <p><strong>Order ID:</strong> ${order_id}</p>
        <p><strong>Total Paid:</strong> ₹${total}</p>
        <h4>🛒 Items:</h4>
        <ul>
          ${cart.map(item => `<li>${item.name} x ${item.qty}</li>`).join("")}
        </ul>
        <br/>
        <p>Thank you for shopping with us!</p>
        <p>- SuperMarket Team</p>
      `;

      // Send email
      mailer.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "🧾 Your Supermarket Order Receipt",
        html
      }, (err, info) => {
        if (err) return res.status(500).send({ success: false, message: "Email failed", error: err });
        res.send({ success: true, message: "Order successful and email sent" });
      });
    }
  );
};
