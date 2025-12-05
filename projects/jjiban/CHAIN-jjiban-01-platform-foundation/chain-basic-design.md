# Chain 기본설계: Platform Foundation

## 문서 정보

| 항목 | 내용 |
|------|------|
| Chain ID | CHAIN-jjiban-01 |
| 관련 PRD | chain-prd.md |
| 문서 버전 | 1.0 |
| 작성일 | 2024-12-06 |
| 상태 | Draft |

---

## 1. 아키텍처 개요

### 1.1 시스템 구조

```
┌─────────────────────────────────────────────────────────────────┐
│                     Frontend (React SPA)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐   │
│  │   Portal     │  │  Component   │  │   Auth Context     │   │
│  │   Layout     │  │   Library    │  │   (JWT)            │   │
│  └──────────────┘  └──────────────┘  └─────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                            │ HTTP/REST
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend (Node.js)                            │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐   │
│  │ Auth         │  │   Config     │  │   Logger           │   │
│  │ Middleware   │  │   Service    │  │   (Winston)        │   │
│  └──────────────┘  └──────────────┘  └─────────────────────┘   │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐   │
│  │ Security     │  │   User       │  │   Error Handler    │   │
│  │ Middleware   │  │   Service    │  │                    │   │
│  └──────────────┘  └──────────────┘  └─────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                            │ Prisma ORM
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SQLite Database                              │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐   │
│  │   User       │  │   Config     │  │   Session          │   │
│  │   Table      │  │   Table      │  │   Table            │   │
│  └──────────────┘  └──────────────┘  └─────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 주요 컴포넌트
- **Portal Layout**: 전역 헤더, 사이드바, 메인 컨텐츠 영역
- **Component Library**: 재사용 가능한 UI 컴포넌트
- **Auth Service**: JWT 기반 인증 및 RBAC
- **Security Middleware**: CORS, Helmet, Rate Limiting
- **Logger**: 구조화된 로깅 (Winston)
- **Prisma ORM**: 데이터베이스 추상화 레이어

---

## 2. 데이터 모델

### 2.1 Prisma Schema (주요 모델)

```prisma
// User Model
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String   // bcrypt hashed
  name      String
  role      String   @default("viewer") // admin, pm, developer, viewer
  avatar    String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  sessions  Session[]
  epics     Epic[]    // created by
}

