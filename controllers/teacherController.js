const pool = require('../config/dbConfig');
const bcrypt = require('bcrypt');
const Teacher = require('../models/teacherModel'); // Import the Teacher model
const path = require('path');

class TeacherController {
    // Login function for teacher authentication
    async login(req, res) {
        const { username, password } = req.body;
        if (username === process.env.TEACHER_USERNAME && password === process.env.TEACHER_PASSWORD) {
            req.session.isLoggedIn = true;
            req.session.isTeacher = true;

            return res.redirect('../teachers/teacher_portal.html');
        }

        return res.status(401).sendFile(path.join(__dirname, '../public_html/invalid-credentials.html'));
    }

    // Register teacher
    async registerTeacher(req, res) {
        const { t_f_name, t_mi, t_l_name, t_email, t_phone, gender, t_staddress, t_city, t_state, t_zip } = req.body;
    
        // Validate required fields
        if (!t_f_name || !t_l_name || !t_email) {
            return res.status(400).json({
                success: false,
                message: 'Please fill out all required fields.',
            });
        }
    
        try {
            // Create a new teacher in the database
            await Teacher.create({
                t_f_name, 
                t_mi, 
                t_l_name, 
                t_email, 
                t_phone, 
                gender, 
                t_staddress, 
                t_city, 
                t_state, 
                t_zip,
            });
    
            // On success, send success response
            return res.status(201).json({
                success: true,
                message: 'Teacher registered successfully!',
            });
        } catch (error) {
            console.error('Error registering teacher:', error);
    
            const errorMessage = error.code === '23505'
                ? 'Email already exists. Please use a different email.'
                : 'Error registering teacher. Please try again.';
    
            // Return error message
            return res.status(500).json({
                success: false,
                message: errorMessage,
            });
        }
    }
 
    // Get all teachers from the database
    async getTeachers(req, res) {
        try {
            // Fetch all teachers with full details
            const teachers = await Teacher.findAll();

            // Respond with the teachers' data
            res.json({ teachers });
        } catch (error) {
            // If an error occurs, send a response with the error message
            res.status(500).json({ message: 'Error fetching teachers', error: error.message });
        }
    }

    // Logout function for teacher
    async logout(req, res) {
        req.session.destroy(err => {
            if (err) {
                return res.send('Error logging out');
            }
            res.clearCookie('username');
            res.redirect('/teachers/teachers.html');
        });
    }
}

module.exports = new TeacherController(); // Export the instance of the controller
