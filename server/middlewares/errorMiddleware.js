/**
 * 공통 에러 핸들러 미들웨어
 */
const errorHandler = (err, req, res, next) => {
  console.error('[SERVER ERROR]', err);

  const status = err.status || 500;
  const message = err.message || '서버 내부 오류가 발생했습니다.';

  res.status(status).json({
    error: message,
    code: err.code || 'INTERNAL_SERVER_ERROR',
    timestamp: new Date().toISOString()
  });
};

module.exports = errorHandler;
