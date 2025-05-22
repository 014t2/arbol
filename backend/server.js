const express = require('express');
const cors = require('cors');
require('dotenv').config(); // To load environment variables from .env file

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // To parse JSON request bodies

// Basic GET route
app.get('/', (req, res) => {
  res.json({ message: "Welcome to the Family Tree API" });
});

// Import Auth Routes
const authRoutes = require('./routes/authRoutes');

// Mount Auth Routes
app.use('/api/auth', authRoutes);

// Import Member Routes
const memberRoutes = require('./routes/memberRoutes');

// Mount Member Routes
app.use('/api/members', memberRoutes);

// Define port
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; // Export app for potential testing
