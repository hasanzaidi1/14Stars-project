const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');
const helpers = require('../utils/helpers');

// Admin authentication routes
router.post('/login', adminController.login);
router.post('/register', adminController.registerStudent);
router.get('/all', adminController.getAllStudents);
router.get('/studByName', adminController.getStudByName);
// router.post('/register-teacher', authMiddleware.isAdmin, adminController.registerTeacher);
router.post('/register-parent', adminController.registerParent);
router.get('/all-guardians', adminController.getAllGuardians);
router.post('/assignGuardian', adminController.assignGuardian);
router.get('/getStudentGuardianData', adminController.getStudentGuardianData);
// router.post('/register-substitute', authMiddleware.isAuthenticated, adminController.registerSubstitute);
// router.post('/register-subject', authMiddleware.isAuthenticated, adminController.registerSubject);
// router.post('/register-level', authMiddleware.isAuthenticated, adminController.registerLevel);
// router.post('/register-student-level', authMiddleware.isAuthenticated, adminController.registerStudentLevel);

router.get('/logout', adminController.logout);


module.exports = router;