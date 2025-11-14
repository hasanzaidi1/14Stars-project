const express = require('express');
const router = express.Router();
const subjectController = require('./subject.controller');

router.post('/add', subjectController.addSubject); // Example: Adding a subject
router.get('/fetch', subjectController.fetchSubjects); // Example: Fetching subjects
router.put('/:id', subjectController.updateSubject);
router.delete('/:id', subjectController.deleteSubject);


module.exports = router;
