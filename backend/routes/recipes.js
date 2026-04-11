const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

// Add this GET route to handle the recipe feed retrieval
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM recipes ORDER BY creation_date DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Fetch Failed" });
  }
});

// Keep your existing POST logic below it
router.post('/', authenticateToken, async (req, res) => {
  const { title, ttc, ingredients, steps } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const recipeResult = await client.query(
      'INSERT INTO recipes (title, ttc) VALUES ($1, $2) RETURNING id',
      [title, ttc]
    );
    const recipeId = recipeResult.rows[0].id;

    if (ingredients) {
      for (const item of ingredients) {
        const ingResult = await client.query(
          'INSERT INTO ingredients (recipe_id, name) VALUES ($1, $2) RETURNING id',
          [recipeId, item.name]
        );
        await client.query(
          'INSERT INTO amount (ingredient_id, name) VALUES ($1, $2)',
          [ingResult.rows[0].id, item.amount]
        );
      }
    }

    if (steps) {
      for (const stepText of steps) {
        await client.query(
          'INSERT INTO steps (recipe_id, instruction) VALUES ($1, $2)',
          [recipeId, stepText]
        );
      }
    }

    await client.query('COMMIT');
    res.status(201).json({ recipeId });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: "Process Failed" });
  } finally {
    client.release();
  }
});

module.exports = router;