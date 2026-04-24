const express = require('express');
const router = express.Router();
const healthLogController = require('../controllers/healthLog.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

router.post('/', healthLogController.createHealthLog);
router.get('/', healthLogController.getHealthLogs);
router.get('/trends', healthLogController.getVitalsTrends);
router.get('/:id', healthLogController.getHealthLogById);
router.put('/:id', healthLogController.updateHealthLog);
router.delete('/:id', healthLogController.deleteHealthLog);

module.exports = router;