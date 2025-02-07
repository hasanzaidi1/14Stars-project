const pool = require('../config/dbConfig');

class Student {
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
        const query = 'SELECT * FROM student WHERE (F_Name = ? AND L_Name = ? AND dob = ?)';
        const [rows] = await pool.execute(query, [fname, lname, DOB]);
        return rows;
    }
}

module.exports = Student;