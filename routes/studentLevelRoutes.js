const express = require('express');
const { assignLevel, fetchAssignedLevels } = require('../controllers/studentLevelController');
const router = express.Router();

router.post('/assign', assignLevel);
router.get('/assigned', fetchAssignedLevels);

module.exports = router;
