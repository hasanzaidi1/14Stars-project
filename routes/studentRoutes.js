const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

// Registering a new student
router.post('/register', studentController.register); // Example: Registering a student
// Find student by Name 
router.post('/find', studentController.findStudent); // Find student by first or last name
// Get all students
router.get('/all', studentController.getAll); // Get all students


module.exports = router;
