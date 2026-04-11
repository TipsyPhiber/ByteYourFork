const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_fallback_key';

// Database Connection Pool
const pool = new Pool();

app.use(cors());
app.use(express.json());

// --- AUTHENTICATION MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
  // Grab the token from the "Authorization" header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer <token>"

  // If there is no token, reject the request
  if (!token) return res.status(401).json({ error: "Access denied. No token provided." });

  // Verify the token using your secret key
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid or expired token." });
    
    // If valid, attach the user info to the request and move on to the route
    req.user = user;
    next();
  });
};

// --- AUTHENTICATION ROUTES ---

// 1. Sign Up Route
app.post('/api/signup', async (req, res) => {
  const { first_name, surname, username, email, password } = req.body;

  try {
    // Check if user already exists (Account Duplication Prevention)
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1 OR username = $2', [email, username]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: "Username or email already taken" });
    }

    // Hash the password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Insert new user into database
    const newUser = await pool.query(
      'INSERT INTO users (first_name, surname, username, email, password_hash) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email',
      [first_name, surname, username, email, password_hash]
    );

    res.status(201).json({ message: "Account created successfully!", user: newUser.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error during signup" });
  }
});

// 2. Login Route
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Compare the provided password with the stored hash
    const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate a JWT session token
    const token = jwt.sign({ user_id: user.rows[0].id }, JWT_SECRET, { expiresIn: '30m' });

    res.json({ message: "Login successful!", token: token });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error during login" });
  }
});

// 3. Protected Profile Route (Requires Token)
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    // req.user.user_id comes from the decoded JWT!
    const userProfile = await pool.query('SELECT id, first_name, username, email FROM users WHERE id = $1', [req.user.user_id]);
    res.json({ message: "You accessed a protected route!", user: userProfile.rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Server error fetching profile" });
  }
});

// --- RECIPE ROUTES ---

// 4. Create a New Recipe (Protected Route)
app.post('/api/recipes', authenticateToken, async (req, res) => {
  // Destructure the required fields based on your database schema
  const { title, ttc } = req.body; 

  if (!title || !ttc) {
    return res.status(400).json({ error: "Title and Time To Cook (ttc) are required." });
  }

  try {
    // Insert the new recipe into the database
    const newRecipe = await pool.query(
      'INSERT INTO recipes (title, ttc) VALUES ($1, $2) RETURNING *',
      [title, ttc]
    );
    res.status(201).json({ message: "Recipe created successfully!", recipe: newRecipe.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error creating recipe" });
  }
});

// 5. Fetch All Recipes (Public Route for the Explore Page)
app.get('/api/recipes', async (req, res) => {
  try {
    // Grab all recipes, ordering them by newest first
    const recipes = await pool.query('SELECT * FROM recipes ORDER BY creation_date DESC');
    res.json(recipes.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error fetching recipes" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
