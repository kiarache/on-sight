const express = require('express');
const router = express.Router();
const systemController = require('../controllers/systemController');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');

router.get('/health', systemController.getHealth);
router.get('/system/settings', systemController.getSettings);
router.post('/system/settings', authenticateToken, authorizeRole(['SUPER']), systemController.updateSettings);
router.get('/system/backup', authenticateToken, authorizeRole(['SUPER']), systemController.downloadBackup);
router.post('/system/restart', authenticateToken, authorizeRole(['SUPER']), systemController.restartService);

module.exports = router;
