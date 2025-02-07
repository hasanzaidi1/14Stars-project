const bcrypt = require('bcrypt');
const Parent = require('../models/parentModel');
const StudentGuardian = require('../models/studentGuardianModel');
const Student = require('../models/studentModel');
const path = require('path');
const { fn } = require('moment');
const { parseEnv } = require('util');

class ParentController {
    // Register a new parent
    async register(req, res) {
        const { f_name, l_name, email, password } = req.body;

        try {
            const parent = await Parent.findByEmail(email);
            if (parent) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already exists',
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            await Parent.createParent(f_name, l_name, email, hashedPassword);
            
            res.redirect('/parents/parents_login.html');



        } catch (error) {
            console.error('Error during parent registration:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    // async getOrCreateGuardian(req, res, next) {
    //     try {
    //         const { parentFirstName, parentLastName, parent_cell, parent_email, parent_st_address, parent_city, parent_state, parent_zip } = req.body;

    //         let guardianId = await ParentModel.findGuardian(parentFirstName, parentLastName, parent_cell, parent_email);

    //         if (!guardianId) {
    //             guardianId = await ParentModel.insertGuardian(parentFirstName, parentLastName, parent_cell, parent_email, parent_st_address, parent_city, parent_state, parent_zip);
    //         }

    //         req.guardianId = guardianId; // Pass to next middleware
    //         next();
    //     } catch (error) {
    //         console.error('Error in ParentController:', error);
    //         res.status(500).json({ error: 'Guardian registration failed' });
    //     }
    // }

    // Login parent
    
    async login(req, res) {
        const { email, password } = req.body;
        try {
            const parent = await Parent.findParent(email);
            if (!parent) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password',
                });
            }

            const isMatch = await bcrypt.compare(password, parent.password);
            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password',
                });
            }
    
            // Set session variables
            req.session.isLoggedIn = true;
            req.session.isParent = true;
            req.session.parentId = parent.p_id;
    
            // Redirect to parent portal
            return res.redirect('/parents/parents_portal.html');
        } catch (error) {
            console.error('Error logging in parent:', error);
            return res.status(500).json({
                success: false,
                message: 'Error logging in parent. Please try again.',
            });
        }
    }

    async logout(req, res) {
        // Destroy the session
        req.session.destroy((error) => {
            if (error) {
                console.error('Error destroying session:', error);
                return res.status(500).send('Internal Server Error');
            }
            // Redirect to the login page
            res.redirect('/parents/parents_login.html');
        });
    }

    async registerStudent(req, res) {
        const { 
            fname, 
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
            gender,
        
            // Parent info
            "parent-first-name": parentFName,
            "parent-last-name": parentLName,
            relation,
            parent_st_address,
            parent_city,
            parent_state,
            parent_zip,
            parent_cell,
            parent_email,
        } = req.body;

        console.log(relation);

        const parentId = req.session.parentId;

        try {
            // Check if the student already exists
            const [existingStudent] = await Student.doesExist(fname, lname, DOB);
            
            if (existingStudent.length > 0) {
                console.log('Student already exists:', existingStudent);
                return res.status(400).json({ message: 'Student already exists' });
            }

            // Insert the new student into the database
            // Insert guardian data if parent is not already registered
            // CHECK /register-from-parent in app.js it has good implementation
            const [guardians] = await Parent.findByEmail(parent_email);
            if (guardians.length > 0) {
                console.log('Parent already exists:', guardians);
                return res.status(400).json({ message: 'Parent already exists' });
            }

            // Insert guardian data
            const [guardianResult] = await Parent.registerParent(
                parentFName, 
                parentLName, 
                parent_cell, 
                parent_email, 
                parent_st_address, 
                parent_city, 
                parent_state, 
                parent_zip);

            // Get the guardian ID (g_id)
            const guardianId = guardianResult.insertId;
            console.log(guardianId);

            // Insert student data
            const [studentResult] = await Student.registerStudent(
                fname, 
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
                gender);

            console.log(studentResult);

            // Get the student ID (st_id)
            const studentId = studentResult.insertId;

            // Insert relationship into student_guardian table
            await StudentGuardian.createStudentGuardian(guardianId, studentId, relation); 
            console.log('Student and Guardian data added successfully!');

            res.json({ message: 'Student and Guardian data added successfully!' });

            res.redirect('/parents/parents_portal.html');
        } catch (error) {
            console.error('Error registering student:', error);
            res.status(500).send('Internal Server Error');
        }
    }
}

module.exports = new ParentController();
