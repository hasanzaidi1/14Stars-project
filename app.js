const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mysql = require('mysql2/promise');
const app = express();
const path = require('path');
const cors = require('cors');

app.use(cors());
require('dotenv').config();

// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieParser());
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
pool.getConnection()
    .then(connection => {
        console.log('Connected to the database');
        connection.release();
    })
    .catch(err => {
        console.error('Error connecting to the database:', err.message);
    });

// Admin credentials
const adminUser = {
    username: process.env.user,
    password: process.env.pass
};

// Teacher credentials
const teacherUser = {
    username: process.env.user,
    password: process.env.pass
};

// Teacher Routes
app.post('/teacher-login', (req, res) => {
    const { username, password } = req.body;
    if (username === teacherUser.username && password === teacherUser.password) {
        req.session.isLoggedIn = true;
        return res.redirect('/teachers/teacher_portal.html');
    }
    return res.status(401).send('Invalid credentials');
});

app.get('/teacher_portal.html', (req, res) => {
    if (req.session.isLoggedIn) {
        res.sendFile(path.join(__dirname, 'public', 'teacher.html'));
    } else {
        res.redirect('/teacher-login');
    }
});

app.get('/fetch-teachers', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                CONCAT_WS(' ', t_f_name, t_mi, t_l_name) AS full_name,
                t_email, 
                t_phone 
            FROM teachers
        `);
        res.json({ teachers: rows });
    } catch (error) {
        console.error('Error fetching teachers:', error);
        res.status(500).json({ message: 'Error fetching teachers' });
    }
});

// Substitute Teachers Routes
app.post('/register-substitute', async (req, res) => {
    const { sub_f_name, sub_l_name, sub_email, sub_phone } = req.body;
    try {
        const [existing] = await pool.query('SELECT * FROM substitute WHERE sub_email = ?', [sub_email]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Substitute already exists' });
        }
        const [result] = await pool.query(
            'INSERT INTO substitute (sub_f_name, sub_l_name, sub_email, sub_phone) VALUES (?, ?, ?, ?)',
            [sub_f_name, sub_l_name, sub_email, sub_phone]
        );
        const [newSub] = await pool.query('SELECT * FROM substitute WHERE substitute_id = ?', [result.insertId]);
        res.status(201).json({ substitute: newSub });
    } catch (error) {
        console.error('Error registering substitute:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Fetch all substitute requests
app.get('/fetch-substitute-requests', async (req, res) => {
    try {
        const [requests] = await pool.query('SELECT * FROM substitute_requests');
        res.json({ substituteRequests: requests });
    } catch (error) {
        console.error('Error fetching substitute requests:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update the 'Satisfied By' field for a substitute request
app.post('/update-satisfied-by', async (req, res) => {
    const { teacher_email, satisfied_by,  date} = req.body;
    console.log('Updating satisfied by:', { teacher_email, satisfied_by, date });
    try {
        await pool.query('UPDATE substitute_requests SET satisfied_by = ? WHERE teacher_email = ?;', [satisfied_by, teacher_email, date]);   //Add date to WHERE clause
        res.status(200).send('Successfully updated');
    } catch (error) {
        console.error('Error updating satisfied by:', error);
        res.status(500).send('Internal server error');
    }
});

// Parent Routes
app.post('/register-parent', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
            'INSERT INTO parent_account (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        );
        res.redirect('parents/parents_login.html');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/parent-login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [rows] = await pool.query(
            'SELECT * FROM parent_account WHERE username = ? OR email = ?',
            [username, username]
        );
        const user = rows[0];
        if (user && await bcrypt.compare(password, user.password)) {
            res.redirect("parents/parents_portal.html");
        } else {
            res.status(401).send('Invalid credentials');
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/register-from-parent', async (req, res) => {
    const {
        fname, MI, lname, DOB, st_address, city, state, zip,
        st_email, st_cell, student_location, gender, relation,
        'parent-first-name': parentFirstName,
        'parent-last-name': parentLastName,
        parent_st_address, parent_city, parent_state, parent_zip,
        parent_cell, parent_email
    } = req.body;

    if (!fname || !parentFirstName || !parentLastName || !st_email) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Start transaction
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // Insert student
            const [studentResult] = await connection.query(
                `INSERT INTO student (F_Name, MI, L_Name, dob, st_address, city, 
                    state, zip, st_email, st_cell, st_gender, student_location)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [fname, MI, lname, DOB, st_address, city, state, zip,
                    st_email, st_cell, gender, student_location]
            );

            // Check if guardian exists
            const [existingGuardian] = await connection.query(
                `SELECT g_id FROM guardian 
                WHERE g_f_name = ? AND g_l_name = ? AND g_cell = ? AND g_email = ?`,
                [parentFirstName, parentLastName, parent_cell, parent_email]
            );

            let guardianId;
            if (existingGuardian.length > 0) {
                guardianId = existingGuardian[0].g_id;
            } else {
                // Insert new guardian
                const [guardianResult] = await connection.query(
                    `INSERT INTO guardian (g_f_name, g_mi, g_l_name, g_cell, g_email, 
                        g_staddress, g_city, g_state, g_zip)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [parentFirstName, '', parentLastName, parent_cell, parent_email,
                        parent_st_address, parent_city, parent_state, parent_zip]
                );
                guardianId = guardianResult.insertId;
            }

            // Insert student-guardian relationship
            await connection.query(
                `INSERT INTO student_guardian (st_id, g_id, relationship_type)
                VALUES (?, ?, ?)`,
                [studentResult.insertId, guardianId, relation]
            );

            await connection.commit();
            res.status(201).json({ message: 'Registration successful' });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Student lookup by parent email
app.post('/students-by-parent', async (req, res) => {
    const { parent_email } = req.body;
    if (!parent_email) {
        return res.status(400).json({ error: 'Parent email required' });
    }

    try {
        const [rows] = await pool.query(`
            SELECT 
                s.St_ID, s.F_Name, s.L_Name, s.st_email, s.st_cell, 
                s.st_gender, s.student_location,
                DATE_FORMAT(s.DOB, '%Y-%m-%d') AS DOB
            FROM student s
            JOIN student_guardian sg ON s.St_ID = sg.st_id
            JOIN guardian g ON g.g_id = sg.g_id
            WHERE LOWER(g.g_email) = LOWER(?)
        `, [parent_email]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'No students found' });
        }
        res.json(rows);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to fetch students' });
    }
});

// Admin Routes
function isAuthenticated(req, res, next) {
    if (req.session.isAdmin || req.cookies.username) {
        return next();
    }
    return next();
}

app.post('/login', (req, res) => {
    const { username, password, remember } = req.body;
    if (username === adminUser.username && password === adminUser.password) {
        req.session.isAdmin = true;
        if (remember) {
            res.cookie('username', username, { maxAge: 30 * 24 * 60 * 60 * 1000 });
        }
        res.redirect('/admin/admin.html');
    } else {
        res.send('Invalid credentials');
    }
});

// Student registration (admin)
app.post('/register', isAuthenticated, async (req, res) => {
    const {
        fname, MI, lname, DOB, st_address, city, state, zip,
        st_email, st_cell, student_location, gender
    } = req.body;

    try {
        const [result] = await pool.query(
            `INSERT INTO student (F_Name, MI, L_Name, dob, st_address, city,
                state, zip, st_email, st_cell, student_location, st_gender)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [fname, MI, lname, DOB, st_address, city, state, zip,
                st_email, st_cell, student_location, gender]
        );
        res.json({ message: 'Student registered successfully!' });
    } catch (error) {
        console.error('Error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ error: 'Student already exists' });
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
});

