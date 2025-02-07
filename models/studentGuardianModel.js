const pool = require('../config/dbConfig');

class StudentGuardian {
    // Create a new student guardian in the database
    static async createStudentGuardian(guardian_id, student_id, relationship) {
        const query = `INSERT INTO student_guardian (st_id, g_id, relationship_type) VALUES (?, ?, ?)`;
        const values = [student_id, guardian_id, relationship];
        
        try {
            const [result] = await pool.execute(query, values);
            return result;
        } catch (error) {
            throw new Error('Error inserting student guardian data into the database');
        }
    }

    
}
module.exports = StudentGuardian;