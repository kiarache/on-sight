const prisma = require('../config/db');
const bcrypt = require('bcryptjs');

const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, username: true, name: true, role: true, createdAt: true }
    });
    res.json(users);
  } catch (e) {
    next(e);
  }
};

const createUser = async (req, res) => {
  const u = req.body;
  const requesterRole = req.user.role;

  try {
    // 보안: SUPER 역할은 오직 SUPER만 생성 가능
    if (u.role === 'SUPER' && requesterRole !== 'SUPER') {
      return res.status(403).json({ error: '최고 관리자 계정을 생성할 권한이 없습니다.' });
    }

      // K2: username 입력값 검증
      const usernameRegex = /^[a-zA-Z0-9]{4,20}$/;
      if (!usernameRegex.test(u.username)) {
        return res.status(400).json({ error: `유효하지 않은 아이디: ${u.username} (영문자+숫자 4-20자)` });
      }
      
    // 보안: 반드시 password를 통해 해시 생성 (passwordHash 직접 전달 차단)
    if (!u.password) {
      return res.status(400).json({ error: '비밀번호는 필수 항목입니다.' });
    }
    
    // V14: 비밀번호 강도 검증
    if (u.password.length < 8) {
      return res.status(400).json({ error: '비밀번호는 최소 8자 이상이어야 합니다.' });
    }
    
    const passwordHash = await bcrypt.hash(u.password, 10);
    const userData = {
      id: u.id || `user-${Date.now()}`,
      username: u.username,
      passwordHash: passwordHash,
      name: u.name,
      role: u.role || 'TECHNICIAN',
      partnerId: u.partnerId || null,
      partnerName: u.partnerName || null
    };
    const user = await prisma.user.create({
      data: userData,
      select: { id: true, username: true, name: true, role: true, createdAt: true }
    });
    res.json(user);
  } catch (err) {
    err.status = 400;
    err.message = '이미 존재하는 아이디이거나 생성에 실패했습니다.';
    next(err);
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  const requesterRole = req.user.role;
  const requesterId = req.user.id;

  try {
    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });

    // 보안 로직
    if (requesterRole === 'ADMIN') {
      // ADMIN은 SUPER를 삭제할 수 없음
      if (targetUser.role === 'SUPER') {
        return res.status(403).json({ error: '최고 관리자 계정은 삭제할 수 없습니다.' });
      }
      // ADMIN은 자기 자신을 삭제할 수 없음 (Profile 삭제에서 처리됨)
      if (targetUser.id === requesterId) {
        return res.status(400).json({ error: '계정 관리에서는 자기 자신을 삭제할 수 없습니다.' });
      }
    }

    await prisma.user.delete({ where: { id } });
    res.json({ success: true });
  } catch (e) {
    e.status = 400;
    next(e);
  }
};

const resetPassword = async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;
  const requesterRole = req.user.role;

  // 보안: newPassword 필수 + 최소 길이 검증
  if (!newPassword || newPassword.length < 4) {
    return res.status(400).json({ error: '새 비밀번호는 최소 4자 이상이어야 합니다.' });
  }

  try {
    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });

    // 보안 로직: ADMIN은 SUPER의 비밀번호를 초기화할 수 없음
    if (requesterRole === 'ADMIN' && targetUser.role === 'SUPER') {
      return res.status(403).json({ error: '최고 관리자의 비밀번호를 초기화할 권한이 없습니다.' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id },
      data: { passwordHash }
    });

    res.json({ success: true, message: '비밀번호가 초기화되었습니다.' });
  } catch (err) {
    err.status = 400;
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  const { name, password, currentPassword } = req.body;
  const userId = req.user.id;

  try {
    const updateData = { name };

    if (password) {
      // 비밀번호 변경 시 현재 비밀번호 필수 확인
      if (!currentPassword) {
        return res.status(400).json({ error: '현재 비밀번호를 입력해주세요.' });
      }

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isMatch) {
        return res.status(400).json({ error: '현재 비밀번호가 올바르지 않습니다.' });
      }

      // V14: 비밀번호 변경 시 강도 검증
      if (password.length < 8) {
        return res.status(400).json({ error: '비밀번호는 최소 8자 이상이어야 합니다.' });
      }

      // K3: 비밀번호 복잡도 검증
      const hasLetter = /[a-zA-Z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      if (!hasLetter || !hasNumber) {
        return res.status(400).json({ error: '비밀번호는 영문자와 숫자를 혼용해야 합니다.' });
      }

      updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, username: true, name: true, role: true }
    });

    res.json(updatedUser);
  } catch (e) {
    e.status = 400;
    next(e);
  }
};

const deleteProfile = async (req, res, next) => {
  const userId = req.user.id;
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user && user.role === 'SUPER') {
      const superCount = await prisma.user.count({ where: { role: 'SUPER' } });
      if (superCount <= 1) {
        return res.status(400).json({ error: '유일한 최고 관리자 계정은 탈퇴할 수 없습니다.' });
      }
    }
    await prisma.user.delete({ where: { id: userId } });
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
};

module.exports = { getUsers, createUser, deleteUser, updateProfile, deleteProfile, resetPassword };
