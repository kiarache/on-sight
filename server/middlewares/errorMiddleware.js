/**
 * 공통 에러 핸들러 미들웨어
 */
const errorHandler = (err, req, res, next) => {
  console.error('[SERVER ERROR]', err);

  const status = err.status || 500;
  const isProduction = process.env.NODE_ENV === 'production';
  
  // 보안: 프로덕션에서는 500 에러의 내부 메시지를 숨김
  let message;
  if (status >= 500 && isProduction) {
    message = '서버 내부 오류가 발생했습니다.';
  } else {
    message = err.message || '서버 내부 오류가 발생했습니다.';
  }

  res.status(status).json({
    error: message
  });
};

module.exports = errorHandler;
