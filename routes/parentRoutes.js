const express = require('express');
const router = express.Router();
const parentController = require('../controllers/parentController');
const authMiddleware = require('../middlewares/authMiddleware');

// Parent authentication routes
router.post('/login', parentController.login);
router.post('/register', parentController.register);
router.get('/logout', parentController.logout);
router.post('/register-from-parent', parentController.registerStudent);


module.exports = router;