const pool = require('../config/dbConfig');

class Student {
    // Get all students
    static async getAllStudents() {
        const query = 'SELECT * FROM student';
        const [rows] = await pool.execute(query);
        return rows;
    }

    // Create a new student in the database
    static async registerStudent(fname, 
        MI,
        lname,
        DOB,
        st_address,
        city,
        state,
        zip,
        st_email,
        st_cell,
        student_location,
        gender) {

        const query = `INSERT INTO student (F_Name, MI, L_Name, dob, st_address, city, state, zip, st_email, st_cell, st_gender, student_location) VALUES (?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const values = [fname, MI, lname, DOB, st_address, city, state, zip, st_email, st_cell, gender, student_location];
        try {
            const [result] = await pool.execute(query, values);
            return result;
        } catch (error) {
            throw new Error('Error inserting student data into the database');
        }
    }

    // Check if student already exists
    static async doesExist(fname, lname, DOB) {
        const query = `SELECT St_ID FROM student WHERE F_Name = ? AND L_Name = ? AND DOB = ?`;
        const [rows] = await pool.execute(query, [fname, lname, DOB]);
        
        return rows.length > 0; // ✅ Returns true if student exists, false otherwise
    }

    // Find student by ID
    static async findById(id) {
        const query = 'SELECT * FROM student WHERE St_ID = ?';
        const [rows] = await pool.execute(query, [id]);
        return rows.length ? rows[0] : null;
    }

    // Find student by name
    static async findByName(fname, lname) {
        const query = 'SELECT * FROM student WHERE F_Name = ? AND L_Name = ?';
        const [rows] = await pool.execute(query, [fname, lname]);
        return rows.length ? rows[0] : null;
    }

    // Find student by email
    static async findByEmail(email) {
        const query = 'SELECT * FROM student WHERE st_email = ?';
        const [rows] = await pool.execute(query, [email]);
        return rows.length ? rows[0] : null;
    }

    // Find student by parent ID
    static async findByParentId(parentId) {
        const query = `SELECT * FROM student
            WHERE St_ID IN (SELECT st_id FROM student_guardian WHERE g_id = ?)`;
        const [rows] = await pool.execute(query, [parentId]);
        return rows;
    }

    // Find student by parent email
    static async findByParentEmail(email) {
        const query = `SELECT * FROM student
            WHERE St_ID IN (SELECT st_id FROM student_guardian WHERE g_id IN (SELECT g_id FROM guardian WHERE g_email = ?))`;
        const [rows] = await pool.execute(query, [email]);
        return rows;
    }
}

module.exports = Student;