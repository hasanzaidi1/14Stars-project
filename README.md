```
14Stars-project/
├── config/                     # Configuration files
│   └── dbConfig.js             # Database configuration
├── controllers/                # Route controllers
│   ├── adminController.js
│   ├── authController.js
│   ├── parentController.js
│   ├── studentController.js
│   ├── substituteController.js
│   ├── teacherController.js
│   └── subjectController.js
├── middlewares/                # Custom middleware functions
│   └── authMiddleware.js
├── models/                     # Database models
│   ├── adminModel.js
│   ├── parentModel.js
│   ├── studentModel.js
│   ├── substituteModel.js
│   ├── teacherModel.js
│   └── subjectModel.js
├── routes/                     # Express route definitions
│   ├── adminRoutes.js
│   ├── authRoutes.js
│   ├── parentRoutes.js
│   ├── studentRoutes.js
│   ├── substituteRoutes.js
│   ├── teacherRoutes.js
│   └── subjectRoutes.js
├── public/                     # Static files (CSS, JS, HTML)
│   ├── css/
│   ├── js/
│   └── html/
├── tests/                      # Test files (optional)
│   ├── auth.test.js
│   ├── student.test.js
│   └── teacher.test.js
├── utils/                      # Utility functions (optional)
│   └── helpers.js              # Helper functions used across the app
├── .env                        # Environment variables
├── app.js                      # Main application file
└── package.json                # Project metadata and dependencies
```

1. config/dbConfig.js

```javascript
// dbConfig.js

const mysql = require('mysql2');

// Load environment variables from .env file (if using dotenv)
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mydatabase',
};

// Create a connection pool
const pool = mysql.createPool(dbConfig);

// Export the pool for use in your application
module.exports = pool;

```


2. controllers/studentController.js
```javascript
const studentModel = require('../models/studentModel'); // Import the student model

// Controller to register a new student
async function registerStudent(req, res) {
    try {
        const studentData = req.body;
        const result = await studentModel.registerStudent(studentData);
        res.status(201).json({ message: 'Student registered successfully!', studentId: result.insertId });
    } catch (error) {
        console.error('Error registering student:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

// Controller to find students by first name and last name
async function findStudents(req, res) {
    const { firstName, lastName } = req.body;
    try {
        const students = await studentModel.findStudents(firstName, lastName);
        res.json({
            message: students.length > 0 ? 'Students found' : 'No students found',
            students
        });
    } catch (error) {
        console.error('Error finding students:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

// Controller to get all students
async function getAllStudents(req, res) {
    try {
        const students = await studentModel.getAllStudents();
        res.json(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

// Controller to get a student by ID
async function getStudentById(req, res) {
    const studentId = req.params.id;
    try {
        const student = await studentModel.getStudentById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json(student);
    } catch (error) {
        console.error('Error fetching student:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

// Controller to register a guardian
async function registerGuardian(req, res) {
    try {
        const guardianData = req.body;
        const result = await studentModel.registerGuardian(guardianData);
        res.status(201).json({ message: 'Guardian registered successfully!', guardianId: result.insertId });
    } catch (error) {
        console.error('Error registering guardian:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

// Controller to get student-guardian relationship data
async function getStudentGuardianData(req, res) {
    try {
        const data = await studentModel.getStudentGuardianData();
        res.json(data);
    } catch (error) {
        console.error('Error fetching student-guardian data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

// Exporting the controller functions
module.exports = {
    registerStudent,
    findStudents,
    getAllStudents,
    getStudentById,
    registerGuardian,
    getStudentGuardianData
};
```

3. middlewares/authMiddleware.js
```javascript
const jwt = require('jsonwebtoken'); // Import JSON Web Token library
const config = require('../config'); // Import your configuration settings (e.g., secret key)

// Middleware function to check if the user is authenticated
function authenticateToken(req, res, next) {
    // Get the token from the Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
        return res.sendStatus(401); // Unauthorized if token is not present
    }

    // Verify the token
    jwt.verify(token, config.secret, (err, user) => {
        if (err) {
            return res.sendStatus(403); // Forbidden if token is invalid
        }
        req.user = user; // Attach user information to the request object
        next(); // Call the next middleware or route handler
    });
}

// Middleware function to check user roles (optional)
function authorizeRoles(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden' }); // Forbidden if the user does not have the required role
        }
        next(); // Call the next middleware or route handler
    };
}

module.exports = {
    authenticateToken,
    authorizeRoles
};
```

4. models/studentModel.js
```javascript
const pool = require('../db'); // Assuming you have a db.js file exporting the connection pool

// Function to register a new student
async function registerStudent(studentData) {
    const {
        fname, MI, lname, DOB, st_address, city, state, zip,
        st_email, st_cell, student_location, gender
    } = studentData;

    const query = `
        INSERT INTO student (F_Name, MI, L_Name, dob, st_address, city, 
            state, zip, st_email, st_cell, student_location, st_gender)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [fname, MI, lname, DOB, st_address, city, state, zip,
        st_email, st_cell, student_location, gender];

    try {
        const [result] = await pool.query(query, values);
        return result; // Returning the result for further use, like the inserted ID
    } catch (error) {
        throw error; // Propagate error to be handled in the route
    }
}

// Function to find students by first name and last name
async function findStudents(firstName, lastName) {
    const query = `
        SELECT * FROM student
        WHERE F_Name LIKE ? OR L_Name LIKE ?`;
    
    const values = [`%${firstName}%`, `%${lastName}%`];

    try {
        const [rows] = await pool.query(query, values);
        return rows; // Return found students
    } catch (error) {
        throw error; // Propagate error to be handled in the route
    }
}