// Find student
app.post('/find-student', isAuthenticated, async (req, res) => {
    const { 'find-fname': firstName, 'find-lname': lastName } = req.body;
    try {
        const [rows] = await pool.query(
            `SELECT * FROM student
            WHERE F_Name LIKE ? OR L_Name LIKE ?`,
            [`%${firstName}%`, `%${lastName}%`]
        );
        res.json({
            message: rows.length > 0 ? 'Students found' : 'No students found',
            students: rows
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get all students
app.get('/all-students', isAuthenticated, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM student');
        res.json(rows);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Guardian registration
app.post('/register-guardian', async (req, res) => {
    const {
        g_f_name, g_mi, g_l_name, g_cell, g_email,
        g_staddress, g_city, g_state, g_zip, gender
    } = req.body;

    try {
        const [result] = await pool.query(
            `INSERT INTO guardian 
            (g_f_name, g_mi, g_l_name, g_cell, g_email, g_staddress, g_city, g_state, g_zip, gender)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [g_f_name, g_mi, g_l_name, g_cell, g_email,
                g_staddress, g_city, g_state, g_zip, gender]
        );
        res.send('Guardian registered successfully!');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error registering guardian');
    }
});

// Get all guardians
app.get('/all-guardians', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM guardian');
        res.json(rows);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error retrieving guardians');
    }
});

// Get student names
app.get('/getStudentNames', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT St_ID, CONCAT(F_Name, " ", L_Name) AS full_name FROM student'
        );
        res.json(rows);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error fetching student names');
    }
});

// Get guardian names
app.get('/getGuardianNames', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT g_id, CONCAT(g_f_name, " ", g_l_name) AS full_name FROM guardian'
        );
        res.json(rows);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error fetching guardian names');
    }
});

// Assign

// Assign a guardian to a student
app.post('/assignGuardian', async (req, res) => {
    const { st_id, g_id, relationship_type } = req.body;

    try {
        await pool.query(
            'INSERT INTO student_guardian (st_id, g_id, relationship_type) VALUES (?, ?, ?)',
            [st_id, g_id, relationship_type]
        );
        res.status(200).send('Guardian assigned successfully');
    } catch (err) {
        console.error('Error assigning guardian:', err);
        res.status(500).send('Error assigning guardian');
    }
});


// Fetch student-guardian data
app.get('/getStudentGuardianData', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                CONCAT(s.F_Name, ' ', s.MI, ' ', s.L_Name) AS student_name,
                CONCAT(g.g_f_name, ' ', g.g_mi, ' ', g.g_l_name) AS guardian_name,
                sg.relationship_type,
                g.g_cell,
                g.g_email
            FROM 
                student AS s
            JOIN 
                student_guardian AS sg ON s.St_ID = sg.st_id
            JOIN 
                guardian AS g ON sg.g_id = g.g_id;
        `);
        
        console.log(rows);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching student-guardian data:', error);
        res.status(500).send('Server Error');
    }
});

// ------   Subjects  -------

// Route to get all subjects
app.get('/api/subjects', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM subject');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching subjects:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route to add a new subject
app.post('/api/subjects', async (req, res) => {
    const { subject } = req.body;
    if (!subject) {
        return res.status(400).json({ error: 'Subject field is required' });
    }

    try {
        const query = 'INSERT INTO subject (subject) VALUES (?)';
        await pool.query(query, [subject]);
        res.status(201).json({ message: 'Subject added successfully!' });
    } catch (error) {
        console.error('Error adding subject:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Fetch students
app.get('/getStudentNames', async (req, res) => {
    try {
        const students = await pool.query('SELECT St_ID, CONCAT(F_Name, " ", L_Name) AS full_name FROM student');
        res.json(students.rows);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).send('Server Error');
    }
});

// Fetch levels
app.get('/getLevels', async (req, res) => {
    console.log('Fetching levels...');
    try {
        const [rows] = await pool.query('SELECT level_id, level_number FROM level');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching levels:', error);
        res.status(500).send('Server Error');
    }
});

// Get full name by student ID
async function getFullNameByStudentId(studentId) {
    const query = 'SELECT CONCAT(F_Name, " ", L_Name) AS full_name FROM student WHERE St_ID = ?';
    const [rows] = await pool.query(query, [studentId]);
    return rows[0] ? rows[0].full_name : '';
}

// Route to assign level to a student
app.post('/assignLevel', async (req, res) => {
    const { studentId, levelId, subjectId } = req.body;
    console.log('Assigning level:', { studentId, levelId, subjectId });

    try {
        // Fetch full name of student based on studentId
        const fullName = await getFullNameByStudentId(studentId);
        console.log('Full name fetched:', fullName);

        // Fetch subject name based on subjectId
        const [subjectRows] = await pool.query('SELECT subject FROM subject WHERE subject_id = ?', [subjectId]);
        const subjectName = subjectRows[0] ? subjectRows[0].subject : null;

        if (!subjectName) {
            return res.status(400).send('Invalid subject ID');
        }

        // Insert into student_level table
        const insertQuery = 'INSERT INTO student_level (st_id, level_id, full_name, subject) VALUES (?, ?, ?, ?)';
        const [result] = await pool.query(insertQuery, [studentId, levelId, fullName, subjectName]);
        
        res.status(201).json(result);
    } catch (error) {
        console.error('Error inserting into student_level:', error);
        res.status(500).send('Error assigning level');
    }
});

// Get assigned levels
app.get('/getAssignedLevels', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT student.st_id, level.level_number, full_name, subject FROM student_level JOIN level ON student_level.level_id = level.level_id JOIN student ON student_level.st_id = student.St_ID');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching assigned levels:', error);
        res.status(500).send('Server Error');
    }
});

// Register a new teacher
app.post('/register-teacher', async (req, res) => {
    const { t_f_name, t_mi, t_l_name, t_email, t_phone, gender, t_staddress, t_city, t_state, t_zip } = req.body;
    console.log('Received teacher registration data:', req.body);

    if (!t_f_name || !t_l_name || !t_email) {
        return res.status(400).json({ success: false, message: 'Please fill out all required fields.' });
    }

    const query = `
        INSERT INTO teachers (t_f_name, t_mi, t_l_name, t_email, t_phone, gender, t_staddress, t_city, t_state, t_zip) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [t_f_name, t_mi, t_l_name, t_email, t_phone, gender, t_staddress, t_city, t_state, t_zip];

    try {
        const [result] = await pool.query(query, values);
        console.log('New teacher registered:', result);
        return res.json({ success: true, teacher: result });
    } catch (error) {
        console.error('Error executing query:', error);
        return res.status(500).json({ success: false, message: 'Error registering teacher.' });
    }
});


// Fetch all teachers
app.get('/all-teachers', async (req, res) => {
    const query = 'SELECT * FROM teachers';
    
    try {
        const [rows] = await pool.query(query);
        res.json({ teachers: rows });
    } catch (error) {
        console.error('Error fetching teachers:', error);
        res.status(500).json({ message: 'Error fetching teachers' });
    }
});

// +++++++ Substitute Teachers +++++++

// Substitute Request Routes
app.post('/submit-substitute-request', async (req, res) => {
    const { teacher_name, teacher_email, reason, date } = req.body;
    
    if (!teacher_name || !teacher_email || !reason || !date) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        const [existingRequest] = await pool.query(
            'SELECT * FROM substitute_requests WHERE teacher_email = ? AND date = ?',
            [teacher_email, date]
        );

        if (existingRequest.length > 0) {
            return res.status(400).json({ message: 'A substitute request for this date already exists.' });
        }

        const [result] = await pool.query(
            'INSERT INTO substitute_requests (teacher_name, teacher_email, reason, date) VALUES (?, ?, ?, ?)',
            [teacher_name, teacher_email, reason, date]
        );

        res.status(201).json({ message: 'Substitute request submitted successfully.' });
    } catch (error) {
        console.error('Error submitting substitute request:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.get('/fetch-substitutes', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT sub_f_name, sub_l_name, sub_email, sub_phone FROM substitute');
        res.json({ substitutes: rows });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error fetching substitutes' });
    }
});

// Fetch substitute requests (optional)
app.get('/fetch-substitute-requests', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT teacher_name, teacher_email, reason, date, created_at FROM substitute_requests');
        res.json({ substituteRequests: rows });
    } catch (error) {
        console.error('Error fetching substitute requests:', error);
        res.status(500).json({ message: 'Error fetching substitute requests' });
    }
});


// Logout route teacher
app.get('/teacher-logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.send('Error logging out');
        }
        res.clearCookie('username');  // Clear the username cookie
        res.redirect('/teachers/teachers.html');
    });
});

// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.send('Error logging out');
        }
        res.clearCookie('username');  // Clear the username cookie
        res.redirect('/login');
    });
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});