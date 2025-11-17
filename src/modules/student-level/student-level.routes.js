const express = require('express');
const { assignLevel, fetchAssignedLevels, updateAssignment, deleteAssignment } = require('./student-level.controller');
const router = express.Router();

router.post('/assign', assignLevel);
router.get('/assigned', fetchAssignedLevels);
router.put('/assigned', updateAssignment);
router.delete('/assigned', deleteAssignment);

module.exports = router;
