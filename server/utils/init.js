const prisma = require('../config/db');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

async function initializeSystem() {
  try {
    const adminUsername = 'admin';
    
    // Check if admin exists
    const admin = await prisma.user.findUnique({ where: { username: adminUsername } });

    if (!admin) {
      // 최초 생성 시에만 기본 비밀번호 설정
      const defaultPassword = 'admin1234';
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);
      
      await prisma.user.create({
        data: {
          id: 'super-admin-id',
          username: adminUsername,
          passwordHash: hashedPassword,
          name: '시스템 관리자',
          role: 'SUPER'
        }
      });
      console.log('✅ 최고 관리자 계정 신규 생성 완료 (초기 비밀번호로 로그인 후 반드시 변경하세요)');
    } else {
      console.log('ℹ️ 최고 관리자 계정이 이미 존재합니다.');
    }
  } catch (err) {
    console.error('❌ 시스템 초기화 중 치명적 오류:', err.message);
  }
}

module.exports = { initializeSystem };
