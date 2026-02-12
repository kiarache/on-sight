const prisma = require('../config/db');

const getHealth = async (req, res) => {
  try {
    // V13: SQL Injection 방어 - Prisma $queryRaw는 템플릿 리터럴로 자동 이스케이프
    // 동적 쿼리 작성 시 반드시 파라미터화 사용: prisma.$queryRaw`SELECT * FROM users WHERE id = ${userId}`
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'ok' });
  } catch (e) {
    console.error('Health Check - Database error:', e);
    res.json({ status: 'ok', database: 'error' });
  }
};

const getSettings = async (req, res) => {
  try {
    let settings = await prisma.systemSettings.findUnique({ where: { id: 'default' } });
    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: {
          id: 'default',
          terms: `[개인정보 수집 및 이용 동의서]

1. 수집 항목: 성명, 연락처, 소속 협력사
2. 수집 목적: 현장 구축 보고서 작성 및 본인 확인
3. 보유 기간: 서비스 이용 종료 시 혹은 데이터 파기 요청 시까지

위 사항에 동의해야만 서비스 이용이 가능합니다.`
        }
      });
    }
    res.json(settings);
  } catch (e) {
    res.status(500).json({ error: '설정 조회 실패' });
  }
};

const updateSettings = async (req, res, next) => {
  const { terms } = req.body;
  try {
    const settings = await prisma.systemSettings.upsert({
      where: { id: 'default' },
      update: { terms },
      create: { id: 'default', terms }
    });
    res.json(settings);
  } catch (e) {
    e.status = 400;
    next(e);
  }
};

const downloadBackup = async (req, res, next) => {
  try {
    // 모든 테이블 데이터 수집
    const [users, projects, partners, settings, logs] = await Promise.all([
      prisma.user.findMany({
        select: { id: true, username: true, name: true, role: true, createdAt: true }
      }),
      prisma.project.findMany(),
      prisma.partner.findMany(),
      prisma.systemSettings.findMany(),
      prisma.auditLog.findMany()
    ]);

    const backupData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      data: {
        users,
        projects,
        partners,
        systemSettings: settings,
        auditLogs: logs
      }
    };

    const fileName = `onsight_backup_${new Date().toISOString().split('T')[0]}.json`;
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    res.send(JSON.stringify(backupData, null, 2));
  } catch (e) {
    next(e);
  }
};

const restartService = async (req, res, next) => {
  try {
    res.json({ success: true, message: '서버가 재기동됩니다. 잠시 후 새로고침하세요.' });
    
    console.log('[SYSTEM] Service restart requested by admin.');
    
    setTimeout(() => {
      process.exit(0);
    }, 1000);
  } catch (e) {
    next(e);
  }
};

module.exports = { getHealth, getSettings, updateSettings, downloadBackup, restartService };
