const pool = require('../../config/dbConfig');

class Term {
    // Create a new term in the database
    static async create(termData) {
        const query = `
            INSERT INTO term 
            (term_name, school_year) 
            VALUES (?, ?)`;
        const values = [
            termData.term_name, 
            termData.school_year, 
        ];
        const [result] = await pool.query(query, values);
        return result;
    }

    // Fetch single term by ID
    static async findById(termId) {
        const query = 'SELECT * FROM term WHERE term_id = ?';
        const [rows] = await pool.query(query, [termId]);
        return rows.length ? rows[0] : null;
    }

    // Fetch all terms with all their details
    static async findAll() {
        const query = `
            SELECT 
                term_id,
                term_name, 
                school_year
            FROM term`;
        const [rows] = await pool.query(query);
        return rows;
    }

    // Update a term
    static async update(termId, termData) {
        const query = 'UPDATE term SET term_name = ?, school_year = ? WHERE term_id = ?';
        const values = [termData.term_name, termData.school_year, termId];
        const [result] = await pool.query(query, values);
        return result;
    }

    // Delete a term
    static async delete(termId) {
        const query = 'DELETE FROM term WHERE term_id = ?';
        const [result] = await pool.query(query, [termId]);
        return result;
    }
}

module.exports = Term; // Export the Term class
