const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/', notificationController.getUserNotifications);
router.patch('/:id/read', notificationController.markNotificationRead);
router.patch('/mark-all-read', notificationController.markAllRead);

module.exports = router;