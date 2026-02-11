const prisma = require('../config/db');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

async function initializeSystem() {
  try {
    const adminUsername = 'admin';
    const defaultPassword = 'admin1234';
    
    // Check if admin exists
    const adminExists = await prisma.user.findUnique({ where: { username: adminUsername } });
    
    if (!adminExists) {
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
      console.log('✅ 최고 관리자 계정 생성 완료 (admin / admin1234)');
    } else {
      console.log('ℹ️ 최고 관리자 계정 확인 완료');
    }
  } catch (err) {
    console.error('❌ 초기화 오류:', err.message);
  }
}

module.exports = { initializeSystem };
