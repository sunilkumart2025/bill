const express = require('express');
const router = express.Router();

// This is just a placeholder if you want to expand
router.get('/', (req, res) => {
  res.send({ message: 'Cart API working' });
});

module.exports = router;
