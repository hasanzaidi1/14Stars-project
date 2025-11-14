const pool = require('../../config/dbConfig');

class Teacher {
    // Create a new teacher in the database
    static async create(teacherData) {
        const query = `
            INSERT INTO teachers 
            (t_f_name, t_mi, t_l_name, t_email, t_phone, gender, t_staddress, t_city, t_state, t_zip) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const values = [
            teacherData.t_f_name, 
            teacherData.t_mi, 
            teacherData.t_l_name, 
            teacherData.t_email, 
            teacherData.t_phone, 
            teacherData.gender, 
            teacherData.t_staddress, 
            teacherData.t_city, 
            teacherData.t_state, 
            teacherData.t_zip,
        ];
        const [result] = await pool.query(query, values);
        return result;
    }

    // Fetch all teachers with all their details
    static async findAll() {
        const query = `
            SELECT 
                t_id,
                t_f_name, 
                t_mi, 
                t_l_name, 
                t_email, 
                t_phone, 
                gender, 
                t_staddress, 
                t_city, 
                t_state, 
                t_zip
            FROM teachers`;
        const [rows] = await pool.query(query);
        let full_name = rows.map(row => row.t_f_name + " " + row.t_l_name);
        rows.forEach((row, index) => {
            row.full_name = full_name[index];
        });
        return rows;
    }

    // Fetch a single teacher by email (for login or search purposes)
    static async findByEmail(t_email) {
        const query = `SELECT * FROM teachers WHERE t_email = ?`;
        const [rows] = await pool.query(query, [t_email]);
        return rows[0];
    }

    // Delete a teacher by their ID
    static async deleteById(t_id) {
        const query = `DELETE FROM teachers WHERE t_id = ?`;
        const [result] = await pool.query(query, [t_id]);
        return result.affectedRows > 0;
    }

    // Update teacher details (e.g., phone or address) by their ID
    static async updateById(t_id, updates) {
        const fields = Object.keys(updates).map(field => `${field} = ?`).join(', ');
        const values = Object.values(updates);
        const query = `UPDATE teachers SET ${fields} WHERE t_id = ?`;
        const [result] = await pool.query(query, [...values, t_id]);
        return result.affectedRows > 0;
    }
}

module.exports = Teacher;
