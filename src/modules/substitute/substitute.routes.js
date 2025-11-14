const express = require('express');
const router = express.Router();
const substituteController = require('./substitute.controller');

router.post('/register', substituteController.registerSubstitute);
router.get('/fetch', substituteController.fetchSubstitutes);
router.put('/:id', substituteController.updateSubstitute);
router.delete('/:id', substituteController.deleteSubstitute);

module.exports = router;
