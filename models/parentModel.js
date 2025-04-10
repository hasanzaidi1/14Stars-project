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
    static async registerGuardian(guardianData) {
        try {
            const {
                g_f_name,
                g_mi,
                g_l_name,
                g_cell,
                g_email,
                g_staddress,
                g_city,
                g_state,
                g_zip,
                gender
            } = guardianData;
    
            const query = `
                INSERT INTO guardian 
                (g_f_name, g_mi, g_l_name, g_cell, g_email, g_staddress, g_city, g_state, g_zip, gender) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
    
            const values = [
                g_f_name,
                g_mi,
                g_l_name,
                g_cell,
                g_email,
                g_staddress,
                g_city,
                g_state,
                g_zip,
                gender
            ];
    
            const [result] = await pool.execute(query, values);
            return { success: true, message: 'Guardian registered successfully!' };
        } catch (err) {
            console.error("Error registering guardian:", err);
            throw err;
        }
    } 

    // **Get All Guardians**
    static async getAllGuardians() {
        try {
            const query = 'SELECT * FROM guardian';
            const [rows] = await pool.query(query);
            return rows;
        } catch (error) {
            console.error('Error fetching guardians:', error);
            throw error;
        }
    }

    // **Get full names of all guardians**
    static async getGuardianNames() {
        try {
            const query = 'SELECT g_id, CONCAT(g_f_name, " ",g_l_name) AS full_name FROM guardian';
            const [rows] = await pool.query(query);
            return rows;
        } catch (error) {
            console.error('Error fetching guardian names:', error);
            throw error;
        }
    }
}

module.exports = ParentModel;
