const jwt = require('jsonwebtoken');
require('dotenv').config(); // Ensures JWT_SECRET is loaded from .env

const protect = (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header (e.g., "Bearer <token>")
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user information to request object
      // Assuming the JWT payload contains the user object directly or user ID.
      // If your JWT payload is, for example, { user: { id: ..., username: ... } },
      // you might do req.user = decoded.user;
      // If your JWT payload is, for example, { id: ..., username: ... },
      // you might do req.user = decoded;
      // For this project, the authController creates a payload like:
      // { user: { id: user.id, username: user.username } }
      // So, we'll use decoded.user
      req.user = decoded.user;

      next(); // Proceed to the next middleware or route handler
    } catch (error) {
      console.error('Token verification failed:', error.message);
      res.status(401).json({ message: 'Not authorized, token failed.' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token provided.' });
  }
};

module.exports = { protect };
