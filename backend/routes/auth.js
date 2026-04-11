const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db'); 

router.post('/signup', async (req, res) => {
  const { first_name, surname, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await pool.query(
      'INSERT INTO users (first_name, surname, email, password_hash) VALUES ($1, $2, $3, $4) RETURNING id',
      [first_name, surname, email, hashedPassword]
    );
    res.json(newUser.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) return res.status(401).json({ error: "Credentials bad" });

    const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
    if (!validPassword) return res.status(401).json({ error: "Credentials bad" });

    const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '30m' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
});

module.exports = router;