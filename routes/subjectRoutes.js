const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subjectController');

router.post('/add', subjectController.addSubject); // Example: Adding a subject
router.get('/fetch', subjectController.fetchSubjects); // Example: Fetching subjects


module.exports = router;
