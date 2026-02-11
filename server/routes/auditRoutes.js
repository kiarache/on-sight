const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');

router.get('/auditLogs', authenticateToken, authorizeRole(['SUPER']), auditController.getAuditLogs);
router.post('/auditLogs', authenticateToken, auditController.createAuditLog);

module.exports = router;
