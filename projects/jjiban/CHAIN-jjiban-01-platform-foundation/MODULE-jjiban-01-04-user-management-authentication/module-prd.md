# Module PRD: User Management & Authentication

## 문서 정보

| 항목 | 내용 |
|------|------|
| Module ID | MODULE-jjiban-01-04 |
| Module 이름 | User Management & Authentication |
| 문서 버전 | 1.0 |
| 작성일 | 2025-12-06 |
| 상태 | Draft |
| Module 유형 | User Story |
| 예상 기간 | 3주 |
| 상위 Chain | Platform Foundation |
| 원본 Chain PRD | ../chain-prd.md |

---

## 1. Module 개요

### 1.1 User Story
**"As a 사용자, I want 안전하게 로그인하고 내 정보를 관리하고 싶다 so that 내 작업과 권한을 보호받을 수 있다"**

인증(Authentication)과 인가(Authorization)는 시스템 보안의 핵심입니다. JWT 기반의 로그인/로그아웃, 비밀번호 암호화, 그리고 역할 기반 접근 제어(RBAC)를 통해 사용자별 권한을 관리합니다.

### 1.2 범위 (Scope)

**포함:**
- 사용자 등록 및 로그인 (JWT 기반)
- 비밀번호 암호화 (bcrypt)
- 세션 관리 (JWT Refresh Token)
- RBAC (Role-Based Access Control) - Admin, PM, Developer, Viewer
- 사용자 프로필 관리
- 비밀번호 재설정 (이메일 링크)

**제외:**
- 소셜 로그인 (추후 고려)
- LDAP 연동 (Enterprise 버전)

### 1.3 인수 조건 (Acceptance Criteria)
- [ ] JWT 액세스 토큰과 리프레시 토큰을 통한 로그인 유지
- [ ] Admin만 프로젝트 생성 가능 등 권한 제어 동작
- [ ] 비밀번호 해싱 저장 및 검증
- [ ] 로그아웃 시 토큰 무효화

---

## 2. Task 목록

### TASK-jjiban-01-04-01: JWT 및 암호화 유틸리티 구현 (2일)
**설명**: "보안 핵심 로직 구현"

**작업 내용**:
- `jsonwebtoken` 래퍼 (sign, verify)
- `bcryptjs` 래퍼 (hash, compare)
- 환경 변수(비밀키) 안전한 주입

**완료 조건**:
- [ ] 토큰 생성 및 검증 단위 테스트 통과
- [ ] 비밀번호 해싱 및 검증 단위 테스트 통과

---

### TASK-jjiban-01-04-02: Auth API 구현 (3일)
**설명**: "로그인/회원가입 REST API Endpoint"

**작업 내용**:
- `POST /api/auth/register` (회원가입)
- `POST /api/auth/login` (로그인)
- `POST /api/auth/refresh` (토큰 갱신)
- `POST /api/auth/logout` (로그아웃)

**완료 조건**:
- [ ] Postman으로 회원가입 → 로그인 → 토큰 발급 확인
- [ ] 리프레시 토큰으로 액세스 토큰 재발급 확인

---

### TASK-jjiban-01-04-03: Frontend Auth Store & Context (2일)
**설명**: "클라이언트 인증 상태 관리"

**작업 내용**:
- Zustand Auth Store (user, isAuthenticated)
- Axios Interceptor (토큰 자동 첨부 및 401 처리)
- `useAuth()` Hook 구현

**완료 조건**:
- [ ] 새로고침 시 로그인 유지
- [ ] `useAuth().user`로 현재 사용자 정보 접근 가능

---

### TASK-jjiban-01-04-04: 로그인 및 회원가입 화면 (2일)
**설명**: "사용자 인증 UI 구현"

**작업 내용**:
- 로그인 폼 (이메일/비밀번호, 유효성 검사)
- 회원가입 폼
- 프로필 설정 페이지

**완료 조건**:
- [ ] 로그인 성공 시 메인 대시보드로 리다이렉트
- [ ] 입력값 유효성 검사 (이메일 형식, 비밀번호 길이)

---

### TASK-jjiban-01-04-05: RBAC Middleware 구현 (2일)
**설명**: "API 및 라우트 권한 제어"

**작업 내용**:
- Backend: `authorize('ADMIN')` 미들웨어
- Frontend: `<Protect role="ADMIN">` 컴포넌트

**완료 조건**:
- [ ] 일반 사용자가 관리자 API 호출 시 403 Forbidden 반환
- [ ] 권한 없는 메뉴 숨김 처리

---

### TASK-jjiban-01-04-06: 비밀번호 재설정 기능 (2일)
**설명**: "비밀번호 분실 시 복구 흐름"

**작업 내용**:
- 이메일 발송 서비스 연동 (가상)
- 재설정 토큰 생성 및 검증
- 비밀번호 변경 API

**완료 조건**:
- [ ] 재설정 링크를 통해 비밀번호 변경 성공

---

## 3. 의존성

### 3.1 선행 Modules
- MODULE-jjiban-01-03: DB Schema (User 모델)

### 3.2 후행 Modules
- 모든 Feature Chains (로그인 필요)

### 3.3 외부 의존성
- jsonwebtoken
- bcryptjs
- Zustand

---

## 4. 주요 화면/API 목록

### 4.1 화면 목록
| 화면 이름 | 경로 | 설명 | 관련 Task |
|----------|------|------|-----------|
| 로그인 | `/login` | 로그인 폼 | TASK-04 |
| 회원가입 | `/register` | 가입 폼 | TASK-04 |
| 프로필 | `/profile` | 내 정보 수정 | TASK-04 |

### 4.2 API 목록
| API | Method | 경로 | 설명 | 관련 Task |
|-----|--------|------|------|-----------|
| 로그인 | POST | `/api/auth/login` | JWT 발급 | TASK-02 |
| 회원가입 | POST | `/api/auth/register` | 계정 생성 | TASK-02 |
| 토큰갱신 | POST | `/api/auth/refresh` | AccessToken 갱신 | TASK-02 |

---

## 5. 기술 스택

| 레이어 | 기술 | 비고 |
|--------|------|------|
| Auth | JWT | Access(1h), Refresh(7d) |
| Encryption | bcryptjs | Salt Rounds: 10 |

---

## 6. 참조 문서

- 상위 Chain PRD: ../chain-prd.md
- TRD (보안 섹션)

---

## 7. 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2025-12-06 | 초안 작성 |
