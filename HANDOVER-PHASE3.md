# ON-Sight Phase 3 인수인계 문서

> 작성자: Claude Opus 4.6
> 작성일: 2026-02-15
> 인수자: Google Gemini

---

## 1. 프로젝트 개요

**ON-Sight**는 네트워크 구축 현장 관리 및 증적 자동화 플랫폼입니다.

- **프론트엔드**: React 19 + TypeScript + Vite 6 + Tailwind CSS 4
- **백엔드**: Node.js + Express 4 + Prisma 6 (PostgreSQL)
- **인증**: JWT (8시간 만료) + bcryptjs
- **배포**: Vercel (프론트+API) / Docker Compose (로컬)

## 2. 실행 방법

```bash
# DB 실행 (Docker)
docker start onsight-db-manual   # 또는 docker-compose up db

# 개발 서버 (Vite:5180 + Node:3002)
npm run dev

# 기본 관리자 계정
# ID: admin / PW: admin1234
```

### 환경변수 (.env)
```
PORT=3002
DATABASE_URL="postgresql://postgres:password@127.0.0.1:5432/onsight_db"
JWT_SECRET="..."
ALLOWED_ORIGINS="http://localhost:5173,http://localhost:3001,http://localhost:5180"
```

## 3. 디렉터리 구조 (핵심)

```
src/
├── App.tsx                  # 라우팅, 인증, 상태 관리 (AppInner)
├── components/
│   ├── Toast.tsx            # [Phase2 신규] 전역 Toast 알림 (useToast hook)
│   └── ErrorBoundary.tsx    # [Phase2 신규] 런타임 에러 처리
├── pages/
│   ├── AdminDashboard.tsx   # 관리자 대시보드 (Recharts)
│   ├── TechnicianDashboard.tsx
│   ├── ProjectManagement.tsx
│   ├── ProjectDetail.tsx    # 프로젝트 상세 (사이트/보고서/ZIP 내보내기)
│   ├── AddProject.tsx       # 프로젝트 등록 (CSV 업로드)
│   ├── PartnerManagement.tsx
│   ├── FieldSubmission.tsx  # 현장 보고서 (사진 4장 + 메모)
│   ├── UserManagement.tsx
│   ├── AccountSettings.tsx  # [Phase1 수정] 현재 비밀번호 확인 추가
│   ├── SecuritySettings.tsx
│   └── TechnicianRegistration.tsx
├── services/
│   └── db.ts                # API 서비스 (fetchAPI + 타임아웃 분리)
├── types/
│   └── index.ts             # TypeScript 타입 정의
└── utils/
    └── imageUtils.ts        # 이미지 압축

server/
├── index.js                 # Express 서버 엔트리 (CORS, Rate Limit)
├── controllers/             # authController, projectController, partnerController,
│                            # userController, systemController, auditController
├── routes/                  # API 라우트 정의
├── middlewares/             # authMiddleware, errorMiddleware, uploadMiddleware
└── utils/init.js            # 초기 SUPER 계정 자동 생성
```

## 4. Phase 1~2 완료 내역

### Phase 1 (긴급 수정)
| 항목 | 파일 | 내용 |
|------|------|------|
| API 타임아웃 분리 | `src/services/db.ts` | 일반 10초, FormData 60초, 커스텀 가능 |
| 비밀번호 보안 강화 | `server/controllers/userController.js`, `src/pages/AccountSettings.tsx` | 변경 시 현재 비밀번호 필수 확인 + SUPER 탈퇴 방어 |
| favicon | `public/favicon.svg`, `index.html` | SVG 파비콘 추가 |
| Recharts 경고 | `src/pages/AdminDashboard.tsx` | minWidth/minHeight 지정 + 빈 데이터 Empty State |
| 모바일 줄바꿈 | `AdminDashboard.tsx`, `SecuritySettings.tsx` | whitespace-nowrap, shrink-0 |

### Phase 2 (UI/UX 개선)
| 항목 | 파일 | 내용 |
|------|------|------|
| Toast 알림 | `src/components/Toast.tsx` + 8개 페이지 | 모든 alert() 제거, useToast() hook |
| 한글화 | 다수 | 테이블 헤더, 섹션 제목, 로그인 폼 영문 → 한글 |
| Empty State | `ProjectManagement.tsx` | 데스크탑 테이블 빈 상태 안내 |
| Error Boundary | `src/components/ErrorBoundary.tsx` | 런타임 에러 시 한글 안내 화면 |
| Rate Limit | `server/index.js` | 100 → 300회/15분 (자동 새로고침 고려) |

