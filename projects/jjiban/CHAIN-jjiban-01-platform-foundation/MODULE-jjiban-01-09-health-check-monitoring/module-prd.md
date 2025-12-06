# Module PRD: Health Check & Monitoring

## 문서 정보

| 항목 | 내용 |
|------|------|
| Module ID | MODULE-jjiban-01-09 |
| Module 이름 | Health Check & Monitoring |
| 문서 버전 | 1.0 |
| 작성일 | 2025-12-06 |
| 상태 | Draft |
| Module 유형 | User Story |
| 예상 기간 | 1주 |
| 상위 Chain | Platform Foundation |
| 원본 Chain PRD | ../chain-prd.md |

---

## 1. Module 개요

### 1.1 User Story
**"As a 운영자, I want 시스템 상태를 주기적으로 확인하고 싶다 so that 장애 발생 시 즉시 인지할 수 있다"**

시스템이 살아있는지(Liveness)와 서비스를 제공할 준비가 되었는지(Readiness)를 판단하는 API를 제공합니다. 또한 관리자 페이지에서 시스템 리소스와 주요 서비스 상태를 대시보드 형태로 제공합니다.

### 1.2 범위 (Scope)

**포함:**
- GET /api/health (Liveness Probe - 단순 응답)
- GET /api/health/detailed (Readiness Probe - DB, FS 등 상세 점검)
- 서버 상태 대시보드 (Admin only)
- 시스템 메모리/CPU 사용량 모니터링

**제외:**
- Prometheus/Grafana 연동 (DevOps 모듈)

### 1.3 인수 조건 (Acceptance Criteria)
- [ ] /api/health Endpoint가 200 OK 반환
- [ ] DB 연결 끊김 시 /api/health/detailed에서 503 반환
- [ ] 관리자 대시보드에서 각 모듈별 상태(초록/빨강) 표시

---

## 2. Task 목록

### TASK-jjiban-01-09-01: Health API 구현 (0.5일)
**설명**: "기본 Liveness Probe"

**작업 내용**:
- `/api/health` 라우트 추가
- 서버 기동 시간(Uptime) 반환

**완료 조건**:
- [ ] 응답 시간 100ms 미만

---

### TASK-jjiban-01-09-02: Detailed Health Service (1.5일)
**설명**: "상세 Readiness Probe"

**작업 내용**:
- DB 접속 테스트 로직
- 파일 쓰기/읽기 권한 테스트 로직
- `/api/health/detailed` 라우트

**완료 조건**:
- [ ] 각 의존성 상태 JSON 반환 `{ db: 'up', fs: 'up' }`

---

### TASK-jjiban-01-09-03: System Dashboard UI (1일)
**설명**: "관리자용 상태 대시보드"

**작업 내용**:
- 상태 표시 카드 컴포넌트
- 주기적(30초) 폴링 로직
- 관리자 권한 체크 (`<Protect role="ADMIN" />`)

**완료 조건**:
- [ ] 문제가 있는 서비스가 빨간색으로 표시됨

---

## 3. 의존성

### 3.1 선행 Modules
- MODULE-jjiban-01-03: DB (연결 테스트용)

### 3.2 후행 Modules
- 없음

### 3.3 외부 의존성
- `process.uptime()`
- `os` module

---

## 4. 주요 화면/API 목록

### 4.1 화면 목록
| 화면 이름 | 경로 | 설명 | 관련 Task |
|----------|------|------|-----------|
| 시스템 모니터링 | `/admin/monitor` | 상태 대시보드 | TASK-03 |

### 4.2 API 목록
| API | Method | 경로 | 설명 | 관련 Task |
|-----|--------|------|------|-----------|
| 상태 확인 | GET | `/api/health` | Liveness | TASK-01 |
| 상세 상태 | GET | `/api/health/detailed` | Readiness | TASK-02 |

---

## 5. 기술 스택

| 레이어 | 기술 | 비고 |
|--------|------|------|
| Monitoring | Node.js OS Module | native |

---

## 6. 참조 문서

- 상위 Chain PRD: ../chain-prd.md

---

## 7. 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2025-12-06 | 초안 작성 |
