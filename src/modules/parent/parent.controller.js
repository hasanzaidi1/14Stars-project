const bcrypt = require('bcrypt');
const Parent = require('./parent.model');
const StudentGuardian = require('../guardian/student-guardian.model');
const Student = require('../student/student.model');
const helper = require('../../utils/helpers');

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

            res.redirect('/parents/parents_login'); // Redirect to login page after successful registration
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
            req.session.parentId = parent.g_id;
            req.session.parentEmail = parent.email;

            res.redirect('/parents/parents_portal'); // Redirect to portal
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
            res.redirect('/parents/parents_login'); // Redirect to login page after logout
        });
    }

    // **Register a New Student (with Guardian Relationship)**
    async registerStudent(req, res) {
        if (!req.session.isParent || !req.session.parentEmail) {
            return res.status(401).json({ success: false, message: 'Parent authentication required' });
        }
        const {
            fname, MI, lname, DOB, st_address, city, state, zip,
            st_email, st_cell, student_location, gender,
            "parent-first-name": parentFName,
            "parent-MI": parentMI,
            "parent-last-name": parentLName,
            relation,
            parent_st_address, parent_city, parent_state, parent_zip,
            parent_cell,
            parent_gender
        } = req.body;
        const parentEmail = req.session.parentEmail;

        const requiredFieldError = helper.validateRequiredFields([
            { name: 'Student first name', value: fname },
            { name: 'Student last name', value: lname },
            { name: 'Date of birth', value: DOB },
            { name: 'Student address', value: st_address },
            { name: 'Student city', value: city },
            { name: 'Student state', value: state },
            { name: 'Student zip', value: zip },
            { name: 'Student location', value: student_location },
            { name: 'Student gender', value: gender },
            { name: 'Guardian first name', value: parentFName },
            { name: 'Guardian last name', value: parentLName },
            { name: 'Guardian address', value: parent_st_address },
            { name: 'Guardian city', value: parent_city },
            { name: 'Guardian state', value: parent_state },
            { name: 'Guardian zip', value: parent_zip },
            { name: 'Guardian phone number', value: parent_cell },
            { name: 'Relationship', value: relation }
        ]);

        if (requiredFieldError) {
            return res.status(400).json({ success: false, message: requiredFieldError });
        }

        const guardianData = helper.cleanData({
            g_f_name: parentFName,
            g_mi: parentMI,
            g_l_name: parentLName,
            g_cell: parent_cell,
            g_email: parentEmail,
            g_staddress: parent_st_address,
            g_city: parent_city,
            g_state: parent_state,
            g_zip: parent_zip,
            gender: parent_gender
        });
        const studentData = helper.cleanData({
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
            gender
        });

        try {
            // **Check if student already exists**
            const studentExists = await Student.doesExist(studentData.fname, studentData.lname, studentData.DOB);
            if (studentExists) {
                console.log('Student already exists:', studentExists);
                return res.status(409).json({ success: false, message: 'Student already exists' });
            }

            // **Check if guardian (parent) already exists**
            const guardianExists = await Parent.findGuardian(parentFName, parentLName, parent_cell, parentEmail);
            let guardianId;

            if (guardianExists) {
                guardianId = guardianExists.g_id;
            } else {
                // **Insert new guardian**
                await Parent.registerGuardian(guardianData);

                // Get inserted guardian's ID
                const newGuardian = await Parent.findGuardian(parentFName, parentLName, parent_cell, parentEmail);
                guardianId = newGuardian.g_id;
            }

            // **Insert new student**
            const studentResult = await Student.registerStudent(
                studentData.fname,
                studentData.MI,
                studentData.lname,
                studentData.DOB,
                studentData.st_address,
                studentData.city,
                studentData.state,
                studentData.zip,
                studentData.st_email,
                studentData.st_cell,
                studentData.student_location,
                studentData.gender
            );
            const studentId = studentResult.insertId;

            // **Insert relationship in student_guardian table**
            await StudentGuardian.createStudentGuardian(guardianId, studentId, relation);

            // ✅ Return JSON response for the portal AJAX request
            return res.status(201).json({
                success: true,
                guardianId,
                studentId,
                message: 'Student registered successfully'
            });
        } catch (error) {
            console.error('Error registering student:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to register student. Please try again.'
            });
        }
    }


    // **Get All Students of a Parent (Guardian)**
    async getStudents(req, res) {
        const parentId = req.session.parentId; // guardian id tied to parent account (if available)
        const parentEmail = req.session.parentEmail;
        if (!parentId && !parentEmail) {
            return res.status(401).json({ success: false, message: 'Parent authentication required' });
        }

        try {
            let students = [];
            if (parentId) {
                students = await Parent.findStudents(parentId);
            }
            if ((!students || students.length === 0) && parentEmail) {
                students = await Student.findByParentEmail(parentEmail);
            }
            res.json(students || []);
        } catch (error) {
            console.error('Error getting students:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    // **Get student classes and grade history for the logged-in parent**
    async getStudentAcademicRecords(req, res) {
        const parentId = req.session.parentId;
        const parentEmail = req.session.parentEmail;

        if (!parentId && !parentEmail) {
            return res.status(401).json({ success: false, message: 'Parent authentication required' });
        }

        try {
            const rawRecords = await Parent.findStudentAcademicRecords({
                guardianId: parentId,
                guardianEmail: parentEmail
            });
            const currentSchoolYear = helper.determineSchoolYear(new Date());

            const records = rawRecords.map((record) => {
                const normalizedSchoolYear = record.term_school_year || record.school_year || null;
                return {
                    studentId: record.student_id,
                    studentName: record.student_name,
                    className: record.class_name,
                    levelId: record.level_id,
                    levelNumber: record.level_number,
                    termId: record.term_id,
                    termName: record.term_name || null,
                    schoolYear: normalizedSchoolYear,
                    midtermGrade: record.midterm_grade !== undefined && record.midterm_grade !== null
                        ? Number(record.midterm_grade)
                        : null,
                    finalGrade: record.final_grade !== undefined && record.final_grade !== null
                        ? Number(record.final_grade)
                        : null,
                    averageGrade: record.average_grade !== undefined && record.average_grade !== null
                        ? Number(record.average_grade)
                        : null,
                    isCurrentYear: !!normalizedSchoolYear && normalizedSchoolYear === currentSchoolYear
                };
            });

            res.json(records);
        } catch (error) {
            console.error('Error getting student academic records:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch academic records.' });
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

    // **Get Guardian Names**
    async getGuardianNames(req, res) {
        try {
            const guardianNames = await Parent.getGuardianNames();
            res.json(guardianNames);
        } catch (error) {
            console.error('Error getting guardian names:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    // Update guardian (admin use)
    async updateGuardian(req, res) {
        const { id } = req.params;
        const updates = req.body || {};

        if (!id) {
            return res.status(400).json({ message: 'Guardian ID is required' });
        }

        try {
            const result = await Parent.updateGuardian(id, updates);
            if (!result.affectedRows) {
                return res.status(404).json({ message: 'Guardian not found or no changes applied' });
            }
            res.json({ message: 'Guardian updated successfully' });
        } catch (error) {
            console.error('Error updating guardian:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    // Delete guardian (admin use)
    async deleteGuardian(req, res) {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: 'Guardian ID is required' });
        }

        try {
            const result = await Parent.deleteGuardian(id);
            if (!result.affectedRows) {
                return res.status(404).json({ message: 'Guardian not found' });
            }
            res.json({ message: 'Guardian removed successfully' });
        } catch (error) {
            console.error('Error deleting guardian:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }


}

module.exports = new ParentController();
