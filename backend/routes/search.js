const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  const { query } = req.query;
  
  try {
    const results = await pool.query(
      "SELECT * FROM recipes WHERE to_tsvector('english', title) @@ plainto_tsquery('english', $1)",
      [query]
    );
    res.json(results.rows);
  } catch (err) {
    res.status(500).json({ error: "Search Failed" });
  }
});

module.exports = router;