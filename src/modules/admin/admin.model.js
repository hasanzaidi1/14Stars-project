const pool = require('../../config/dbConfig');

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
            const [students] = await pool.query(`SELECT * FROM student WHERE St_ID = ?`, [studentId]);
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

            const filters = [];
            const values = [];

            if (firstName) {
                filters.push('s.F_Name LIKE ?');
                values.push(`%${firstName}%`);
            }

            if (lastName) {
                filters.push('s.L_Name LIKE ?');
                values.push(`%${lastName}%`);
            }

            const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

            const query = `
                SELECT 
                    s.St_ID,
                    s.F_Name,
                    s.MI,
                    s.L_Name,
                    s.st_email,
                    s.st_cell,
                    s.student_location,
                    g.g_id,
                    g.g_f_name,
                    g.g_l_name,
                    g.g_cell,
                    g.g_email,
                    sg.relationship_type
                FROM student s
                LEFT JOIN student_guardian sg ON sg.st_id = s.St_ID
                LEFT JOIN guardian g ON g.g_id = sg.g_id
                ${whereClause}
                ORDER BY s.F_Name, s.L_Name, g.g_l_name;
            `;

            const [rows] = await pool.query(query, values);

            const studentMap = new Map();

            rows.forEach((row) => {
                if (!studentMap.has(row.St_ID)) {
                    studentMap.set(row.St_ID, {
                        St_ID: row.St_ID,
                        F_Name: row.F_Name,
                        MI: row.MI,
                        L_Name: row.L_Name,
                        st_email: row.st_email,
                        st_cell: row.st_cell,
                        student_location: row.student_location,
                        guardians: []
                    });
                }

                if (row.g_id) {
                    studentMap.get(row.St_ID).guardians.push({
                        g_id: row.g_id,
                        g_f_name: row.g_f_name,
                        g_l_name: row.g_l_name,
                        g_cell: row.g_cell,
                        g_email: row.g_email,
                        relationship_type: row.relationship_type
                    });
                }
            });

            return { success: true, students: Array.from(studentMap.values()) };
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
                    sg.g_id,
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
    },

    async updateStudentGuardian(studentId, guardianId, updates) {
        const fields = [];
        const values = [];

        if (updates.newGuardianId) {
            fields.push('g_id = ?');
            values.push(updates.newGuardianId);
        }
        if (updates.relationship_type !== undefined) {
            fields.push('relationship_type = ?');
            values.push(updates.relationship_type);
        }

        if (!fields.length) {
            return { affectedRows: 0 };
        }

        const query = `UPDATE student_guardian SET ${fields.join(', ')} WHERE st_id = ? AND g_id = ?`;
        const [result] = await pool.query(query, [...values, studentId, guardianId]);
        return result;
    },

    async deleteStudentGuardian(studentId, guardianId) {
        const query = 'DELETE FROM student_guardian WHERE st_id = ? AND g_id = ?';
        const [result] = await pool.query(query, [studentId, guardianId]);
        return result;
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
