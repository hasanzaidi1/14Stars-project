const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');

// Admin authentication routes
router.post('/login', adminController.login);
router.get('/logout', adminController.logout);


module.exports = router;