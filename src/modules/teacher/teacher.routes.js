const express = require('express');
const path = require('path');
const router = express.Router();
const teacherController = require('./teacher.controller');
const authMiddleware = require('../../middlewares/authMiddleware');

// Teacher authentication route for login
router.post('/teacher-login', teacherController.login);
router.get('/teacher-logout', teacherController.logout);

// Teacher management routes
// Implement authentication middleware to protect these routes
// router.post('/register', authMiddleware.isAuthenticated, teacherController.registerTeacher);
router.post('/register', teacherController.registerTeacher);
router.get('/all', teacherController.getTeachers);
router.put('/:id', teacherController.updateTeacher);
router.delete('/:id', teacherController.deleteTeacher);

// Teacher portal route
router.get('/teacher_portal', authMiddleware.isTeacher, (req, res) => {
    res.sendFile(path.resolve('public_html/teachers/teacher_portal.html'));
});

module.exports = router;
