# Module PRD: Security & Protection

## 문서 정보

| 항목 | 내용 |
|------|------|
| Module ID | MODULE-jjiban-01-06 |
| Module 이름 | Security & Protection |
| 문서 버전 | 1.0 |
| 작성일 | 2025-12-06 |
| 상태 | Draft |
| Module 유형 | User Story |
| 예상 기간 | 2주 |
| 상위 Chain | Platform Foundation |
| 원본 Chain PRD | ../chain-prd.md |

---

## 1. Module 개요

### 1.1 User Story
**"As a 보안 관리자, I want 시스템이 일반적인 웹 위협으로부터 안전하기를 원한다 so that 데이터 유출이나 서비스 중단을 방지할 수 있다"**

jjiban은 로컬/인트라넷 환경에서 주로 사용되지만, 웹 기반이므로 기본적인 웹 보안 수칙을 준수해야 합니다. OWASP Top 10을 기준으로 필수적인 방어 기제를 구현합니다.

### 1.2 범위 (Scope)

**포함:**
- CORS 설정 (허용 도메인 관리)
- Helmet.js (보안 HTTP 헤더)
- XSS 방지 (입력 검증 및 Sanitization)
- CSRF 토큰 (폼 제출 시)
- Rate Limiting (API 요청 제한)
- SQL Injection 방지 (Prisma ORM 활용)
- Request Validation (Zod)

**제외:**
- 고급 침입 탐지 시스템 (IDS/IPS)
- 하드웨어 보안 모듈 (HSM)

### 1.3 인수 조건 (Acceptance Criteria)
- [ ] API에 대한 무작위 대량 요청 시 Rate Limit 작동
- [ ] 스크립트 태그가 포함된 입력 저장 시 이스케이핑 또는 거부
- [ ] 적절한 Security Header (HSTS, X-Frame-Options 등) 응답 확인

---

## 2. Task 목록

### TASK-jjiban-01-06-01: Helmet 및 CORS 설정 (1일)
**설명**: "기초 보안 헤더 및 도메인 제어"

**작업 내용**:
- `helmet` 미들웨어 적용
- `cors` 미들웨어 설정 (Whitelist 기반)

**완료 조건**:
- [ ] 응답 헤더에 `Content-Security-Policy` 등 포함 확인

---

### TASK-jjiban-01-06-02: Rate Limiting 구현 (1일)
**설명**: "DoS 공격 방어"

**작업 내용**:
- `express-rate-limit` 적용
- IP별 요청 제한 설정 (windowMs, max)

**완료 조건**:
- [ ] 제한 초과 요청 시 429 Too Many Requests 응답

---

### TASK-jjiban-01-06-03: Input Validation & Sanitization (2일)
**설명**: "입력 데이터 검증"

**작업 내용**:
- 모든 API 요청 Body에 대한 Zod Schema 정의
- Validation Middleware 전역 적용
- DOMPurify 등을 활용한 XSS 방어 (Frontend Display 시)

**완료 조건**:
- [ ] 스키마에 맞지 않는 요청 시 400 Bad Request
- [ ] 악성 스크립트 렌더링 방지 확인

---

### TASK-jjiban-01-06-04: CSRF Protection (1일)
**설명**: "사이트 간 요청 위조 방지"

**작업 내용**:
- CSRF Token 발급 및 검증 로직 (필요 시, JWT 사용 시 생략 가능하나 쿠키 사용 시 필수)
- 설정 옵션화

**완료 조건**:
- [ ] 토큰 없는 상태 변경 요청 거부

---

## 3. 의존성

### 3.1 선행 Modules
- MODULE-jjiban-01-05: Config (Rate Limit 설정 등)

### 3.2 후행 Modules
- 모든 API Modules

### 3.3 외부 의존성
- Helmet
- express-rate-limit
- Zod

---

## 4. 주요 화면/API 목록
없음 (Middleware Layer)

---

## 5. 기술 스택

| 레이어 | 기술 | 비고 |
|--------|------|------|
| Validation | Zod | ^3.x |
| Headers | Helmet | ^8.x |

---

## 6. 참조 문서

- 상위 Chain PRD: ../chain-prd.md
- OWASP Top 10

---

## 7. 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2025-12-06 | 초안 작성 |
