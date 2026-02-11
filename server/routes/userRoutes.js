const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');

router.get('/users', authenticateToken, authorizeRole(['SUPER', 'ADMIN']), userController.getUsers);
router.post('/users', authenticateToken, authorizeRole(['SUPER', 'ADMIN']), userController.createUser);
router.post('/users/:id/reset-password', authenticateToken, authorizeRole(['SUPER', 'ADMIN']), userController.resetPassword);
router.delete('/users/:id', authenticateToken, authorizeRole(['SUPER', 'ADMIN']), userController.deleteUser);
router.put('/profile', authenticateToken, userController.updateProfile);
router.delete('/profile', authenticateToken, userController.deleteProfile);

module.exports = router;
