const multer = require('multer');

// Vercel(Serverless) 환경 대응을 위해 메모리 스토리지 사용
const storage = multer.memoryStorage();

// 보안: 허용 파일 타입을 이미지로 제한
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`허용되지 않는 파일 형식입니다: ${file.mimetype}. 이미지 파일(JPEG, PNG, WebP, GIF)만 업로드 가능합니다.`), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

module.exports = upload;
