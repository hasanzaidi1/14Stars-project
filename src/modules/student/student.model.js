const pool = require('../../config/dbConfig');

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

    // Update an existing student
    static async updateStudent(studentId, updates) {
        const columnMap = {
            fname: 'F_Name',
            MI: 'MI',
            lname: 'L_Name',
            dob: 'dob',
            st_address: 'st_address',
            city: 'city',
            state: 'state',
            zip: 'zip',
            st_email: 'st_email',
            st_cell: 'st_cell',
            student_location: 'student_location',
            st_gender: 'st_gender',
            gender: 'st_gender'
        };

        const fields = [];
        const values = [];

        for (const [key, column] of Object.entries(columnMap)) {
            if (updates[key] !== undefined) {
                fields.push(`${column} = ?`);
                values.push(updates[key]);
            }
        }

        if (!fields.length) {
            return { affectedRows: 0 };
        }

        const query = `UPDATE student SET ${fields.join(', ')} WHERE St_ID = ?`;
        const [result] = await pool.execute(query, [...values, studentId]);
        return result;
    }

    // Delete a student
    static async deleteStudent(studentId) {
        const query = 'DELETE FROM student WHERE St_ID = ?';
        const [result] = await pool.execute(query, [studentId]);
        return result;
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

    // Get all students full name
    static async getAllFullName() {
        const query = 'SELECT St_ID, CONCAT(F_Name, " ", MI, " ", L_Name) AS full_name FROM student';
        const [rows] = await pool.execute(query);
        return rows;
    }
}

module.exports = Student;
