const multer = require('multer');

// Vercel(Serverless) 환경 대응을 위해 메모리 스토리지 사용
const storage = multer.memoryStorage();

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

module.exports = upload;
