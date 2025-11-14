const path = require('path');
const helpers = require('../../utils/helpers');
const StudentModel = require('../student/student.model');
const AdminModel = require('./admin.model');
const ParentModel = require('../parent/parent.model');


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
            res.redirect('/admin/admin');
        }

        return res.status(401).sendFile(path.resolve('public_html/invalid-credentials.html'));
    }

    async registerStudent(req, res) {
        const { fname, MI, lname, DOB, st_address, city, state, zip, st_email, st_cell, student_location, gender } = req.body;

        // Check if student already exists
        const existingStudent = await StudentModel.doesExist(fname, lname, DOB);
        if (existingStudent) {
            return helpers.sendErrorResponse(res, 'Student already exists', 400);
        }
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

        const result = await AdminModel.registerStudent({ fname, MI, lname, DOB, st_address, city, state, zip, st_email, st_cell, student_location, gender });

        if (result.success) {
            res.json({ message: result.message });
        } else {
            res.status(400).json({ error: result.error });
        }
    };

    async registerParent(req, res) {
        const { 
            g_f_name, 
            g_mi, 
            g_l_name, 
            g_cell,
            g_email,
            g_staddress,
            g_city,
            g_state,
            g_zip,
            gender
        } = req.body;

        // Validate required fields
        const requiredFields = [
            { name: 'First Name', value: g_f_name },
            { name: 'Last Name', value: g_l_name },
            { name: 'Email', value: g_email },
            { name: 'Phone Number', value: g_cell },
            { name: 'Street Address', value: g_staddress },
            { name: 'City', value: g_city },
            { name: 'State', value: g_state },
            { name: 'Zip Code', value: g_zip },
        ];

        const validationError = helpers.validateRequiredFields(requiredFields);
        if (validationError) return helpers.sendErrorResponse(res, validationError, 400);   

        const guardianData = {
            g_f_name,
            g_mi,
            g_l_name,
            g_cell,
            g_email,
            g_staddress,
            g_city,
            g_state,
            g_zip,
            gender
        };

        const result = await ParentModel.registerGuardian(guardianData);

        if (result.success) {
            res.json({ message: result.message });
        }
        else {
            res.status(400).json({ error: result.error });
        }

    }

    async getAllGuardians (req, res) {
        const guardians = await ParentModel.getAllGuardians();
        if (guardians.success === false) {
            res.status(500).json({ error: guardians.error });
        } else {
            res.json(guardians);
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
                    res.redirect('/admin/admin-login'); // Redirect to login page
                }
            });
        } else {
            res.redirect('/admin/admin-login'); // No session, go to login
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

    async assignGuardian(req, res) {
        const { st_id, g_id, relationship_type } = req.body;

        try {
            await AdminModel.assignGuardian(st_id, g_id, relationship_type);
            res.status(200).send('Guardian assigned successfully');
        } catch (err) {
            console.error('Error assigning guardian:', err);
            res.status(500).send('Error assigning guardian');
        }
    }

    async getStudentGuardianData(req, res) {
        try {
            const studentGuardianData = await AdminModel.getStudentGuardianData();
            res.json(studentGuardianData);
        } catch (error) {
            console.error('Error fetching student-guardian data:', error);
            res.status(500).json({ error: 'Failed to fetch student-guardian data' });
        }
    }

    async updateStudentGuardian(req, res) {
        const { studentId, guardianId, newGuardianId, relationship_type } = req.body;

        if (!studentId || !guardianId) {
            return res.status(400).json({ error: 'Student and guardian ids are required' });
        }

        const updates = {};
        if (newGuardianId !== undefined) updates.newGuardianId = newGuardianId;
        if (relationship_type !== undefined) updates.relationship_type = relationship_type;

        if (!Object.keys(updates).length) {
            return res.status(400).json({ error: 'No changes provided' });
        }

        try {
            const result = await AdminModel.updateStudentGuardian(studentId, guardianId, updates);
            if (!result.affectedRows) {
                return res.status(404).json({ error: 'Relationship not found or unchanged' });
            }
            res.json({ message: 'Student-guardian relationship updated successfully' });
        } catch (error) {
            console.error('Error updating student-guardian relationship:', error);
            res.status(500).json({ error: 'Failed to update student-guardian relationship' });
        }
    }

    async deleteStudentGuardian(req, res) {
        const { studentId, guardianId } = req.body;

        if (!studentId || !guardianId) {
            return res.status(400).json({ error: 'Student and guardian ids are required' });
        }

        try {
            const result = await AdminModel.deleteStudentGuardian(studentId, guardianId);
            if (!result.affectedRows) {
                return res.status(404).json({ error: 'Relationship not found' });
            }
            res.json({ message: 'Student-guardian relationship removed successfully' });
        } catch (error) {
            console.error('Error deleting student-guardian relationship:', error);
            res.status(500).json({ error: 'Failed to delete student-guardian relationship' });
        }
    }

}


module.exports = new AdminController();
