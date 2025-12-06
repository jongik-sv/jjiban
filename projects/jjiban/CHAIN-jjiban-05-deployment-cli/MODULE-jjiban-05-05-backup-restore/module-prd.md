# Module PRD: Backup & Restore

## 문서 정보

| 항목 | 내용 |
|------|------|
| Module ID | MODULE-jjiban-05-05 |
| Module 이름 | Backup & Restore |
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
**"As a developer, I want to backup and restore my jjiban data so that I can protect my work and recover from disasters."**

데이터 백업 및 복원 시스템을 구현합니다. DB와 문서를 함께 백업하고, 원하는 시점으로 복원할 수 있습니다. 스케줄 백업도 지원합니다.

### 1.2 범위 (Scope)

**포함:**
- 백업 명령어 (`jjiban backup`)
- 복원 명령어 (`jjiban restore <backup>`)
- 백업 파일 압축 (tar.gz)
- 백업 목록 조회 (`jjiban backup list`)
- 스케줄 백업 (cron 설정 안내)

**제외:**
- 클라우드 백업 (S3, GCS 등)
- 자동 백업 데몬 (사용자 cron으로 대체)
- 증분 백업

### 1.3 인수 조건 (Acceptance Criteria)
- [ ] `jjiban backup` 명령으로 DB + 문서 백업 생성
- [ ] `jjiban restore <backup>` 명령으로 복원 가능
- [ ] 복원 정확도 100%
- [ ] 백업 파일 압축 및 해제 성공
- [ ] 백업 목록 조회 가능

---

## 2. Task 목록

### TASK-jjiban-05-05-01: backup 명령어 구현 (2일)
**설명**: "전체 데이터 백업 명령어 구현"

**작업 내용**:
- SQLite DB 백업
- projects 폴더 백업
- config.json 백업
- tar.gz 압축
- 백업 메타데이터 생성

**완료 조건**:
- [ ] `jjiban backup` 실행 성공
- [ ] .jjiban/backups/ 폴더에 백업 생성
- [ ] 백업 파일 크기 및 내용 검증

---

### TASK-jjiban-05-05-02: restore 명령어 구현 (2일)
**설명**: "백업에서 데이터 복원 명령어 구현"

**작업 내용**:
- 백업 파일 선택 (대화형)
- 압축 해제
- 파일 복원
- DB 복원
- 복원 검증

**완료 조건**:
- [ ] `jjiban restore` 대화형 선택
- [ ] `jjiban restore <backup-file>` 직접 지정
- [ ] 복원 후 데이터 무결성 검증

---

### TASK-jjiban-05-05-03: backup list 명령어 (1일)
**설명**: "백업 목록 조회 명령어 구현"

**작업 내용**:
- 백업 폴더 스캔
- 메타데이터 파싱
- 목록 표시 (날짜, 크기, 설명)
- 오래된 백업 정리 옵션

**완료 조건**:
- [ ] `jjiban backup list` 목록 표시
- [ ] 백업 정보 (날짜, 크기) 표시
- [ ] `jjiban backup clean` 오래된 백업 삭제

---

### TASK-jjiban-05-05-04: 스케줄 백업 안내 (1일)
**설명**: "cron을 통한 스케줄 백업 설정 안내"

**작업 내용**:
- 스케줄 백업 가이드 문서
- cron 설정 예시 제공
- `jjiban backup --schedule` 도움말

**완료 조건**:
- [ ] 스케줄 백업 가이드 작성
- [ ] cron 설정 예시 제공
- [ ] 도움말에 스케줄 안내 포함

---

## 3. 의존성

### 3.1 선행 Modules
- MODULE-jjiban-05-01: CLI Package Structure
- MODULE-jjiban-05-02: CLI Commands

### 3.2 후행 Modules (이 Module에 의존)
- 없음

### 3.3 외부 의존성
- archiver (압축)
- tar (해제)
- dayjs (날짜 처리)

---

## 4. 주요 화면/API 목록

### 4.1 화면 목록
| 화면 이름 | 경로 | 설명 | 관련 Task |
|----------|------|------|-----------|
| N/A | - | CLI 전용 Module | - |

### 4.2 API 목록
| API | Method | 경로 | 설명 | 관련 Task |
|-----|--------|------|------|-----------|
| N/A | - | - | CLI 전용 Module | - |

---

## 5. 기술 스택

| 레이어 | 기술 | 비고 |
|--------|------|------|
| Compression | archiver | tar.gz 생성 |
| Extraction | tar | tar.gz 해제 |
| Date | dayjs | 날짜 포맷 |

---

## 6. 참조 문서

- 상위 Chain PRD: `chain-prd.md`
- Chain 기본설계: `chain-basic-design.md`

---

## 7. 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2025-12-06 | 초안 작성 |
