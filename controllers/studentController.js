const Student = require('../models/studentModel');
const path = require('path');
const { fn } = require('moment');
const { parseEnv } = require('util');

class StudentController {
    // Register a new student
    async register(req, res) {
        const { fname, MI, lname, DOB, st_address, city, state, zip, st_email, st_cell, student_location } = req.body;

        try {
            // Check if the student already exists
            const existingStudent = await Student.doesExist(fname, lname, DOB);
            if (existingStudent.length > 0) {
                console.log('Student already exists:', existingStudent);
                return res.status(400).json({ message: 'Student already exists' });
            }

            // Insert the new student into the database
            const result = await Student.registerStudent(fname, MI, lname, DOB, st_address, city, state, zip, st_email, st_cell, student_location);
            console.log('New student registered:', result);

            res.status(201).json({ message: 'Student registered successfully' });
        } catch (error) {
            console.error('Error registering student:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}

module.exports = new StudentController();