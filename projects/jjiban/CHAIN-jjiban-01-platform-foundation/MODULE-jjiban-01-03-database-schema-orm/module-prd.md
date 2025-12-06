# Module PRD: Database Schema & ORM

## 문서 정보

| 항목 | 내용 |
|------|------|
| Module ID | MODULE-jjiban-01-03 |
| Module 이름 | Database Schema & ORM |
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
**"As a 시스템 관리자/개발자, I want 데이터가 구조적으로 저장되고 안전하게 관리되기를 원한다 so that 데이터의 무결성을 유지하고 기능을 확장할 수 있다"**

jjiban은 로컬 우선(Local-First) 또는 온프레미스 성격을 가지므로 SQLite를 메인 DB로 사용합니다. Prisma ORM을 도입하여 타입 안전성을 보장하고, 스키마 마이그레이션을 자동화합니다.

### 1.2 범위 (Scope)

**포함:**
- Prisma Schema 정의 (User, Project/Epic, Chain, Module, Task, Document 등)
- 마이그레이션 자동화 스크립트
- 시드 데이터 생성 (초기 Admin 계정, 예제 프로젝트)
- Prisma Client 인스턴스 설정 및 싱글톤 패턴 적용

**제외:**
- 복잡한 데이터 분석/통계 쿼리 (Dashboard Module에서 처리)
- 백업 시스템 (DevOps Module에서 처리)

### 1.3 인수 조건 (Acceptance Criteria)
- [ ] `npx prisma migrate dev` 실행 시 에러 없이 DB 생성
- [ ] 모든 테이블 간의 관계(Relation)가 올바르게 정의됨 (Cascade delete 등 고려)
- [ ] `npm run seed` 실행 시 초기 데이터가 정상적으로 주입됨
- [ ] Prisma Client를 통해 CRUD 작업 가능

---

## 2. Task 목록

### TASK-jjiban-01-03-01: Prisma 및 SQLite 환경 구성 (1일)
**설명**: "Prisma 초기화 및 설정"

**작업 내용**:
- 패키지 설치 (`prisma`, `@prisma/client`, `better-sqlite3`)
- `schema.prisma` 파일 생성 및 DB 연결 설정
- `.env` 파일 설정

**완료 조건**:
- [ ] `npx prisma studio` 실행 가능 확인

---

### TASK-jjiban-01-03-02: Core Schema 정의 (2일)
**설명**: "핵심 엔티티(Epic, Chain, Module, Task) 모델링"

**작업 내용**:
- Epic (Project) 모델 정의
- Chain, Module, Task 계층 구조 모델링
- Enum 정의 (TaskStatus, TaskType 등)
- Document 모델 정의 (Task와의 관계)

**완료 조건**:
- [ ] 모델 간 1:N 관계 설정 완료
- [ ] 마이그레이션 파일 생성

---

### TASK-jjiban-01-03-03: User & Auth Schema 정의 (1일)
**설명**: "사용자 및 인증 관련 모델링"

**작업 내용**:
- User 모델 (email, passwordHash, role)
- Session/RefreshToken 모델
- User와 Task의 할당 관계 (Assignee, Reporter)

**완료 조건**:
- [ ] 유니크 제약조건 (email) 설정
- [ ] User-Task 관계 확인

---

### TASK-jjiban-01-03-04: Seeding Script 작성 (1일)
**설명**: "개발용 초기 데이터 생성 스크립트"

**작업 내용**:
- `prisma/seed.ts` 작성
- 기본 Admin 사용자 생성
- 샘플 프로젝트 구조(Epic-Chain-Module-Task) 생성

**완료 조건**:
- [ ] `npm run seed` 성공
- [ ] DB에 샘플 데이터 존재 확인

---

## 3. 의존성

### 3.1 선행 Modules
- 없음

### 3.2 후행 Modules
- MODULE-jjiban-01-04: Auth (User 모델 필요)
- 모든 Feature Chains (데이터 저장소 필요)

### 3.3 외부 의존성
- Prisma
- SQLite (Better-SQLite3)

---

## 4. 주요 화면/API 목록

### 4.1 화면 목록
없음 (Backend Module)

### 4.2 API 목록
없음 (ORM Layer)

---

## 5. 기술 스택

| 레이어 | 기술 | 비고 |
|--------|------|------|
| ORM | Prisma | ^7.x |
| DB | SQLite | 로컬 파일 DB |

---

## 6. 참조 문서

- 상위 Chain PRD: ../chain-prd.md
- TRD (스키마 설계 섹션)

---

## 7. 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2025-12-06 | 초안 작성 |
