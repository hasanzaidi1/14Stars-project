const express = require('express');
const router = express.Router();
const announcementController = require('./announcement.controller');
const authMiddleware = require('../../middlewares/authMiddleware');

router.get('/public', announcementController.listPublic);
router.get('/', authMiddleware.isAdmin, announcementController.listAll);
router.post('/', authMiddleware.isAdmin, announcementController.create);
router.put('/:id', authMiddleware.isAdmin, announcementController.update);
router.delete('/:id', authMiddleware.isAdmin, announcementController.remove);

module.exports = router;
