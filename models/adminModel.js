const { pool } = require('../config/dbConfig');
const { helpers } = require('../utils/helpers.js');


console.log('Database Pool Object:', pool);

const AdminModel = {
    
    // Register a new student
    async registerStudent(studentData) {
        const { fname, MI, lname, DOB, st_address, city, state, zip, st_email, st_cell, student_location, gender } = studentData;
        
        try {
            const [result] = await pool.query(
                `INSERT INTO student (F_Name, MI, L_Name, dob, st_address, city,
                    state, zip, st_email, st_cell, student_location, st_gender)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [fname, MI, lname, DOB, st_address, city, state, zip, st_email, st_cell, student_location, gender]
            );
            
            return { success: true, message: 'Student registered successfully!', student_id: result.insertId };
        
        } catch (error) {
            console.error('Database Error:', error);

            if (error.code === 'ER_DUP_ENTRY') {
                return { success: false, error: 'Student already exists' };
            }

            return { success: false, error: 'Internal Server Error', details: error.message };
        }
    },


    // Get student by ID
    async getStudentById(studentId) {
        try {
            const [students] = await pool.query(`SELECT * FROM student WHERE student_id = ?`, [studentId]);
            return students.length ? students[0] : null;
        } catch (error) {
            console.error('Database Error:', error);
            return { success: false, error: 'Internal Server Error' };
        }
    },

    // Get all students
    async getAllStudents() {
        try {
            const [students] = await pool.query(`SELECT * FROM student`);
            return students;
        } catch (error) {
            console.error('Database Error:', error);
            return { success: false, error: 'Internal Server Error' };
        }
    }
};

module.exports = AdminModel;