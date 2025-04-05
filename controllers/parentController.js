const bcrypt = require('bcrypt');
const Parent = require('../models/parentModel');
const StudentGuardian = require('../models/studentGuardianModel');
const Student = require('../models/studentModel');

class ParentController {
    // **Register a New Parent**
    async register(req, res) {
        const { f_name, l_name, email, password } = req.body;

        try {
            // Check if email already exists
            const parent = await Parent.findByEmail(email);
            if (parent) {
                return res.status(400).json({ success: false, message: 'Email already exists' });
            }

            // Hash password before saving
            const hashedPassword = await bcrypt.hash(password, 10);
            await Parent.createParent(f_name, l_name, email, hashedPassword);

            res.redirect('/parents/parents_login.html'); // Redirect to login page after successful registration
        } catch (error) {
            console.error('Error during parent registration:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    // **Login Parent**
    async login(req, res) {
        const { email, password } = req.body;
        try {
            console.log('Logging in parent:', email, password);
            const parent = await Parent.findByEmail(email);
            if (!parent) {
                return res.status(401).json({ success: false, message: 'Invalid email or password' });
            }

            // Compare entered password with hashed password
            const isMatch = await bcrypt.compare(password, parent.password);
            if (!isMatch) {
                return res.status(401).json({ success: false, message: 'Invalid email or password' });
            }

            // Set session variables
            req.session.isLoggedIn = true;
            req.session.isParent = true;
            req.session.parentId = parent.p_id;

            res.redirect('/parents/parents_portal.html'); // Redirect to portal
        } catch (error) {
            console.error('Error logging in parent:', error);
            res.status(500).json({ success: false, message: 'Error logging in parent. Please try again.' });
        }
    }

    // **Logout Parent**
    async logout(req, res) {
        req.session.destroy((error) => {
            if (error) {
                console.error('Error destroying session:', error);
                return res.status(500).send('Internal Server Error');
            }
            res.redirect('/parents/parents_login.html'); // Redirect to login page after logout
        });
    }

    // **Register a New Student (with Guardian Relationship)**
    async registerStudent(req, res) {
        const {
            fname, MI, lname, DOB, st_address, city, state, zip,
            st_email, st_cell, student_location, gender,
            "parent-first-name": parentFName, "parent-last-name": parentLName, relation,
            parent_st_address, parent_city, parent_state, parent_zip,
            parent_cell, parent_email
        } = req.body;

        console.log('Received relation:', relation);

        const parentId = req.session.parentId; // Get parent ID from session

        try {
            // **Check if student already exists**
            const studentExists = await Student.doesExist(fname, lname, DOB);
            if (studentExists) {
                console.log('Student already exists:', studentExists);
                return res.status(400).json({ message: 'Student already exists' });
            }

            // **Check if guardian (parent) already exists**
            const guardianExists = await Parent.findGuardian(parentFName, parentLName, parent_cell, parent_email);
            let guardianId;

            if (guardianExists) {
                guardianId = guardianExists.g_id;
            } else {
                // **Insert new guardian**
                const guardianResult = await Parent.registerGuardian(parentFName, parentLName, parent_cell, parent_email, parent_st_address, parent_city, parent_state, parent_zip);
                guardianId = guardianResult.insertId;
            }

            // **Insert new student**
            const studentResult = await Student.registerStudent(fname, MI, lname, DOB, st_address, city, state, zip, st_email, st_cell, student_location, gender);
            const studentId = studentResult.insertId;

            // **Insert relationship in student_guardian table**
            await StudentGuardian.createStudentGuardian(guardianId, studentId, relation);

            res.redirect('/parents/parents_portal.html'); // Redirect to parent portal after successful registration
        } catch (error) {
            console.error('Error registering student:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    // **Get All Students of a Parent (Guardian)**
    async getStudents(req, res) {
        const parentId = req.session.parentId; // Get parent ID from session

        try {
            const students = await Parent.findStudents(parentId);
            res.json(students);
        } catch (error) {
            console.error('Error getting students:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    // Get all students by parents email
    async getStudentsByParentEmail(req, res) {
        const { parent_email } = req.body;

        try {
            const students = await Student.findByParentEmail(parent_email);
            res.json(students);
        } catch (error) {
            console.error('Error getting students by email:', error);
            res.status(500).send('Internal Server Error');
        }
    }
}

module.exports = new ParentController();
