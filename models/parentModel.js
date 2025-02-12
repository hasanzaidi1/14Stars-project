const pool = require('../config/dbConfig');

class ParentModel {
    // **Create a New Parent in the Database**
    static async createParent(f_name, l_name, email, password) {
        const query = `INSERT INTO parent_account (f_name, l_name, email, password) VALUES (?, ?, ?, ?)`;
        const values = [f_name, l_name, email, password];

        try {
            const [result] = await pool.execute(query, values);
            return result;
        } catch (error) {
            console.error('Error inserting parent:', error);
            throw new Error('Error inserting parent into the database');
        }
    }

    // **Register Parent as Guardian**
    static async registerGuardian(f_name, l_name, phone_num, email, address, city, state, zip) {
        const query = `INSERT INTO guardian (g_f_name, g_l_name, g_cell, g_email, g_staddress, g_city, g_state, g_zip) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        const values = [f_name, l_name, phone_num, email, address, city, state, zip];

        try {
            const [result] = await pool.execute(query, values);
            return result;
        } catch (error) {
            console.error('Error inserting guardian:', error);
            throw new Error('Error inserting guardian into the database');
        }
    }

    // **Find a Parent by Email**
    static async findByEmail(email) {
        const query = 'SELECT * FROM parent_account WHERE email = ?';
        const [rows] = await pool.execute(query, [email]);
        return rows.length ? rows[0] : null;
    }

    // **Find a Parent for Login**
    static async findParent(email) {
        return await this.findByEmail(email);
    }

    // **Find Guardian (Parent)**
    static async findGuardian(f_name, l_name, phone_num, email) {
        const query = 'SELECT * FROM guardian WHERE g_f_name = ? AND g_l_name = ? AND g_cell = ? AND g_email = ?';
        const [rows] = await pool.execute(query, [f_name, l_name, phone_num, email]);
        return rows.length ? rows[0] : null;
    }
}

module.exports = ParentModel;
