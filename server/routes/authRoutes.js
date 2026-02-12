const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');

// 보안: 인증 관련 엔드포인트에 강화된 Rate Limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 20, // 15분당 20회
  message: { error: '로그인 시도가 너무 많습니다. 15분 후 다시 시도해주세요.' },
  standardHeaders: true,
  legacyHeaders: false
});

router.post('/login', authLimiter, authController.login);
router.post('/register', authLimiter, authController.register);
router.get('/check-username', authLimiter, authController.checkUsername);

module.exports = router;
