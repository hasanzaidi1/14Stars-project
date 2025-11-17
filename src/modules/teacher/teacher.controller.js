const path = require('path');
const bcrypt = require('bcrypt');
const Teacher = require('./teacher.model'); // Import the Teacher model
const TeacherAccount = require('./teacherAccount.model');

class TeacherController {
    // Login function for teacher authentication
    async login(req, res) {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).sendFile(path.resolve('public_html/invalid-credentials.html'));
        }

        try {
            const account = await TeacherAccount.findByEmail(email);
            if (!account || !account.password_hash) {
                return res.status(401).sendFile(path.resolve('public_html/invalid-credentials.html'));
            }

            const isMatch = await bcrypt.compare(password, account.password_hash);
            if (!isMatch) {
                return res.status(401).sendFile(path.resolve('public_html/invalid-credentials.html'));
            }

            req.session.isLoggedIn = true;
            req.session.isTeacher = true;
            req.session.teacherAccountId = account.account_id;
            req.session.teacherEmail = account.email;

            return res.redirect('/teachers/teacher_portal');
        } catch (error) {
            console.error('Error logging in teacher:', error);
            return res.status(500).send('Internal Server Error');
        }
    }

    // Register teacher
    async registerTeacher(req, res) {
        const { 
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
            password,
            confirm_password
        } = req.body;
    
        // Validate required fields
        if (!t_f_name || !t_l_name || !t_email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please fill out all required fields.',
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters long.'
            });
        }

        if (confirm_password !== undefined && password !== confirm_password) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match.'
            });
        }
    
        try {
            const normalizedEmail = (t_email || '').trim();
            const existingAccount = await TeacherAccount.findByEmail(normalizedEmail);
            if (existingAccount) {
                return res.status(409).json({
                    success: false,
                    message: 'Email already exists. Please use a different email.'
                });
            }

            const normalizeName = (value) => (value || '').trim().toLowerCase();

            const teacherProfile = await Teacher.findByEmail(normalizedEmail);
            if (!teacherProfile) {
                return res.status(400).json({
                    success: false,
                    message: 'Your profile is not on file. Please contact the administrator to be added before creating an account.'
                });
            }

            if (
                normalizeName(teacherProfile.t_f_name) !== normalizeName(t_f_name) ||
                normalizeName(teacherProfile.t_l_name) !== normalizeName(t_l_name)
            ) {
                return res.status(400).json({
                    success: false,
                    message: 'Provided name does not match the teacher record on file. Please verify your information or contact the administrator.'
                });
            }

            const password_hash = await bcrypt.hash(password, 10);
            await TeacherAccount.create({
                first_name: teacherProfile.t_f_name,
                last_name: teacherProfile.t_l_name,
                email: normalizedEmail,
                phone: teacherProfile.t_phone,
                password_hash
            });
    
            // On success, send success response
            return res.status(201).json({
                success: true,
                message: 'Teacher registered successfully!',
            });
        } catch (error) {
            console.error('Error registering teacher:', error);
    
            const errorMessage = error.code === 'ER_DUP_ENTRY'
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

    async getCurrentTeacher(req, res) {
        if (!req.session?.isTeacher || !req.session.teacherEmail) {
            return res.status(401).json({ success: false, message: 'Teacher authentication required.' });
        }

        try {
            const account = await TeacherAccount.findByEmail(req.session.teacherEmail);
            if (!account) {
                return res.status(404).json({ success: false, message: 'Teacher account not found.' });
            }

            res.json({
                success: true,
                email: account.email,
                first_name: account.first_name,
                last_name: account.last_name,
                phone: account.phone || null
            });
        } catch (error) {
            console.error('Error fetching current teacher details:', error);
            res.status(500).json({ success: false, message: 'Unable to fetch teacher profile.' });
        }
    }

    async addTeacherProfile(req, res) {
        const { 
            t_f_name,
            t_mi,
            t_l_name,
            t_email,
            t_phone,
            gender,
            t_staddress,
            t_city,
            t_state,
            t_zip
        } = req.body;

        if (!t_f_name || !t_l_name || !t_email) {
            return res.status(400).json({ success: false, message: 'First name, last name, and email are required.' });
        }

        try {
            const normalizedEmail = t_email.trim();
            const existingTeacher = await Teacher.findByEmail(normalizedEmail);
            if (existingTeacher) {
                return res.status(409).json({ success: false, message: 'A teacher with this email already exists.' });
            }

            await Teacher.create({
                t_f_name,
                t_mi: t_mi || null,
                t_l_name,
                t_email: normalizedEmail,
                t_phone: t_phone || null,
                gender: gender || null,
                t_staddress: t_staddress || null,
                t_city: t_city || null,
                t_state: t_state || null,
                t_zip: t_zip || null
            });

            res.status(201).json({ success: true, message: 'Teacher profile added successfully.' });
        } catch (error) {
            console.error('Error adding teacher profile:', error);
            res.status(500).json({ success: false, message: 'Error adding teacher profile. Please try again.' });
        }
    }

    // Logout function for teacher
    async logout(req, res) {
        req.session.destroy(err => {
            if (err) {
                return res.send('Error logging out');
            }
            res.redirect('/teachers/teachers');
        });
    }

    // Update teacher profile
    async updateTeacher(req, res) {
        const { id } = req.params;
        const updates = req.body || {};

        if (!id) {
            return res.status(400).json({ message: 'Teacher ID is required' });
        }

        try {
            const updated = await Teacher.updateById(id, updates);
            if (!updated) {
                return res.status(404).json({ message: 'Teacher not found or no changes applied' });
            }
            res.json({ message: 'Teacher updated successfully' });
        } catch (error) {
            console.error('Error updating teacher:', error);
            res.status(500).json({ message: 'Error updating teacher' });
        }
    }

    // Delete teacher
    async deleteTeacher(req, res) {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: 'Teacher ID is required' });
        }

        try {
            const deleted = await Teacher.deleteById(id);
            if (!deleted) {
                return res.status(404).json({ message: 'Teacher not found' });
            }
            res.json({ message: 'Teacher removed successfully' });
        } catch (error) {
            console.error('Error deleting teacher:', error);
            res.status(500).json({ message: 'Error deleting teacher' });
        }
    }
}

module.exports = new TeacherController(); // Export the instance of the controller
