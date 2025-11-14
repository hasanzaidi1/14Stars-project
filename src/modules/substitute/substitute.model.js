const pool = require('../../config/dbConfig');

const Substitute = {
    async findByEmail(email) {
        const [rows] = await pool.query('SELECT * FROM substitute WHERE sub_email = ?', [email]);
        return rows;
    },

    async create(sub_f_name, sub_l_name, sub_email, sub_phone) {
        const [result] = await pool.query(
            'INSERT INTO substitute (sub_f_name, sub_l_name, sub_email, sub_phone) VALUES (?, ?, ?, ?)',
            [sub_f_name, sub_l_name, sub_email, sub_phone]
        );
        return result.insertId;
    },

    async findById(id) {
        const [rows] = await pool.query('SELECT * FROM substitute WHERE substitute_id = ?', [id]);
        return rows;
    },

    async fetchAll() {
        const [rows] = await pool.query('SELECT substitute_id, sub_f_name, sub_l_name, sub_email, sub_phone FROM substitute');
        return rows;
    },

    async update(substituteId, updates) {
        const columnMap = {
            sub_f_name: 'sub_f_name',
            sub_l_name: 'sub_l_name',
            sub_email: 'sub_email',
            sub_phone: 'sub_phone'
        };

        const fields = [];
        const values = [];

        for (const [key, column] of Object.entries(columnMap)) {
            if (updates[key] !== undefined) {
                fields.push(`${column} = ?`);
                values.push(updates[key]);
            }
        }

        if (!fields.length) {
            return { affectedRows: 0 };
        }

        const query = `UPDATE substitute SET ${fields.join(', ')} WHERE substitute_id = ?`;
        const [result] = await pool.query(query, [...values, substituteId]);
        return result;
    },

    async delete(substituteId) {
        const [result] = await pool.query('DELETE FROM substitute WHERE substitute_id = ?', [substituteId]);
        return result;
    }
};

module.exports = Substitute;
