const pool = require('../config/dbConfig');

/**
 * Fetch all subjects from the database.
 * @returns {Promise<Array>} Resolves to an array of subjects.
 */
const getAllSubjects = async () => {
    try {
        const [rows] = await pool.query('SELECT * FROM subject');
        return rows;
    } catch (error) {
        console.error('Database error while fetching subjects:', error);
        throw error; // Re-throw to let the controller handle it
    }
};

/**
 * Add a new subject to the database.
 * @param {string} subject - The subject name to be added.
 * @returns {Promise<void>}
 */
const addSubject = async (subject) => {
    try {
        const query = 'INSERT INTO subject (subject) VALUES (?)';
        await pool.query(query, [subject]);
    } catch (error) {
        console.error('Database error while adding subject:', error);
        throw error; // Re-throw to let the controller handle it
    }
};

module.exports = {
    getAllSubjects,
    addSubject,
};