## 5. Phase 3 작업 목록

아래 항목을 우선순위 순서대로 구현해 주세요.

### 5-1. 감사 로그 조회 UI (예상 4h)
- **현재 상태**: API만 존재 (`GET /api/auditLogs` - SUPER 전용), 프론트엔드 UI 없음
- **구현 내용**: 시스템 설정(`/security`) 또는 별도 페이지에 감사 로그 테이블 추가
- **참고**: `server/controllers/auditController.js`, `server/routes/auditRoutes.js`
- **DB 모델**: `AuditLog { id, timestamp, userId, username, action, targetType, targetId, details(JSON) }`
- **주의**: 페이지네이션 필수 (로그가 대량 누적됨)

### 5-2. 협력사 검색 기능 (예상 1.5h)
- **현재 상태**: `PartnerManagement.tsx`에 검색 없이 테이블만 표시
- **구현 내용**: 프로젝트 관리 페이지처럼 상단에 검색 input 추가
- **패턴 참고**: `ProjectManagement.tsx`의 searchTerm 필터링 로직

### 5-3. 계정 관리 역할별 필터 (예상 1.5h)
- **현재 상태**: `UserManagement.tsx`에 이름/아이디 검색만 있음
- **구현 내용**: SUPER / ADMIN / TECHNICIAN 별 드롭다운 필터 추가
- **패턴 참고**: `ProjectManagement.tsx`의 statusFilter 패턴

### 5-4. 페이지네이션 도입 (예상 3h)
- **현재 상태**: 모든 목록이 전체 로드 (프로젝트, 사용자, 협력사, 감사 로그)
- **구현 내용**: 공통 Pagination 컴포넌트 생성 → 각 목록 페이지에 적용
- **권장**: 프론트엔드 페이지네이션 (현재 데이터량 기준), 추후 서버측 확장 가능하게 설계

### 5-5. 비밀번호 강도 표시기 (예상 1.5h)
- **적용 위치**: `AccountSettings.tsx`, `TechnicianRegistration.tsx`, `UserManagement.tsx` (계정 생성 모달)
- **기존 정책**: 서버에서 8자 이상 + 영문+숫자 혼용 검증 (`userController.js`)
- **구현 내용**: 입력 중 실시간으로 약함/보통/강함 표시 바

### 5-6. CSV 업로드 프리뷰/에러 핸들링 (예상 2h)
- **현재 상태**: `AddProject.tsx`에서 CSV 파싱 후 바로 사이트 목록에 추가
- **구현 내용**: 파싱 결과를 미리보기 테이블로 표시, 오류 행 하이라이트, 확인 후 반영
- **CSV 형식**: `개소명,주소,담당협력사(선택)`

### 5-7. 공통 컴포넌트 분리 (예상 4h)
- **현재 상태**: `src/components/`에 Toast, ErrorBoundary만 있음. 나머지 UI는 각 페이지에 인라인
- **분리 대상**:
  - `Button` (primary, secondary, danger 변형)
  - `Modal` (확인/취소 모달 - 현재 각 페이지에 중복 구현)
  - `Table` (공통 테이블 래퍼)
  - `EmptyState` (빈 데이터 안내)
  - `Badge` (상태 뱃지)
- **참고**: Tailwind 클래스를 그대로 사용하되, 반복 패턴만 추출

## 6. 알려진 이슈 / 주의사항

1. **HashRouter 사용 중**: URL에 `#/`가 포함됨. SEO 불필요하므로 현행 유지 권장
2. **Vite 프록시**: 개발 시 `/api`와 `/uploads`가 `localhost:3002`로 프록시됨
3. **빌드 경고**: 번들 크기 839KB (Recharts가 큼) - 코드 스플리팅 권장하나 Phase 3 범위 외
4. **Vercel 배포**: `server/index.js`가 `module.exports = app`으로 Vercel 서버리스 지원
5. **이미지 업로드**: 클라이언트에서 1200px, 0.7 quality로 압축 후 전송

## 7. 테스트 체크리스트

Phase 3 작업 후 다음을 확인해 주세요:

- [ ] `npx tsc --noEmit` 타입 에러 없음
- [ ] `npx vite build` 빌드 성공
- [ ] 로그인/로그아웃 정상 동작
- [ ] 관리자 대시보드 데이터 로드
- [ ] 보고서 작성 (사진 업로드 포함)
- [ ] 모바일 뷰 (390px) 레이아웃 정상
- [ ] Toast 알림 정상 표시

---

수고하세요. 좋은 코드 부탁드립니다.