// Session Model (for JWT Refresh Token)
model Session {
  id           String   @id @default(cuid())
  userId       String
  refreshToken String   @unique
  expiresAt    DateTime
  createdAt    DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// Config Model
model Config {
  id    String @id @default(cuid())
  key   String @unique
  value String // JSON string
  type  String // string, number, boolean, json
}

// Epic Model (핵심 엔티티)
model Epic {
  id          String   @id @default(cuid())
  name        String
  description String?
  prdPath     String?
  startDate   DateTime?
  targetDate  DateTime?
  status      String   @default("active")
  createdById String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  createdBy User    @relation(fields: [createdById], references: [id])
  chains    Chain[]
}

// Chain Model
model Chain {
  id              String   @id @default(cuid())
  epicId          String
  name            String
  description     String?
  pl              String?
  prdPath         String?
  basicDesignPath String?
  startDate       DateTime?
  targetDate      DateTime?
  status          String   @default("planning")
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  epic    Epic     @relation(fields: [epicId], references: [id], onDelete: Cascade)
  modules Module[]
}

// Module Model
model Module {
  id                  String   @id @default(cuid())
  chainId             String
  name                String
  userStory           String?
  assignee            String?
  acceptanceCriteria  String?
  prdPath             String?
  basicDesignPath     String?
  status              String   @default("todo")
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  chain Chain  @relation(fields: [chainId], references: [id], onDelete: Cascade)
  tasks Task[]
}

// Task Model
model Task {
  id             String   @id @default(cuid())
  moduleId       String
  name           String
  description    String?
  type           String   @default("task")
  status         String   @default("todo")
  statusSymbol   String   @default("[ ]")
  assignee       String?
  pl             String?
  priority       String   @default("medium")
  estimatedHours Int?
  actualHours    Int?
  startDate      DateTime?
  dueDate        DateTime?
  branchName     String?
  documentPath   String?
  labels         String?
  llmExecutions  String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  module Module @relation(fields: [moduleId], references: [id], onDelete: Cascade)
}
```

### 2.2 관계도

```
User (1) ──────── (N) Epic
                       │
                       │ (1)
                       │
                      (N) Chain
                           │
                           │ (1)
                           │
                          (N) Module
                               │
                               │ (1)
                               │
                              (N) Task

User (1) ──────── (N) Session (Refresh Token)

Config: Key-Value Store (독립적)
```

---

## 3. API 설계

### 3.1 REST API 엔드포인트

#### Authentication APIs

| Method | 경로 | 설명 | 요청 | 응답 |
|--------|------|------|------|------|
| POST | `/api/auth/register` | 회원가입 | `{ email, password, name }` | `{ user, token }` |
| POST | `/api/auth/login` | 로그인 | `{ email, password }` | `{ user, accessToken, refreshToken }` |
| POST | `/api/auth/refresh` | 토큰 갱신 | `{ refreshToken }` | `{ accessToken }` |
| POST | `/api/auth/logout` | 로그아웃 | `{ refreshToken }` | `{ success: true }` |
| GET | `/api/auth/me` | 현재 사용자 | Header: `Authorization: Bearer {token}` | `{ user }` |

#### User APIs

| Method | 경로 | 설명 | 요청 | 응답 |
|--------|------|------|------|------|
| GET | `/api/users` | 사용자 목록 | Query: `?role=admin` | `{ users[] }` |
| GET | `/api/users/:id` | 사용자 조회 | - | `{ user }` |
| PUT | `/api/users/:id` | 사용자 수정 | `{ name, role, avatar }` | `{ user }` |
| DELETE | `/api/users/:id` | 사용자 삭제 | - | `{ success: true }` |

#### Config APIs

| Method | 경로 | 설명 | 요청 | 응답 |
|--------|------|------|------|------|
| GET | `/api/config` | 설정 전체 조회 | - | `{ config: {} }` |
| GET | `/api/config/:key` | 특정 설정 조회 | - | `{ key, value, type }` |
| PUT | `/api/config/:key` | 설정 수정 | `{ value }` | `{ config }` |

### 3.2 인증 플로우

```
1. 로그인 요청
   Client → POST /api/auth/login { email, password }

2. 서버 검증
   Server → bcrypt.compare(password, user.password)

3. JWT 발급
   Server → jwt.sign({ userId, role }, SECRET, { expiresIn: '15m' })
   Server → refreshToken 생성 및 Session 테이블 저장

4. 토큰 응답
   Server → { accessToken, refreshToken }

5. 클라이언트 저장
   Client → localStorage.setItem('accessToken', token)
   Client → httpOnly cookie에 refreshToken 저장

6. API 요청 시
   Client → Header: Authorization: Bearer {accessToken}

7. 토큰 만료 시
   Client → POST /api/auth/refresh { refreshToken }
   Server → 새 accessToken 발급
```

---

## 4. UI/UX 설계

### 4.1 화면 플로우

```
┌─────────────┐
│   로그인    │
│   /login    │
└──────┬──────┘
       │ 인증 성공
       ▼
┌─────────────────────────────────────────┐
│          Portal Layout                  │
│  ┌───────────────────────────────────┐  │
│  │  Header                           │  │
│  │  [Logo] [Project ▼] [User ▼]     │  │
│  └───────────────────────────────────┘  │
│  ┌──────┐  ┌─────────────────────────┐  │
│  │Side  │  │  Main Content           │  │
│  │bar   │  │                         │  │
│  │      │  │  [칸반/Gantt/설정 등]   │  │
│  │📊    │  │                         │  │
│  │📋    │  │                         │  │
│  │⚙️    │  │                         │  │
│  └──────┘  └─────────────────────────┘  │
└─────────────────────────────────────────┘
```

### 4.2 주요 화면 와이어프레임

#### 로그인 화면
```
┌────────────────────────────────────┐
│                                    │
│        [jjiban Logo]               │
│                                    │
│  ┌──────────────────────────────┐  │
│  │  Email                       │  │
│  │  ________________________    │  │
│  │                              │  │
│  │  Password                    │  │
│  │  ________________________    │  │
│  │                              │  │
│  │  [ ] Remember me             │  │
│  │                              │  │
│  │  [      로그인      ]        │  │
│  │                              │  │
│  │  회원가입 | 비밀번호 찾기    │  │
│  └──────────────────────────────┘  │
│                                    │
└────────────────────────────────────┘
```

#### Portal Header
```
┌─────────────────────────────────────────────────────────────┐
│ [🏠 jjiban]  [Project Alpha ▼]        🔍  🔔  [User ▼]    │
└─────────────────────────────────────────────────────────────┘
```

#### Sidebar Navigation
```
┌──────────────────┐
│                  │
│  📊 대시보드      │
│                  │
│  📋 칸반 보드    │
│                  │
│  📈 Gantt 차트   │
│                  │
│  📝 백로그        │
│                  │
│  🎯 마일스톤     │
│                  │
│  ⚙️ 설정         │
│                  │
│  [  접기  ]      │
│                  │
└──────────────────┘
```

---

## 5. 보안 및 성능

### 5.1 보안 고려사항

#### 인증 보안
- JWT AccessToken 만료 시간: 15분
- RefreshToken 만료 시간: 7일
- 비밀번호 암호화: bcrypt (salt rounds: 10)
- HTTPS 필수 (프로덕션 환경)

#### API 보안
- CORS: 허용 도메인 화이트리스트
- Helmet.js: 보안 HTTP 헤더
  - X-Frame-Options: DENY
  - X-Content-Type-Options: nosniff
  - Strict-Transport-Security: max-age=31536000
- Rate Limiting: 100 req/min per IP
- Input Validation: Joi 또는 Zod
- SQL Injection 방지: Prisma ORM (파라미터화된 쿼리)

#### XSS 방지
- 입력 데이터 Sanitization (DOMPurify)
- Content Security Policy (CSP)
- HttpOnly Cookie (RefreshToken)

#### CSRF 방지
- CSRF 토큰 (폼 제출 시)
- SameSite Cookie 속성

### 5.2 성능 목표

#### Frontend 성능
- First Contentful Paint (FCP): < 1.5초
- Largest Contentful Paint (LCP): < 2.5초
- Time to Interactive (TTI): < 3.5초
- 번들 크기: < 500KB (gzipped)

#### Backend 성능
- API 응답 시간: < 200ms (p95)
- 데이터베이스 쿼리: < 50ms (p95)
- 동시 접속: 최소 50명

#### 최적화 전략
- Code Splitting (React.lazy)
- Tree Shaking
- Image Optimization (WebP, lazy loading)
- Caching (React Query, SWR)
- Database Indexing (자주 조회되는 필드)

---

## 6. 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2024-12-06 | 초안 작성 |
