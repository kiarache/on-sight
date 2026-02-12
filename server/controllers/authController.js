const prisma = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

const login = async (req, res, next) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    const err = new Error('아이디와 비밀번호를 입력해주세요.');
    err.status = 400;
    return next(err);
  }

  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      const err = new Error('아이디를 확인해주세요.');
      err.status = 401;
      return next(err);
    }
    
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      const err = new Error('비밀번호가 일치하지 않습니다.');
      err.status = 401;
      return next(err);
    }
    
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '8h' }
    );
    
    res.json({ token, user: { id: user.id, username: user.username, role: user.role, name: user.name } });
  } catch (err) {
    next(err);
  }
};

const register = async (req, res, next) => {
  const u = req.body;
  try {
    if (!u || !u.username || !u.password || !u.name) {
      const err = new Error('필수 정보가 누락되었습니다.');
      err.status = 400;
      return next(err);
    }
    
    // V14: 비밀번호 강도 검증 (OWASP A07)
    if (u.password.length < 8) {
      const err = new Error('비밀번호는 최소 8자 이상이어야 합니다.');
      err.status = 400;
      return next(err);
    }
    
    // 영문자+숫자 혼용 권장 (경고)
    const hasLetter = /[a-zA-Z]/.test(u.password);
    const hasNumber = /[0-9]/.test(u.password);
    if (!hasLetter || !hasNumber) {
      console.warn(`[SECURITY] Weak password registered for user: ${u.username}`);
    }
    
    const passwordHash = await bcrypt.hash(u.password, 10);
    
    const userData = {
      id: u.id || `user-${Date.now()}`,
      username: u.username,
      passwordHash: passwordHash,
      name: u.name,
      role: 'TECHNICIAN',
      partnerId: u.partnerId || null,
      partnerName: u.partnerName || null,
      createdAt: new Date()
    };
    
    const user = await prisma.user.create({
      data: userData,
      select: { id: true, username: true, name: true, role: true, createdAt: true }
    });
    res.json(user);
  } catch (err) {
    err.status = 400;
    err.message = '이미 존재하는 아이디이거나 가입에 실패했습니다.';
    next(err);
  }
};

const checkUsername = async (req, res, next) => {
  const { username } = req.query;
  if (!username) {
    const err = new Error('아이디를 입력해주세요.');
    err.status = 400;
    return next(err);
  }
  try {
    const user = await prisma.user.findUnique({ where: { username } });
    res.json({ available: !user });
  } catch (e) {
    next(e);
  }
};

module.exports = { login, register, checkUsername };
