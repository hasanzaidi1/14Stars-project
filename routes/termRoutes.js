const express = require('express');
const router = express.Router();
const termController = require('../controllers/termController');


router.post('/', termController.createTerm); // Create a new term
router.get('/', termController.getAllTerms); // Get all terms

module.exports = router; // Export the router