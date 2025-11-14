const express = require('express');
const router = express.Router();
const parentController = require('./parent.controller');

// Parent authentication routes
router.post('/login', parentController.login);
router.post('/register', parentController.register);
router.get('/logout', parentController.logout);
router.post('/register-from-parent', parentController.registerStudent);
router.post('/students', parentController.getStudentsByParentEmail);
router.get('/guardianNames', parentController.getGuardianNames);


module.exports = router;
