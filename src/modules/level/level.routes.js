const express = require('express');
const { fetchLevels, add } = require('./level.controller');
const router = express.Router();

router.get('/', fetchLevels);
router.post('/', add);

module.exports = router;
