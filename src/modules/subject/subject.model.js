const pool = require('../../config/dbConfig');

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

const updateSubject = async (subjectId, subject) => {
    try {
        const query = 'UPDATE subject SET subject = ? WHERE subject_id = ?';
        const [result] = await pool.query(query, [subject, subjectId]);
        return result;
    } catch (error) {
        console.error('Database error while updating subject:', error);
        throw error;
    }
};

const deleteSubject = async (subjectId) => {
    try {
        const query = 'DELETE FROM subject WHERE subject_id = ?';
        const [result] = await pool.query(query, [subjectId]);
        return result;
    } catch (error) {
        console.error('Database error while deleting subject:', error);
        throw error;
    }
};

/**
 * Get the name of a subject by its ID.
 * @param {number} subjectId - The ID of the subject.
 * @returns {Promise<string>} Resolves to the subject name.
 */
const getSubjectName = async (subjectId) => {   
    try {
        const query = 'SELECT subject FROM subject WHERE subject_id = ?';
        const [rows] = await pool.query(query, [subjectId]);
        return rows[0] ? rows[0].subject : null; // Return null if not found
    } catch (error) {
        console.error('Database error while fetching subject name:', error);
        throw error; // Re-throw to let the controller handle it
    }
}

module.exports = {
    getAllSubjects,
    addSubject,
    getSubjectName,
    updateSubject,
    deleteSubject
};
