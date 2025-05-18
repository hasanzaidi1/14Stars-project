const path = require('path');
const helpers = require('../utils/helpers');
const StudentModel = require('../models/studentModel');
const AdminModel = require('../models/adminModel');
const ParentModel = require('../models/parentModel');
const TermModel = require('../models/termModel');

class TermController {
    // Create a new term
    static async createTerm(req, res) {
        try {
            const termData = req.body;
            const result = await TermModel.create(termData);
            res.status(201).json({ message: 'Term created successfully', term: result });
        } catch (error) {
            console.error('Error creating term:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    // Fetch all terms
    static async getAllTerms(req, res) {
        try {
            const terms = await TermModel.findAll();
            res.status(200).json(terms);
            console.log(terms)
        } catch (error) {
            console.error('Error fetching terms:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}

module.exports = TermController; // Export the controller

