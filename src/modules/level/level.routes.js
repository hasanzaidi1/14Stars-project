const express = require('express');
const { fetchLevels, add, update, remove } = require('./level.controller');
const router = express.Router();

router.get('/', fetchLevels);
router.post('/', add);
router.put('/:id', update);
router.delete('/:id', remove);

module.exports = router;
