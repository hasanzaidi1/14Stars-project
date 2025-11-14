const express = require('express');
const router = express.Router();
const substituteController = require('./substitute.controller');

router.post('/register', substituteController.registerSubstitute);
router.get('/fetch', substituteController.fetchSubstitutes);

module.exports = router;
