const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// GET all products
router.get('/', productController.getAllProducts);

// ADD product (Admin)
router.post('/add', productController.addProduct);

// EDIT product
router.post('/edit/:id', productController.editProduct);

// DELETE product
router.get('/delete/:id', productController.deleteProduct);

module.exports = router;
