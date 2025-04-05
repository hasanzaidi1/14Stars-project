const pool = require('../config/dbConfig');  // Ensure this points to your correct db config

class ParentModel {
    // **Create a New Parent in the Database table: parent_account**
    static async createParent(f_name, l_name, email, password) {
        const query = `INSERT INTO parent_account (f_name, l_name, email, password) VALUES (?, ?, ?, ?)`;
        const values = [f_name, l_name, email, password];

        try {
            const [result] = await pool.query(query, values);  // Correct usage of pool.query for MySQL
            return result; // MySQL returns result in the form of an array
        } catch (error) {
            console.error('Error inserting parent:', error);
            throw new Error('Error inserting parent into the database');
        }
    }

    // **Find Parent by email table: parent_account**
    static async findByEmail(email) {
        const query = 'SELECT * FROM parent_account WHERE email = ?';
        try {
            const [rows] = await pool.query(query, [email]);
            return rows.length ? rows[0] : null; // Return first result or null
        } catch (err) {
            console.error('Error querying the database:', err.message);
            throw err;
        }
    }
        
    // **Find Guardian (Parent) table: guardian**
    static async findGuardian(f_name, l_name, phone_num, email) {
        const query = 'SELECT * FROM guardian WHERE g_f_name = ? AND g_l_name = ? AND g_cell = ? AND g_email = ?';  // Correct MySQL query syntax
        try {
            const [result] = await pool.query(query, [f_name, l_name, phone_num, email]);  // MySQL query with placeholders
            return result.length ? result[0] : null;  // Return the first matching record or null
        } catch (error) {
            console.error('Error finding guardian:', error);
            throw error;
        }
    }

    // **Register a new Guardian in the database table: guardian**
    static async registerGuardian(parentFName, parentLName, parent_cell, parent_email, parent_st_address, parent_city, parent_state, parent_zip) {
        const query = `INSERT INTO guardian (g_f_name, g_l_name, g_cell, g_email, g_staddress, g_city, g_state, g_zip) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        const values = [parentFName, parentLName, parent_cell, parent_email, parent_st_address, parent_city, parent_state, parent_zip];

        try {
            const [result] = await pool.query(query, values);  // Correct usage of pool.query for MySQL
            return result; // MySQL returns result in the form of an array
        } catch (error) {
            console.error('Error inserting guardian:', error);
            throw new Error('Error inserting guardian into the database');
        }

    }
    
}

module.exports = ParentModel;
