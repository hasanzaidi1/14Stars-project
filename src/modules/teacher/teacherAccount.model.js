const pool = require('../../config/dbConfig');

class TeacherAccount {
    static async create(accountData) {
        const query = `
            INSERT INTO teacher_accounts
            (first_name, last_name, email, phone, password_hash)
            VALUES (?, ?, ?, ?, ?)
        `;
        const values = [
            accountData.first_name,
            accountData.last_name,
            accountData.email,
            accountData.phone,
            accountData.password_hash
        ];
        const [result] = await pool.execute(query, values);
        return result;
    }

    static async findByEmail(email) {
        const query = `SELECT * FROM teacher_accounts WHERE email = ?`;
        const [rows] = await pool.execute(query, [email]);
        return rows[0];
    }

    static async updatePassword(email, password_hash) {
        const query = `UPDATE teacher_accounts SET password_hash = ? WHERE email = ?`;
        const [result] = await pool.execute(query, [password_hash, email]);
        return result.affectedRows > 0;
    }
}

module.exports = TeacherAccount;
