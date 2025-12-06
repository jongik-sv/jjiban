# Chain PRD: Platform Foundation

## 문서 정보

| 항목 | 내용 |
|------|------|
| Chain ID | CHAIN-jjiban-01 |
| Chain 이름 | Platform Foundation |
| 문서 버전 | 1.0 |
| 작성일 | 2025-12-06 |
| 상태 | Draft |
| Chain 유형 | Platform |
| 예상 기간 | 2-3개월 |
| 상위 EPIC | jjiban - AI-Assisted Development Kanban Tool |
| 원본 PRD | projects/jjiban/jjiban-prd.md |

---

## 1. Chain 개요

### 1.1 Chain 비전
**"모든 기능의 기반이 되는 견고하고 확장 가능한 플랫폼 시스템 구축"**

jjiban 프로젝트의 모든 기능이 안정적으로 작동할 수 있도록 필수적인 인프라와 공통 시스템을 제공합니다. Portal, 인증, 데이터베이스, 보안, DevOps 등 시스템의 기반 요소를 포함합니다.

### 1.2 범위 (Scope)

**포함:**
- Portal & 레이아웃 시스템 (전역 헤더, 사이드바, 네비게이션)
- 디자인 시스템 & 공통 컴포넌트 라이브러리
- 데이터베이스 스키마 설계 및 마이그레이션
- 사용자 관리 & 인증 시스템 (JWT, RBAC)
- 시스템 설정, 로깅, 에러 처리
- 보안 설정 (CORS, Helmet, XSS 방지)
- DevOps 인프라 (Git, CI/CD)
- 실시간 협업 & 알림 (WebSocket)
- 시스템 Health Check & 모니터링

**제외:**
- 비즈니스 로직 구현 (칸반, Gantt 등)
- LLM 통합 기능
- 워크플로우 엔진

### 1.3 성공 지표
- ✅ 모든 공통 컴포넌트가 Storybook에 문서화됨
- ✅ 데이터베이스 마이그레이션이 자동화됨
- ✅ 인증 시스템이 JWT 기반으로 작동하며 RBAC 지원
- ✅ CI/CD 파이프라인이 자동 빌드 및 배포 수행
- ✅ 보안 스캔에서 Critical/High 취약점 0개

---

## 2. Module (기능) 목록

**⚠️ Module은 문서로만 정의하며, 별도 폴더나 module-prd.md는 생성하지 않습니다.**

이 Chain은 다음 Module들로 구성됩니다:

### MODULE-jjiban-01-01: Portal & Layout System (2주)
**비전**: "일관된 사용자 경험을 제공하는 전역 레이아웃 시스템"

**기능**:
- 전역 헤더 (로고, 프로젝트 선택, 사용자 메뉴)
- 사이드바 네비게이션 (메뉴 항목, 접기/펼치기)
- 메인 레이아웃 템플릿 (2-column, 3-column)
- 라우팅 시스템 (React Router v6)
- 브레드크럼 네비게이션

**인수 조건**:
- [ ] 모든 화면에서 일관된 헤더/사이드바 표시
- [ ] 반응형 디자인 (모바일, 태블릿, 데스크톱)
- [ ] 라우팅 전환 시 레이아웃 유지

**예상 Task 수**: 5개

---

### MODULE-jjiban-01-02: Design System & Component Library (3주)
**비전**: "재사용 가능한 UI 컴포넌트 라이브러리"

**기능**:
- 색상 시스템 (Primary, Secondary, Neutral, Semantic)
- 타이포그래피 (Heading, Body, Caption)
- 공통 컴포넌트 (Button, Input, Select, Modal, Dropdown, Card, Table)
- 아이콘 시스템 (Lucide Icons 또는 Heroicons)
- Storybook 문서화

**인수 조건**:
- [ ] 최소 20개 이상의 공통 컴포넌트
- [ ] 모든 컴포넌트가 Storybook에 문서화
- [ ] 다크 모드 지원
- [ ] 접근성 (ARIA) 준수

**예상 Task 수**: 7개

---

### MODULE-jjiban-01-03: Database Schema & ORM (2주)
**비전**: "확장 가능하고 유지보수 가능한 데이터 모델"

**기능**:
- Prisma Schema 정의 (Epic, Chain, Module, Task, User 등)
- 마이그레이션 자동화 (prisma migrate)
- 시드 데이터 생성 스크립트
- 관계 정의 및 인덱스 최적화
- Prisma Client 생성

**인수 조건**:
- [ ] 모든 엔티티가 Prisma Schema에 정의됨
- [ ] 마이그레이션이 자동 실행됨
- [ ] 시드 데이터로 초기 프로젝트 생성 가능
- [ ] 쿼리 성능 최적화 (인덱스)

**예상 Task 수**: 4개

---

### MODULE-jjiban-01-04: User Management & Authentication (3주)
**비전**: "안전하고 확장 가능한 사용자 인증 시스템"

**기능**:
- 사용자 등록 및 로그인 (JWT 기반)
- 비밀번호 암호화 (bcrypt)
- 세션 관리 (JWT Refresh Token)
- RBAC (Role-Based Access Control) - Admin, PM, Developer, Viewer
- 사용자 프로필 관리
- 비밀번호 재설정 (이메일 링크)

