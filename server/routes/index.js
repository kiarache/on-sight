const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const systemRoutes = require('./systemRoutes');
const projectRoutes = require('./projectRoutes');
const partnerRoutes = require('./partnerRoutes');
const userRoutes = require('./userRoutes');
const auditRoutes = require('./auditRoutes');

router.use('/', authRoutes);
router.use('/', systemRoutes);
router.use('/', projectRoutes);
router.use('/', partnerRoutes);
router.use('/', userRoutes);
router.use('/', auditRoutes);

module.exports = router;
