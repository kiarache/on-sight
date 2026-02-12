const prisma = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

// K1: 로그인 실패 횟수 제한 (KISA 보안 기능)
const loginAttempts = new Map(); // { username: { count: number, lockedUntil: Date } }
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME_MS = 15 * 60 * 1000; // 15분

const login = async (req, res, next) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    const err = new Error('아이디와 비밀번호를 입력해주세요.');
    err.status = 400;
    return next(err);
  }
  
  // K2: username 입력값 검증 (KISA 입력값 검증)
  const usernameRegex = /^[a-zA-Z0-9]{4,20}$/;
  if (!usernameRegex.test(username)) {
    const err = new Error('아이디는 영문자와 숫자만 사용하여 4-20자로 입력해주세요.');
    err.status = 400;
    return next(err);
  }

  // K1: 계정 잠금 확인
  const attempt = loginAttempts.get(username);
  if (attempt && attempt.lockedUntil > new Date()) {
    const remainingMinutes = Math.ceil((attempt.lockedUntil - new Date()) / 60000);
    const err = new Error(`너무 많은 로그인 시도로 계정이 잠겼습니다. ${remainingMinutes}분 후 다시 시도해주세요.`);
    err.status = 429;
    return next(err);
  }

  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      // K1: 실패 횟수 증가
      incrementLoginAttempts(username);
      
      // K4: 에러 메시지 통일 (KISA 에러 처리)
      const err = new Error('아이디 또는 비밀번호가 일치하지 않습니다.');
      err.status = 401;
      return next(err);
    }
    
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      // K1: 실패 횟수 증가
      incrementLoginAttempts(username);
      
      // K4: 에러 메시지 통일
      const err = new Error('아이디 또는 비밀번호가 일치하지 않습니다.');
      err.status = 401;
      return next(err);
    }
    
    // K1: 로그인 성공 시 실패 기록 삭제
    loginAttempts.delete(username);
    
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

// K1: 로그인 실패 횟수 증가 함수
function incrementLoginAttempts(username) {
  const attempt = loginAttempts.get(username) || { count: 0, lockedUntil: null };
  attempt.count += 1;
  
  if (attempt.count >= MAX_LOGIN_ATTEMPTS) {
    attempt.lockedUntil = new Date(Date.now() + LOCK_TIME_MS);
    console.warn(`[SECURITY] Account locked for 15 minutes: ${username}`);
  }
  
  loginAttempts.set(username, attempt);
}

const register = async (req, res, next) => {
  const u = req.body;
  try {
    if (!u || !u.username || !u.password || !u.name) {
      const err = new Error('필수 정보가 누락되었습니다.');
      err.status = 400;
      return next(err);
    }
    
    // K2: username 입력값 검증 (KISA 입력값 검증)
    const usernameRegex = /^[a-zA-Z0-9]{4,20}$/;
    if (!usernameRegex.test(u.username)) {
      const err = new Error('아이디는 영문자와 숫자만 사용하여 4-20자로 입력해주세요.');
      err.status = 400;
      return next(err);
    }
    
    // V14: 비밀번호 강도 검증 (OWASP A07)
    if (u.password.length < 8) {
      const err = new Error('비밀번호는 최소 8자 이상이어야 합니다.');
      err.status = 400;
      return next(err);
    }
    
    // K3: 비밀번호 복잡도 강화 (KISA 보안 기능)
    const hasLetter = /[a-zA-Z]/.test(u.password);
    const hasNumber = /[0-9]/.test(u.password);
    if (!hasLetter || !hasNumber) {
      const err = new Error('비밀번호는 영문자와 숫자를 혼용해야 합니다.');
      err.status = 400;
      return next(err);
    }
    
    // 특수문자 권장
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(u.password);
    if (!hasSpecial) {
      console.warn(`[SECURITY] Password without special characters for user: ${u.username}`);
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
