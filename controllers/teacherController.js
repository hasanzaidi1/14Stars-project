const path = require('path'); // Import the path module
const teacherModel = require('../models/teacherModel'); // Import the teacher model
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing
const session = require('express-session'); // Ensure session is available

// Controller to register a new teacher
async function registerTeacher(req, res) {
    try {
        const teacherData = req.body;
        // Hash the password before saving (you should do this in your model)
        const hashedPassword = await bcrypt.hash(teacherData.password, 10);
        teacherData.password = hashedPassword; // Replace the plaintext password with the hashed one
        const result = await teacherModel.registerTeacher(teacherData);
        res.status(201).json({ message: 'Teacher registered successfully!', teacherId: result.insertId });
    } catch (error) {
        console.error('Error registering teacher:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

// Serve the login page
async function getTeacherLoginPage(req, res) {
    try {
        // Construct the absolute path to the login HTML file
        const loginPagePath = path.join(__dirname, '../public/teachers/teachers.html'); // Adjust the path as necessary
        res.sendFile(loginPagePath);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

// Controller to get all teachers
async function getAllTeachers(req, res) {
    try {
        const teachers = await teacherModel.getAllTeachers();
        res.json(teachers);
    } catch (error) {
        console.error('Error fetching teachers:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

// Controller to get a teacher by ID
async function getTeacherById(req, res) {
    const teacherId = req.params.id;
    try {
        const teacher = await teacherModel.getTeacherById(teacherId);
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }
        res.json(teacher);
    } catch (error) {
        console.error('Error fetching teacher:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

// Controller to handle teacher login
async function loginTeacher(req, res) {
    const { username, password } = req.body;

    try {
        // Check if the provided username and password match the hardcoded values
        const hardcodedUsername = "teacher"; // Hardcoded username
        const hardcodedPassword = "t@14"; // Hardcoded password

        // Validate the username and password
        if (username !== hardcodedUsername || password !== hardcodedPassword) {
            return res.status(401).send('Invalid credentials');
        }

        // If credentials are valid, store user information in session
        req.session.teacherId = hardcodedUsername; // Store the username or any identifier in session
        res.redirect('/teachers/teacher_portal.html'); // Redirect to the teacher portal
    } catch (error) {
        console.error('Error logging in teacher:', error);
        res.status(500).send('Internal Server Error');
    }
}
// Exporting the controller functions
module.exports = {
    registerTeacher,
    getTeacherLoginPage,
    getAllTeachers,
    getTeacherById,
    loginTeacher // Export the new login function
};