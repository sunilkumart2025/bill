const express = require('express');
const router = express.Router();

// Dummy admin login for demonstration
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin123') {
    res.send({ success: true });
  } else {
    res.send({ success: false, message: 'Invalid credentials' });
  }
});

module.exports = router;
