const pool = require('../config/dbConfig');

class Parent {
    // Create a new parent in the database
    static async createParent(username, email, password) {
        const query = `INSERT INTO parent_account (username, email, password) VALUES (?, ?, ?)`;
        const values = [username, email, password];
        
        try {
            const [result] = await pool.execute(query, values);
            return result;
        } catch (error) {
            throw new Error('Error inserting parent into the database');
        }
    }

    // Find a parent by email
    static async findByEmail(email) {
        const query = 'SELECT * FROM parent_account WHERE email = ? OR username = ?';
        const [rows] = await pool.execute(query, [email, email]);
        return rows[0];
    }

    // Find a parent by username and validate password
    static async findParent(username, password) {
        const query = 'SELECT * FROM parent_account WHERE (email = ? OR username = ?)';
        const [rows] = await pool.execute(query, [username, username]);
        return rows[0];
    }
}

module.exports = Parent;
