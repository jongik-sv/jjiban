# Module PRD: Update & Migration

## 문서 정보

| 항목 | 내용 |
|------|------|
| Module ID | MODULE-jjiban-05-04 |
| Module 이름 | Update & Migration |
| 문서 버전 | 1.0 |
| 작성일 | 2025-12-06 |
| 상태 | Draft |
| Module 유형 | User Story |
| 예상 기간 | 1주 |
| 상위 Chain | CHAIN-jjiban-05: Deployment & CLI Tools |
| 원본 Chain PRD | chain-prd.md |

---

## 1. Module 개요

### 1.1 User Story
**"As a developer, I want to easily update jjiban and migrate my data so that I can always use the latest features without losing my work."**

버전 업그레이드와 데이터 마이그레이션을 자동화합니다. npm registry에서 최신 버전을 확인하고, DB 스키마 변경 시 자동으로 마이그레이션을 수행합니다.

### 1.2 범위 (Scope)

**포함:**
- 버전 체크 (npm registry 확인)
- 자동 업데이트 알림
- DB 마이그레이션 스크립트
- 설정 파일 마이그레이션
- 롤백 기능

**제외:**
- 자동 업데이트 설치 (보안상 수동 선택)
- Breaking changes 자동 해결

### 1.3 인수 조건 (Acceptance Criteria)
- [ ] `jjiban update` 명령으로 최신 버전 확인 가능
- [ ] 새 버전 있을 시 업데이트 방법 안내
- [ ] `jjiban migrate` 명령으로 DB 마이그레이션 실행
- [ ] 마이그레이션 실패 시 롤백 가능
- [ ] 설정 파일 호환성 유지

---

## 2. Task 목록

### TASK-jjiban-05-04-01: 버전 체크 시스템 (2일)
**설명**: "npm registry에서 최신 버전 확인 및 비교"

**작업 내용**:
- npm registry API 호출
- 현재 버전과 비교
- 업데이트 필요 여부 판단
- 변경 사항 요약 표시

**완료 조건**:
- [ ] 최신 버전 정보 조회 성공
- [ ] 버전 비교 정확성
- [ ] 오프라인 시 graceful 처리

---

### TASK-jjiban-05-04-02: 자동 업데이트 알림 (1일)
**설명**: "새 버전 출시 시 알림 및 안내"

**작업 내용**:
- 서버 시작 시 버전 체크
- 새 버전 알림 표시
- 업데이트 명령어 안내
- 알림 빈도 제어 (24시간)

**완료 조건**:
- [ ] 서버 시작 시 버전 체크
- [ ] 알림 표시 (비침입적)
- [ ] 알림 빈도 제어

---

### TASK-jjiban-05-04-03: DB 마이그레이션 시스템 (2일)
**설명**: "Prisma 기반 DB 스키마 마이그레이션"

**작업 내용**:
- Prisma migrate deploy 래핑
- 마이그레이션 상태 표시
- 에러 처리 및 안내
- 마이그레이션 히스토리 관리

**완료 조건**:
- [ ] `jjiban migrate` 실행 성공
- [ ] 마이그레이션 상태 표시
- [ ] 에러 시 명확한 안내

---

### TASK-jjiban-05-04-04: 롤백 기능 (2일)
**설명**: "마이그레이션 및 업데이트 롤백"

**작업 내용**:
- 마이그레이션 전 백업 생성
- 롤백 명령어 구현
- 설정 파일 롤백
- 롤백 확인 프롬프트

**완료 조건**:
- [ ] `jjiban migrate --rollback` 동작
- [ ] 백업에서 복원 가능
- [ ] 롤백 전 확인 프롬프트

---

## 3. 의존성

### 3.1 선행 Modules
- MODULE-jjiban-05-01: CLI Package Structure
- MODULE-jjiban-05-02: CLI Commands (migrate 명령어 기반)

### 3.2 후행 Modules (이 Module에 의존)
- 없음

### 3.3 외부 의존성
- npm registry API
- Prisma CLI
- semver (버전 비교)

---

## 4. 주요 화면/API 목록

### 4.1 화면 목록
| 화면 이름 | 경로 | 설명 | 관련 Task |
|----------|------|------|-----------|
| N/A | - | CLI 전용 Module | - |

### 4.2 API 목록
| API | Method | 경로 | 설명 | 관련 Task |
|-----|--------|------|------|-----------|
| npm registry | GET | registry.npmjs.org/jjiban | 버전 정보 | TASK-01 |

---

## 5. 기술 스택

| 레이어 | 기술 | 비고 |
|--------|------|------|
| Version Check | npm registry API | 버전 조회 |
| Migration | Prisma Migrate | DB 스키마 |
| Version Compare | semver | 버전 비교 |

---

## 6. 참조 문서

- 상위 Chain PRD: `chain-prd.md`
- Chain 기본설계: `chain-basic-design.md`
- Prisma Migration: https://www.prisma.io/docs/concepts/components/prisma-migrate

---

## 7. 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2025-12-06 | 초안 작성 |
