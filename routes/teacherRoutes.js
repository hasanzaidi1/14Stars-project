const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const authMiddleware = require('../middlewares/authMiddleware');

// Teacher authentication route for login
router.post('/teacher-login', teacherController.login);
router.get('/teacher-logout', teacherController.logout);

// Teacher management routes
// Implement authentication middleware to protect these routes
// router.post('/register', authMiddleware.isAuthenticated, teacherController.registerTeacher);
router.post('/register', teacherController.registerTeacher);
router.get('/all', teacherController.getTeachers);

// Teacher portal route
router.get('/teacher_portal.html', authMiddleware.isTeacher, (req, res) => {
    res.sendFile(path.join(__dirname, '../public_html/teachers/teacher_portal.html'));
});

module.exports = router;