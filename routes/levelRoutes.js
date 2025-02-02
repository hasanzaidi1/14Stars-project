const express = require('express');
const { fetchLevels, addLevel } = require('../controllers/levelController');
const router = express.Router();

router.get('/', fetchLevels);
router.post('/', addLevel);

module.exports = router;
