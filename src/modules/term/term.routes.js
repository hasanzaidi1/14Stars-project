const express = require('express');
const router = express.Router();
const termController = require('./term.controller');


router.post('/', termController.createTerm); // Create a new term
router.get('/', termController.getAllTerms); // Get all terms
router.put('/:id', termController.updateTerm);
router.delete('/:id', termController.deleteTerm);

module.exports = router; // Export the router
