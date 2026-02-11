# 1단계: 빌드 스테이지
FROM node:20-alpine AS builder

WORKDIR /app

# 종속성 파일 복사 및 설치
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install

# Prisma 클라이언트 생성
RUN npx prisma generate

# 소스 코드 복사 및 빌드
COPY . .
RUN npm run build

# 2단계: 실행 스테이지
FROM node:20-alpine

WORKDIR /app

# 빌드 결과물 및 필요한 파일만 복사
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# 환경 변수 기본값 설정
ENV PORT=3001
EXPOSE 3001

# 서비스 시작 (Prisma DB Push는 수동 또는 엔트리포인트 스크립트로 처리 권장)
# 여기서는 일반적인 서버 시작 명령을 사용합니다.
CMD ["npm", "start"]
