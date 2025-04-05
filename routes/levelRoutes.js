const express = require('express');
const { fetchLevels, add } = require('../controllers/levelController');
const router = express.Router();

router.get('/', fetchLevels);
router.post('/', add);

module.exports = router;
