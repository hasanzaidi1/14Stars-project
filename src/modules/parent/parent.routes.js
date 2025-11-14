const express = require('express');
const router = express.Router();
const parentController = require('./parent.controller');
const { isParent } = require('../../middlewares/authMiddleware');

// Parent authentication routes
router.post('/login', parentController.login);
router.post('/register', parentController.register);
router.get('/logout', parentController.logout);
router.post('/register-from-parent', isParent, parentController.registerStudent);
router.get('/students', isParent, parentController.getStudents);
router.get('/guardianNames', parentController.getGuardianNames);


module.exports = router;
