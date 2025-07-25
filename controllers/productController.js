const db = require('../db');

exports.getAllProducts = (req, res) => {
  db.query('SELECT * FROM products', (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
};

exports.addProduct = (req, res) => {
  const { name, price, stock } = req.body;
  db.query('INSERT INTO products SET ?', { name, price, stock }, (err) => {
    if (err) return res.status(500).send(err);
    res.redirect('/admin.html');
  });
};

exports.editProduct = (req, res) => {
  const { name, price, stock } = req.body;
  db.query('UPDATE products SET ? WHERE id = ?', [{ name, price, stock }, req.params.id], (err) => {
    if (err) return res.status(500).send(err);
    res.redirect('/admin.html');
  });
};

exports.deleteProduct = (req, res) => {
  db.query('DELETE FROM products WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).send(err);
    res.redirect('/admin.html');
  });
};
