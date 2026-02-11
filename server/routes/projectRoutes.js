const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');

const upload = require('../middlewares/uploadMiddleware');

router.get('/projects', authenticateToken, projectController.getProjects);
router.post('/projects', authenticateToken, authorizeRole(['SUPER', 'ADMIN']), projectController.upsertProject);
router.post('/reports', authenticateToken, upload.array('photos', 10), projectController.addReport);

module.exports = router;
