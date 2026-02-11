const prisma = require('../config/db');

const getAuditLogs = async (req, res, next) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 100
    });
    res.json(logs);
  } catch (e) {
    next(e);
  }
};

const createAuditLog = async (req, res, next) => {
  const logData = req.body;
  try {
    const log = await prisma.auditLog.create({
      data: {
        id: logData.id,
        userId: logData.userId,
        username: logData.username,
        action: logData.action,
        targetType: logData.targetType,
        targetId: logData.targetId,
        details: logData.details,
        timestamp: logData.timestamp || new Date()
      }
    });
    res.json(log);
  } catch (e) {
    console.error('Audit Log Error:', e);
    // 로그 저장은 메인 로직을 방해하지 않도록 에러를 무시하거나 경고만 남김
    res.status(200).json({ warning: '로그 저장 실패' }); 
  }
};

module.exports = { getAuditLogs, createAuditLog };
