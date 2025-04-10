const pool = require('../config/dbConfig');

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
    },

    async getStudByName(firstName, lastName) {
        try {
            if (!firstName && !lastName) {
                return { success: false, error: "First name or last name must be provided" };
            }
    
            const query = `SELECT * FROM student WHERE F_Name LIKE ? OR L_Name LIKE ?`;
            const values = [`%${firstName || ''}%`, `%${lastName || ''}%`];

            console.log("Query:", query);
            console.log("Values:", values);

            const [students] = await pool.query(query, values);
            return { success: true, students };
        } catch (error) {
            console.error('Database Error:', error);
            return { success: false, error: 'Internal Server Error' };
        }
    },

    // Assign a guardian to a student
    async assignGuardian(st_id, g_id, relationship_type) {
        try {
            const [result] = await pool.query(
                `INSERT INTO student_guardian (st_id, g_id, relationship_type) VALUES (?, ?, ?)`,
                [st_id, g_id, relationship_type]
            );
            return result;
        } catch (error) {
            console.error('Database Error:', error);
            throw error;
        }
    },

    // Get all getStudentGuardianData
    async getStudentGuardianData() {
        try {
            const query = `
                SELECT 
                    s.St_ID, 
                    CONCAT(s.F_Name, ' ', s.L_Name) AS student_name,
                    CONCAT(g.g_f_name, ' ', g.g_l_name) AS guardian_name,
                    sg.relationship_type,
                    g.g_cell,
                    g.g_email
                FROM student s
                LEFT JOIN student_guardian sg ON s.St_ID = sg.st_id
                LEFT JOIN guardian g ON sg.g_id = g.g_id
                ORDER BY s.St_ID;
            `;

            const [rows] = await pool.execute(query);
            return rows;
        } catch (error) {
            console.error('Error fetching student-guardian data:', error);
            throw error;
        }
    }
    
    // // Register Parent/Guardian
    // async registerParent(guardianData) {
    //     try {
    //         const {
    //             g_f_name,
    //             g_mi,
    //             g_l_name,
    //             g_cell,
    //             g_email,
    //             g_staddress,
    //             g_city,
    //             g_state,
    //             g_zip,
    //             gender
    //         } = guardianData;
    
    //         const query = `
    //             INSERT INTO guardian 
    //             (g_f_name, g_mi, g_l_name, g_cell, g_email, g_staddress, g_city, g_state, g_zip, gender) 
    //             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    //         `;
    
    //         const values = [
    //             g_f_name,
    //             g_mi,
    //             g_l_name,
    //             g_cell,
    //             g_email,
    //             g_staddress,
    //             g_city,
    //             g_state,
    //             g_zip,
    //             gender
    //         ];
    
    //         const [result] = await pool.execute(query, values);
    //         return result;
    //     } catch (err) {
    //         console.error("Error registering guardian:", err);
    //         throw err;
    //     }
    // },
    
};

module.exports = AdminModel;
