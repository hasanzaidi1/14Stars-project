const Student = require('./student.model');

class StudentController {
    // Register a new student
    async register(req, res) {
        const { fname, MI, lname, DOB, st_address, city, state, zip, st_email, st_cell, student_location } = req.body;

        try {
            // Check if the student already exists
            const existingStudent = await Student.doesExist(fname, lname, DOB);
            if (existingStudent) {
                console.log('Student already exists:', { fname, lname, DOB });
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

    // Find student by name
    async findStudent(req, res) {
        const { fname, lname } = req.body;

        try {
            const student = await Student.findByName(fname, lname);

            res.json({
                message: student ? 'Student found' : 'No student found',
                student
            });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    // Get all students
    async getAll(req, res) {
        try {
            const students = await Student.getAllStudents();
            res.json(students);
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    // Get all students full name
    async getFullName(req, res) {
        try {
            const students = await Student.getAllFullName();
            res.json(students);
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    // Update a student profile
    async update(req, res) {
        const { id } = req.params;
        const updates = req.body || {};

        if (!id) {
            return res.status(400).json({ message: 'Student ID is required' });
        }

        try {
            const result = await Student.updateStudent(id, updates);
            if (!result.affectedRows) {
                return res.status(404).json({ message: 'Student not found or no changes applied' });
            }
            res.json({ message: 'Student updated successfully' });
        } catch (error) {
            console.error('Error updating student:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    // Delete a student profile
    async remove(req, res) {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: 'Student ID is required' });
        }

        try {
            const result = await Student.deleteStudent(id);
            if (!result.affectedRows) {
                return res.status(404).json({ message: 'Student not found' });
            }
            res.json({ message: 'Student removed successfully' });
        } catch (error) {
            console.error('Error deleting student:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}

module.exports = new StudentController();
