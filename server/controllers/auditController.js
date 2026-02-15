const prisma = require('../config/db');

const getAuditLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit
      }),
      prisma.auditLog.count()
    ]);

    res.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (e) {
    next(e);
  }
};

const createAuditLog = async (req, res, next) => {
  const logData = req.body;
  try {
    // 보안: userId/username은 JWT 토큰에서 추출 (클라이언트 값 무시)
    const log = await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        username: req.user.username,
        action: logData.action,
        targetType: logData.targetType,
        targetId: logData.targetId || null,
        details: logData.details || null,
        timestamp: new Date()
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
