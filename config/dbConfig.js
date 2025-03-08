const mysql = require('mysql2/promise'); // Import promise-based mysql2
require('dotenv').config();

// Create a pool for database connections
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});


// Test database connection and query
(async () => {
    try {
        const [rows, fields] = await pool.query('SELECT 1');  // Test query to ensure connection works
        console.log('Connected to the database:', rows);  // Log the query result
    } catch (err) {
        console.error('Error connecting to the database:', err.message);  // Handle errors
    }
})();

module.exports = { pool };