**인수 조건**:
- [ ] JWT 기반 인증 구현
- [ ] 4가지 역할 지원 (Admin, PM, Developer, Viewer)
- [ ] 토큰 만료 시 자동 리프레시
- [ ] 비밀번호 강도 검증

**예상 Task 수**: 6개

---

### MODULE-jjiban-01-05: System Configuration & Logging (2주)
**비전**: "운영 환경 관리 및 문제 추적 시스템"

**기능**:
- 환경 변수 관리 (.env, config.json)
- 로깅 시스템 (Winston 또는 Pino)
- 전역 에러 핸들러 (Backend)
- 에러 바운더리 (Frontend)
- 설정 API (GET/PUT /api/config)

**인수 조건**:
- [ ] 환경별 설정 분리 (dev, staging, prod)
- [ ] 모든 에러가 로그에 기록됨
- [ ] 에러 발생 시 사용자 친화적 메시지 표시
- [ ] 로그 레벨 동적 변경 가능

**예상 Task 수**: 4개

---

### MODULE-jjiban-01-06: Security & Protection (2주)
**비전**: "보안 위협으로부터 시스템 보호"

**기능**:
- CORS 설정 (허용 도메인 관리)
- Helmet.js (보안 HTTP 헤더)
- XSS 방지 (입력 검증 및 Sanitization)
- CSRF 토큰 (폼 제출 시)
- Rate Limiting (API 요청 제한)
- SQL Injection 방지 (Prisma ORM)

**인수 조건**:
- [ ] OWASP Top 10 취약점 체크 완료
- [ ] Rate Limiting 적용 (100 req/min per IP)
- [ ] 모든 입력 데이터 검증 및 Sanitization
- [ ] 보안 헤더 적용 (CSP, HSTS 등)

**예상 Task 수**: 5개

---

### MODULE-jjiban-01-07: DevOps & Infrastructure (2주)
**비전**: "자동화된 배포 및 운영 파이프라인"

