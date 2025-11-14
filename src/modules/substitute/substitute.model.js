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
        const [rows] = await pool.query('SELECT sub_f_name, sub_l_name, sub_email, sub_phone FROM substitute');
        return rows;
    },
};

module.exports = Substitute;
