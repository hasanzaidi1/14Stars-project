const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const cors = require('cors');
const pool = require('./config/dbConfig'); // Import the database connection pool
const helpers = require('./utils/helpers'); // Import helper functions
const teacherRoutes = require('./routes/teacherRoutes');
const adminRoutes = require('./routes/adminRoutes');
const parentRoutes = require('./routes/parentRoutes');
const subRoutes = require('./routes/substituteRoutes');
const substituteRequestRoutes = require('./routes/substituteRequestRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const levelRoutes = require('./routes/levelRoutes');
const studentLevelRoutes = require('./routes/studentLevelRoutes');



const app = express();

// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public_html'));
app.use(cookieParser());
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use('/teachers', teacherRoutes);
app.use('/admins', adminRoutes);
app.use('/parents', parentRoutes);
app.use('/substitute', subRoutes);
app.use('/substitute-requests', substituteRequestRoutes);
app.use('/subjects', subjectRoutes);
app.use('/levels', levelRoutes);
app.use('/student-levels', studentLevelRoutes);


// Admin Routes
function isAuthenticated(req, res, next) {
    if (req.session.isAdmin || req.cookies.username) {
        return next();
    }
    return next();
}

// Student registration (admin)
app.post('/register', isAuthenticated, async (req, res) => {
    const {
        fname, MI, lname, DOB, st_address, city, state, zip,
        st_email, st_cell, student_location, gender
    } = req.body;

    // Validate required fields
    const requiredFields = [
        { name: 'First Name', value: fname },
        { name: 'Last Name', value: lname },
        { name: 'Date of Birth', value: DOB },
        { name: 'Email', value: st_email },
        { name: 'Phone Number', value: st_cell },
        { name: 'Student Location', value: student_location },
    ];

    const validationError = helpers.validateRequiredFields(requiredFields);
    if (validationError) {
        return helpers.sendErrorResponse(res, validationError, 400);
    }

    // Additional validations
    if (!helpers.isValidEmail(st_email)) {
        return helpers.sendErrorResponse(res, 'Invalid email address', 400);
    }
    if (!helpers.isValidPhoneNumber(st_cell)) {
        return helpers.sendErrorResponse(res, 'Invalid phone number format', 400);
    }

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

        if (!rows.length) {
            return res.json([]);
        }

        res.json(rows);
    } catch (error) {
        console.error('Error fetching student-guardian data:', error);
        res.status(500).json({ error: 'Failed to fetch student-guardian data' });
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


// Start the server
const PORT = process.env.PORT || 30000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});