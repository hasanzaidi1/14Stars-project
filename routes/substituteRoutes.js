const express = require('express');
const router = express.Router();
const substituteController = require('../controllers/substituteController');

router.post('/register', substituteController.registerSubstitute);
router.get('/fetch', substituteController.fetchSubstitutes);

module.exports = router;
