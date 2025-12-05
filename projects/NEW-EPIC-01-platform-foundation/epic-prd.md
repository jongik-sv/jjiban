# Epic PRD: Platform Foundation

## 문서 정보

| 항목 | 내용 |
|------|------|
| Epic ID | NEW-EPIC-01 |
| Epic 이름 | Platform Foundation (플랫폼 기반) |
| 문서 버전 | 3.0 |
| 작성일 | 2024-12-06 |
| 수정일 | 2024-12-06 |
| 상태 | Draft |
| Epic 유형 | 플랫폼 (Platform) - 시스템 실행 필수 기능 |
| 예상 기간 | 4-6개월 |
| 상위 프로젝트 | jjiban (찌반) |
| 원본 PRD | `jjiban-prd.md` |

---

## 1. Epic 개요

### 1.1 Epic 비전

**"완전한 플랫폼 인프라 및 핵심 시스템 아키텍처"**

jjiban 프로젝트가 작동하기 위해 반드시 필요한 모든 기능을 통합 관리합니다. 사용자 인증, Portal, 보안, 데이터베이스, CI/CD 등 사용자가 명시하지 않았더라도 시스템이 안정적으로 실행되기 위한 필수 인프라를 제공합니다.

### 1.2 범위 (Scope)

**포함:**
- **사용자 관리**: 로그인, JWT 인증, RBAC, 프로필 관리
- **Portal 시스템**: 헤더, 사이드바, 네비게이션, 레이아웃
- **디자인 시스템**: 공통 컴포넌트, 색상, 타이포그래피
- **데이터베이스 인프라**: Prisma Schema, 데이터베이스 초기화
- **시스템 설정**: config.json, llm-config.yaml, 환경 변수, 로깅
- **에러 처리 & 보안**: Error Handler, CORS, Helmet, XSS 방지
- **DevOps**: Git 전략, CI/CD 파이프라인

**제외:**
- 비즈니스 로직 (각 기능 Epic에서 구현)
- 소셜 로그인, 2FA (v2.0)

### 1.3 성공 지표

- ✅ 로그인 성공률 > 99%
- ✅ 인증 응답 시간 < 500ms
- ✅ 보안 취약점 0건 (OWASP Top 10 기준)
- ✅ 모든 기능 Epic이 Portal 레이아웃 사용
- ✅ 디자인 시스템 컴포넌트 재사용률 > 80%
- ✅ CI/CD 파이프라인 성공률 > 95%
- ✅ 데이터베이스 마이그레이션 성공률 100%

---

## 2. Chain (기능) 목록

이 Epic은 다음 주요 기능 영역으로 구성됩니다:

### CHAIN-01-01: 사용자 관리 & 인증
- JWT 기반 인증 시스템
- RBAC (역할 기반 접근 제어)
- 사용자 프로필 관리
- 세션 관리

### CHAIN-01-02: Portal 시스템 & 레이아웃
- 공통 헤더 & 네비게이션
- 사이드바 메뉴
- 라우팅 시스템
- 반응형 레이아웃

### CHAIN-01-03: 디자인 시스템
- 공통 컴포넌트 라이브러리
- 색상 팔레트 & 타이포그래피
- 아이콘 세트
- 스타일 가이드

### CHAIN-01-04: 데이터 계층 & 스키마
- Prisma ORM 설정
- 데이터베이스 스키마 정의
- 마이그레이션 관리
- Seed 데이터

### CHAIN-01-05: 시스템 설정 & 로깅
- 환경 변수 관리
- 설정 파일 구조
- 로깅 시스템
- 모니터링

### CHAIN-01-06: 보안 & 에러 처리
- CORS 설정
- Helmet 보안 헤더
- XSS/CSRF 방지
- 전역 에러 핸들러

### CHAIN-01-07: DevOps & CI/CD
- Git 워크플로우
- CI/CD 파이프라인
- 배포 자동화
- 환경 분리 (dev/staging/prod)

---

## 3. 통합된 기존 EPICs

| 기존 EPIC | 새 위치 | 변경사항 |
|----------|---------|---------|
| **EPIC-P01** (플랫폼 인프라) | **NEW-EPIC-01** | 이름 변경 및 구조 재정리, Chain 목록 추가 |

**참고**: 기존 EPIC-P01은 이미 적절한 전략적 규모(4-6개월)였으므로, 내용은 거의 그대로 유지하고 ID와 구조만 새 표준에 맞게 업데이트했습니다.

---

## 4. 의존성 및 일정

### 4.1 선행 EPICs
- 없음 (최우선 구현 대상)

### 4.2 후행 EPICs (이 EPIC에 의존)
- NEW-EPIC-02: Core Project Management System
- NEW-EPIC-03: Workflow & Document Engine
- NEW-EPIC-04: Visualization & UX
- NEW-EPIC-05: AI-Powered Automation

### 4.3 주요 마일스톤

| 마일스톤 | 목표일 | 산출물 |
|----------|--------|--------|
| M1: 인증 시스템 완료 | Month 2 | JWT 인증, RBAC, 사용자 관리 |
| M2: Portal 시스템 완료 | Month 3 | 공통 레이아웃, 네비게이션, 디자인 시스템 |
| M3: 데이터베이스 인프라 완료 | Month 4 | Prisma 스키마, 마이그레이션, Seed |
| M4: 보안 & 에러 처리 완료 | Month 5 | CORS, Helmet, 전역 에러 핸들러 |
| M5: DevOps 완료 | Month 6 | CI/CD 파이프라인, 배포 자동화 |

---

## 5. 기술 스택

| 레이어 | 기술 | 비고 |
|--------|------|------|
| **Frontend** | React + TypeScript | SPA |
| UI 라이브러리 | Ant Design / Shadcn | 또는 Tailwind CSS |
| 상태 관리 | Zustand / Redux Toolkit | |
| **Backend** | Node.js (Express/Fastify) | 또는 Python (FastAPI) |
| **Database** | SQLite (Prisma ORM) | 개발 단계, 추후 PostgreSQL 고려 |
| 인증 | JWT + bcrypt | Access/Refresh Token |
| 보안 | Helmet, CORS | OWASP Top 10 대응 |
| **DevOps** | GitHub Actions | CI/CD 파이프라인 |
| 배포 | Docker + npm CLI | 로컬/클라우드 배포 |

---

## 6. 참조 문서

- 원본 PRD: `C:\project\jjiban\jjiban-prd.md`
- 기존 EPIC PRD: `C:\project\jjiban\.archive\epic-restructure-backup-20241206\projects\EPIC-P01-platform\epic-prd.md`
- 재구조화 계획: `C:\Users\sviso\.claude\plans\parallel-petting-pike.md`

---

## 7. 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 3.0 | 2024-12-06 | EPIC 재구조화 - EPIC-P01 → NEW-EPIC-01, Chain 목록 추가 |
| 2.0 | 2024-12-06 | (기존 EPIC-P01) |
| 1.0 | 2024-12-06 | (기존 EPIC-P01) 초안 작성 |
