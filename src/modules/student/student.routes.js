const express = require('express');
const router = express.Router();
const studentController = require('./student.controller');

// Registering a new student
router.post('/register', studentController.register); // Example: Registering a student
// Find student by Name 
router.post('/find', studentController.findStudent); // Find student by first or last name
// Get all students
router.get('/all', studentController.getAll); // Get all students
// Get student full Name
router.get('/fullName', studentController.getFullName); // Get student full name

// Update student
router.put('/:id', studentController.update);

// Delete student
router.delete('/:id', studentController.remove);

module.exports = router;
