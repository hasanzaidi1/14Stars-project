const express = require('express');
const {
    assignTeacherToClass,
    fetchTeacherClassAssignments,
    updateTeacherClass,
    deleteTeacherClass
} = require('./teacher-class.controller');

const router = express.Router();

router.post('/assign', assignTeacherToClass);
router.get('/assigned', fetchTeacherClassAssignments);
router.put('/assigned/:assignmentId', updateTeacherClass);
router.delete('/assigned/:assignmentId', deleteTeacherClass);

module.exports = router;
