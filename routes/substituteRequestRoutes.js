const express = require('express');
const router = express.Router();
const substituteRequestsController = require('../controllers/substituteRequestsController');

router.post('/submit', substituteRequestsController.submitRequest);
router.get('/fetch', substituteRequestsController.fetchRequests);
router.post('/update', substituteRequestsController.updateSatisfiedBy);

module.exports = router;