**기능**:
- Git 브랜치 전략 (main, develop, feature/*, hotfix/*)
- CI/CD 파이프라인 (GitHub Actions 또는 GitLab CI)
- 자동 빌드 및 테스트 실행
- Docker 이미지 빌드 및 배포
- 환경별 배포 스크립트 (dev, staging, prod)

**인수 조건**:
- [ ] Git push 시 자동 빌드 실행
- [ ] 테스트 실패 시 배포 차단
- [ ] Docker 이미지 자동 생성 및 레지스트리 푸시
- [ ] 환경별 배포 자동화

**예상 Task 수**: 5개

---

### MODULE-jjiban-01-08: Real-time Collaboration & Notification (2주)
**비전**: "즉각적인 정보 공유와 원활한 협업 지원"

**기능**:
- WebSocket 이벤트 브로드캐스트 (Socket.IO)
- 인앱 알림 시스템 (Toast, Notification Center)
- Task 할당/리뷰 요청 알림
- 실시간 사용자 활동 표시 (Presence)

**인수 조건**:
- [ ] 중요 이벤트(할당, 댓글) 발생 시 즉시 알림 수신
- [ ] WebSocket 연결 끊김 시 자동 재연결
- [ ] 읽지 않은 알림 카운트 표시
- [ ] 알림 센터에서 지난 알림 조회

**예상 Task 수**: 6개

---

### MODULE-jjiban-01-09: Health Check & Monitoring (1주)
**비전**: "시스템 안정성 모니터링 및 진단"

**기능**:
- GET /api/health (Liveness Probe)
- GET /api/health/detailed (Readiness Probe - DB, FS 등 상세 점검)
- 서버 상태 대시보드 (Admin only)
- 시스템 리소스 사용량 모니터링

**인수 조건**:
- [ ] /api/health 응답 시간 < 100ms
- [ ] DB 연결 실패 시 Unhealthy 상태 반환
- [ ] 관리자 페이지에서 서비스 상태 확인 가능

**예상 Task 수**: 3개

---

### MODULE-jjiban-01-10: Project Settings (1주)
**비전**: "프로젝트(Epic)별 맞춤 설정 관리"

**기능**:
- 프로젝트 설정 화면 (`/projects/:epicId/settings`)
- 워크플로우 커스터마이징 (단계 활성화/비활성화)
- 문서 경로 설정 (기본 경로, 템플릿 경로)
- LLM 프로바이더 선택 (프로젝트별 기본 LLM)
- 라벨 및 우선순위 커스터마이징
- 팀원 권한 관리 (프로젝트 레벨)

**인수 조건**:
- [ ] 프로젝트별 독립 설정 저장
- [ ] 워크플로우 단계 on/off
- [ ] LLM 프로바이더 선택 가능
- [ ] 설정 변경 즉시 반영

**예상 Task 수**: 4개

---

## 3. 의존성

### 3.1 선행 Chains
- 없음 (이 Chain이 모든 다른 Chain의 선행 조건)

### 3.2 후행 Chains (이 Chain에 의존)
- CHAIN-jjiban-02: Core Project Management
- CHAIN-jjiban-03: Workflow & Document Engine
- CHAIN-jjiban-04: LLM Integration & Automation
- CHAIN-jjiban-05: Deployment & CLI Tools

### 3.3 외부 의존성
> **참고**: 상세 버전 정보는 `jjiban-trd.md` 참조

- React ^19.2.x + TypeScript ^5.6.x
- Node.js ^20.x LTS
- Prisma ^7.x + @prisma/adapter-better-sqlite3
- SQLite
- jsonwebtoken ^9.x + bcryptjs ^2.4.x
- Winston ^3.17.x (로깅)
- Helmet.js ^8.x (보안)
- React Router ^7.1.x
- Ant Design ^6.0.x
- Storybook

---

## 4. 주요 화면/API 목록

### 4.1 화면 목록
| 화면 이름 | 경로 | 설명 | 관련 Module |
|----------|------|------|-------------|
| 로그인 | `/login` | 사용자 로그인 | MODULE-01-04 |
| 회원가입 | `/register` | 신규 사용자 등록 | MODULE-01-04 |
| 프로필 설정 | `/profile` | 사용자 프로필 편집 | MODULE-01-04 |
| 시스템 설정 | `/settings` | 전역 설정 관리 | MODULE-01-05 |
| 프로젝트 설정 | `/projects/:epicId/settings` | 프로젝트별 설정 | MODULE-01-10 |

### 4.2 API 목록
| API | Method | 경로 | 설명 | 관련 Module |
|-----|--------|------|------|-------------|
| 로그인 | POST | `/api/auth/login` | JWT 토큰 발급 | MODULE-01-04 |
| 회원가입 | POST | `/api/auth/register` | 신규 사용자 생성 | MODULE-01-04 |
| 토큰 갱신 | POST | `/api/auth/refresh` | Refresh Token으로 갱신 | MODULE-01-04 |
| 사용자 조회 | GET | `/api/users/:id` | 사용자 정보 조회 | MODULE-01-04 |
| 설정 조회 | GET | `/api/config` | 시스템 설정 조회 | MODULE-01-05 |
| 설정 수정 | PUT | `/api/config` | 시스템 설정 변경 | MODULE-01-05 |
| 상태 확인 | GET | `/api/health` | 시스템 생존 확인 | MODULE-01-09 |
| 상세 상태 | GET | `/api/health/detailed` | 상세 상태 점검 | MODULE-01-09 |
| 알림 목록 | GET | `/api/notifications` | 내 알림 조회 | MODULE-01-08 |
| 알림 읽음 | PUT | `/api/notifications/:id` | 알림 읽음 처리 | MODULE-01-08 |
| 프로젝트 설정 조회 | GET | `/api/projects/:epicId/settings` | 프로젝트 설정 조회 | MODULE-01-10 |
| 프로젝트 설정 수정 | PUT | `/api/projects/:epicId/settings` | 프로젝트 설정 변경 | MODULE-01-10 |

---

## 5. 기술 스택

> **참고**: 상세 버전 정보는 `jjiban-trd.md` 참조

| 레이어 | 기술 | 버전 | 비고 |
|--------|------|------|------|
| Frontend | React + TypeScript | ^19.2.x / ^5.6.x | SPA |
| UI Library | Ant Design | ^6.0.x | React 19 네이티브 지원 |
| State Management | Zustand | ^5.x | React 19 호환 |
| Routing | React Router | ^7.1.x | 클라이언트 라우팅 |
| Backend | Express.js | ^5.1.x | REST API 서버 |
| ORM | Prisma | ^7.x | 드라이버 어댑터 필수 |
| Database | SQLite | - | 로컬 파일 기반 DB |
| Authentication | jsonwebtoken + bcryptjs | ^9.x / ^2.4.x | 토큰 기반 인증 |
| Logging | Winston | ^3.17.x | 구조화된 로깅 |
| Security | Helmet.js, CORS, Rate Limiting | ^8.x | 보안 미들웨어 |
| Documentation | Storybook | - | 컴포넌트 문서화 |
| DevOps | GitHub Actions, Docker | - | CI/CD |

---

## 6. 마일스톤

| 마일스톤 | 목표일 | 산출물 |
|----------|--------|--------|
| M1: 레이아웃 & 디자인 시스템 | Week 3 | Portal, 공통 컴포넌트, Storybook |
| M2: DB & 인증 | Week 6 | Prisma Schema, JWT 인증, RBAC |
| M3: 보안 & DevOps | Week 9 | 보안 설정, CI/CD 파이프라인 |
| M4: 통합 테스트 & 문서화 | Week 12 | 테스트 완료, 기술 문서 |

---

## 7. 참조 문서

- 원본 EPIC PRD: `projects/jjiban/jjiban-prd.md`
- Prisma Schema: Section 4.3
- 시스템 아키텍처: Section 4.1-4.2
- 기술 스택: Section 4.2

---

## 8. 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.1 | 2025-12-06 | MODULE-01-10 프로젝트 설정 추가 |
| 1.0 | 2025-12-06 | 초안 작성 |
