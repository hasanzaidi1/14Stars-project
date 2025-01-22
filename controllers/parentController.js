const pool = require('../config/dbConfig');
const bcrypt = require('bcrypt');
const Parent = require('../models/parentModel'); // Import the Teacher model
const path = require('path');


class ParentController {

    // Register a new parent
    async register(req, res) {
        const { username, email, password } = req.body;

        const parent = await Parent.findByEmail(email);
        if (parent) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists',
            });
        }

        try {
            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert into the database using the model
            await Parent.createParent(username, email, hashedPassword);

            // Redirect to the login page after registration
            res.redirect('/parents/parents_login.html');
        } catch (error) {
            console.error('Error during parent registration:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    async login(req, res) {
        const { username, password } = req.body;
        try {
            // Find the parent by username or email
            const parent = await Parent.findParent(username);  // Don't pass password here
    
            if (!parent) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid username or password',
                });
            }
    
            // Compare the provided password with the stored hashed password
            const isMatch = await bcrypt.compare(password, parent.password);  // Use bcrypt.compare to compare hashed password
            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid username or password',
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
        
    }
}

module.exports = new ParentController();
