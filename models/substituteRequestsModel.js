const pool = require('../config/dbConfig');

const SubstituteRequest = {
    async findByEmailAndDate(email, date) {
        const [rows] = await pool.query(
            'SELECT * FROM substitute_requests WHERE teacher_email = ? AND date = ?',
            [email, date]
        );
        return rows;
    },

    async create(teacher_name, teacher_email, reason, date) {
        const [result] = await pool.query(
            'INSERT INTO substitute_requests (teacher_name, teacher_email, reason, date) VALUES (?, ?, ?, ?)',
            [teacher_name, teacher_email, reason, date]
        );
        return result;
    },

    async fetchAll() {
        const [rows] = await pool.query(
            'SELECT id, teacher_name, teacher_email, reason, date, created_at, satisfied_by FROM substitute_requests'
        );
        return rows;
    },

    async updateSatisfiedBy(request_id, teacher_email, satisfied_by) {
        await pool.query(
            'UPDATE substitute_requests SET satisfied_by = ? WHERE id = ? AND teacher_email = ?',
            [satisfied_by, request_id, teacher_email]
        );
    },
};

module.exports = SubstituteRequest;
