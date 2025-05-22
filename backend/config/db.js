const mysql = require('mysql2');
require('dotenv').config();

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('Database connection was closed.');
    }
    if (err.code === 'ER_CON_COUNT_ERROR') {
      console.error('Database has too many connections.');
    }
    if (err.code === 'ECONNREFUSED') {
      console.error('Database connection was refused.');
    }
    // It's important to exit or handle this error appropriately in a real application
    // For now, we'll just log it. In a real app, you might want to throw the error
    // or have a more robust retry mechanism.
    return;
  }
  if (connection) {
    console.log('Successfully connected to the database.');
    connection.release(); // Release the connection back to the pool
  }
  return;
});

// Export the pool promise for executing queries
module.exports = pool.promise();