// Function to get all students
async function getAllStudents() {
    const query = 'SELECT * FROM student';

    try {
        const [rows] = await pool.query(query);
        return rows; // Return all students
    } catch (error) {
        throw error; // Propagate error to be handled in the route
    }
}

// Function to get student by ID
async function getStudentById(studentId) {
    const query = 'SELECT * FROM student WHERE St_ID = ?';
    
    try {
        const [rows] = await pool.query(query, [studentId]);
        return rows[0]; // Return the student object
    } catch (error) {
        throw error; // Propagate error to be handled in the route
    }
}

// Function to register a guardian for a student
async function registerGuardian(guardianData) {
    const {
        g_f_name, g_mi, g_l_name, g_cell, g_email,
        g_staddress, g_city, g_state, g_zip, gender
    } = guardianData;

    const query = `
        INSERT INTO guardian 
        (g_f_name, g_mi, g_l_name, g_cell, g_email, g_staddress, g_city, g_state, g_zip, gender)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [g_f_name, g_mi, g_l_name, g_cell, g_email,
        g_staddress, g_city, g_state, g_zip, gender];

    try {
        const [result] = await pool.query(query, values);
        return result; // Return the result for further use
    } catch (error) {
        throw error; // Propagate error to be handled in the route
    }
}

// Function to get student-guardian relationship data
async function getStudentGuardianData() {
    const query = `
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
            guardian AS g ON sg.g_id = g.g_id`;

    try {
        const [rows] = await pool.query(query);
        return rows; // Return the data
    } catch (error) {
        throw error; // Propagate error to be handled in the route
    }
}

// Exporting the functions to be used in app.js
module.exports = {
    registerStudent,
    findStudents,
    getAllStudents,
    getStudentById,
    registerGuardian,
    getStudentGuardianData
};
```

5. routes/studentRoutes.js
```javascript
const express = require('express');
const router = express.Router();
const studentModel = require('../models/studentModel'); // Import the student model

// Route to register a new student
router.post('/register', async (req, res) => {
    try {
        const studentData = req.body;
        const result = await studentModel.registerStudent(studentData);
        res.status(201).json({ message: 'Student registered successfully!', studentId: result.insertId });
    } catch (error) {
        console.error('Error registering student:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route to find students by first name and last name
router.post('/find', async (req, res) => {
    const { firstName, lastName } = req.body;
    try {
        const students = await studentModel.findStudents(firstName, lastName);
        res.json({
            message: students.length > 0 ? 'Students found' : 'No students found',
            students
        });
    } catch (error) {
        console.error('Error finding students:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route to get all students
router.get('/', async (req, res) => {
    try {
        const students = await studentModel.getAllStudents();
        res.json(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route to get a student by ID
router.get('/:id', async (req, res) => {
    const studentId = req.params.id;
    try {
        const student = await studentModel.getStudentById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json(student);
    } catch (error) {
        console.error('Error fetching student:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route to register a guardian
router.post('/register-guardian', async (req, res) => {
    try {
        const guardianData = req.body;
        const result = await studentModel.registerGuardian(guardianData);
        res.status(201).json({ message: 'Guardian registered successfully!', guardianId: result.insertId });
    } catch (error) {
        console.error('Error registering guardian:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route to get student-guardian relationship data
router.get('/guardian-data', async (req, res) => {
    try {
        const data = await studentModel.getStudentGuardianData();
        res.json(data);
    } catch (error) {
        console.error('Error fetching student-guardian data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
```

6. app.js
```javascript
// app.js

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const studentRoutes = require('./routes/studentRoutes'); // Import your routes
const { sendErrorResponse } = require('./utils/helpers'); // Import helper functions

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(bodyParser.json()); // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Serve static files (like your HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Set up view engine if you're using template rendering (optional)
// app.set('view engine', 'ejs'); // Example for EJS
// app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/api/students', studentRoutes); // Use student routes

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack); // Log the error
    sendErrorResponse(res, 'Something went wrong!', 500); // Send a generic error response
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
```

7. utils/helpers.js (optional)
```javascript
// utils/helpers.js

// Check if an email is valid
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Check if a phone number is valid (simple validation)
function isValidPhoneNumber(phone) {
    const regex = /^\(\d{3}\) \d{3}-\d{4}$/; // Example format: (123) 456-7890
    return regex.test(phone);
}

// Check if required fields are present
function validateRequiredFields(fields) {
    for (const field of fields) {
        if (!field.value || field.value.trim() === '') {
            return `${field.name} is required.`;
        }
    }
    return null; // No validation errors
}

// Format a date to a more readable format
function formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString(undefined, options);
}

// Format a phone number
function formatPhoneNumber(phone) {
    const cleaned = ('' + phone).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
        return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phone; // Return original if formatting fails
}

// Send a standardized error response
function sendErrorResponse(res, message, statusCode = 400) {
    res.status(statusCode).json({ error: message });
}

// Generate a random ID (for example, for temporary use)
function generateRandomId(length = 8) {
    return Math.random().toString(36).substr(2, length);
}

// Deep clone an object
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

module.exports = {
    isValidEmail,
    isValidPhoneNumber,
    validateRequiredFields,
    formatDate,
    formatPhoneNumber,
    sendErrorResponse,
    generateRandomId,
    deepClone,
};
```
