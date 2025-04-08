const path = require('path');
const helpers = require('../utils/helpers');
const StudentModel = require('../models/studentModel');
const AdminModel = require('../models/adminModel');


class AdminController {
    async login(req, res) {
        const { username, password, remember } = req.body;
        const adminUser = {
            username: process.env.ADMIN_USERNAME,
            password: process.env.ADMIN_PASSWORD
        };

        if (username === adminUser.username && password === adminUser.password) {
            req.session.isAdmin = true;
            if (remember) {
                res.cookie('username', username, { 
                    maxAge: 30 * 24 * 60 * 60 * 1000 
                });
            }
            res.redirect('/admin/admin.html');
        } else {
            return res.status(401).sendFile(path.join(__dirname, '../public_html/invalid-credentials.html'));
        }
    }

    async registerStudent(req, res) {
        const { fname, MI, lname, DOB, st_address, city, state, zip, st_email, st_cell, student_location, gender } = req.body;

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
        if (validationError) return helpers.sendErrorResponse(res, validationError, 400);

        // Additional validations 
        // if (!helpers.isValidEmail(st_email)) return helpers.sendErrorResponse(res, 'Invalid email address', 400);
        // if (!helpers.isValidPhoneNumber(st_cell)) return helpers.sendErrorResponse(res, 'Invalid phone number format', 400);

        const result = await AdminModel.registerStudent({ fname, MI, lname, DOB, st_address, city, state, zip, st_email, st_cell, student_location, gender });

        if (result.success) {
            res.json({ message: result.message });
        } else {
            res.status(400).json({ error: result.error });
        }
    };

    async getAllStudents (req, res) {
        const students = await AdminModel.getAllStudents();
        if (students.success === false) {
            res.status(500).json({ error: students.error });
        } else {
            res.json(students);
        }
    };
    
    async getStudentById (req, res) {
        const { id } = req.params;
        const student = await AdminModel.getStudentById(id);
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }
        res.json(student);
    };

    async logout(req, res) {
        if (req.session) {
            req.session.destroy(err => {
                if (err) {
                    res.status(500).send('Failed to log out');
                } else {
                    res.clearCookie('connect.sid');
                    res.redirect('/admin/admin-login.html'); // Redirect to login page
                }
            });
        } else {
            res.redirect('/admin/admin-login.html'); // No session, go to login
        }
    }

    async getStudByName(req, res) {
        try {
            const { fname, lname } = req.query; // ✅ Use req.query for GET requests
    
            console.log("Received query parameters:", { fname, lname });
    
            if (!fname && !lname) {
                return res.status(400).json({ error: "First name or last name is required" });
            }
    
            const students = await AdminModel.getStudByName(fname, lname);
    
            if (students.success === false) {
                return res.status(500).json({ error: students.error });
            }
    
            res.json(students);
        } catch (error) {
            console.error('Error in getStudByName:', error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
    

}


module.exports = new AdminController();
