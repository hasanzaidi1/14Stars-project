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
}

module.exports = Term; // Export the Term class
