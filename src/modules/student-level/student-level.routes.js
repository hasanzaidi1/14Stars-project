const express = require('express');
const { assignLevel, fetchAssignedLevels } = require('./student-level.controller');
const router = express.Router();

router.post('/assign', assignLevel);
router.get('/assigned', fetchAssignedLevels);

module.exports = router;
