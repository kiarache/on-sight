const prisma = require('../config/db');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

async function initializeSystem() {
  try {
    const adminUsername = 'admin';
    const defaultPassword = 'admin1234';
    
    // Check if admin exists
    let admin = await prisma.user.findUnique({ where: { username: adminUsername } });
    
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    if (!admin) {
      await prisma.user.create({
        data: {
          id: 'super-admin-id',
          username: adminUsername,
          passwordHash: hashedPassword,
          name: '시스템 관리자',
          role: 'SUPER'
        }
      });
      console.log('✅ 최고 관리자 계정 신규 생성 완료 (admin / admin1234)');
    } else {
      // 기존 계정이 있더라도 패스워드를 기본값으로 강제 리셋 (배포 환경 초기 진입용)
      await prisma.user.update({
        where: { username: adminUsername },
        data: { passwordHash: hashedPassword, role: 'SUPER' }
      });
      console.log('ℹ️ 최고 관리자 계정 비밀번호 강제 동기화 완료 (admin1234)');
    }
  } catch (err) {
    console.error('❌ 시스템 초기화 중 치명적 오류:', err.message);
  }
}

module.exports = { initializeSystem };
