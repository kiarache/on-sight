const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { initializeSystem } = require('./utils/init');
const apiRoutes = require('./routes');

const app = express();
const port = process.env.PORT || 3001;

// Basic configuration checks
if (!process.env.JWT_SECRET) {
  console.error('❌ FATAL: JWT_SECRET environment variable is missing.');
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL is not defined in .env file.');
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// API Routes
app.use('/api', apiRoutes);

// Error Handler (반드시 라우트 뒤에 위치)
const errorHandler = require('./middlewares/errorMiddleware');
app.use(errorHandler);

// Static Files & SPA
app.use(express.static(path.join(__dirname, '../dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

// Initialize System (Serverless 환경에서도 실행되도록 listen 밖으로 이동)
// Vercel은 cold start마다 실행되므로, 여기서의 에러가 전체 함수 종료로 이어지지 않게 주의
initializeSystem().catch(err => console.error('[INIT ERROR]', err));

// Start Server (로컬 실행용)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
  });
}

// Vercel용 Export
module.exports = app;
