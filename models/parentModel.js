const pool = require('../config/dbConfig');

class Parent {
    // Create a new parent in the database
    static async createParent(f_name, l_name, email, password) {
        const query = `INSERT INTO parent_account (email, password, f_name, l_name) VALUES (?, ?, ?, ?)`;
        const values = [email, password, f_name, l_name];
        
        try {
            const [result] = await pool.execute(query, values);
            return result;
        } catch (error) {
            throw new Error('Error inserting parent into the database');
        }
    }

    // Register Parent
    static async registerParent(f_name, l_name, phone_num, email, t_address, city, state, zip){
        const query = `INSERT INTO guardian (g_f_name, g_l_name, g_cell, g_email, g_staddress, g_city, g_state, g_zip) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        const values = [f_name, l_name, phone_num, email, t_address, city, state, zip];
        
        try {
            const [result] = await pool.execute(query, values);
            return result;
        } catch (error) {
            throw new Error('Error inserting parent into the database');
        }
    }

    // Find a parent by email
    static async findByEmail(email) {
        const query = 'SELECT * FROM parent_account WHERE email = ?';
        const [rows] = await pool.execute(query, [email]);
        return rows[0];
    }

    // Find a parent by email and validate password
    static async findParent(email) {
        const query = 'SELECT * FROM parent_account WHERE (email = ?)';
        const [rows] = await pool.execute(query, [email]);
        return rows[0];
    }
}

module.exports = Parent;
