const express = require('express');
const router = express.Router();
const partnerController = require('../controllers/partnerController');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');

router.get('/public/partners', partnerController.getPublicPartners);
router.get('/partners', authenticateToken, partnerController.getPartners);
router.post('/partners', authenticateToken, authorizeRole(['SUPER', 'ADMIN']), partnerController.upsertPartner);
router.delete('/partners/:id', authenticateToken, authorizeRole(['SUPER', 'ADMIN']), partnerController.deletePartner);

module.exports = router;
