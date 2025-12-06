# Module PRD: CLI Commands

## 문서 정보

| 항목 | 내용 |
|------|------|
| Module ID | MODULE-jjiban-05-02 |
| Module 이름 | CLI Commands |
| 문서 버전 | 1.0 |
| 작성일 | 2025-12-06 |
| 상태 | Draft |
| Module 유형 | User Story |
| 예상 기간 | 2주 |
| 상위 Chain | CHAIN-jjiban-05: Deployment & CLI Tools |
| 원본 Chain PRD | chain-prd.md |

---

## 1. Module 개요

### 1.1 User Story
**"As a developer, I want intuitive CLI commands so that I can easily manage my jjiban projects from the terminal."**

jjiban CLI의 핵심 명령어들을 구현합니다. 프로젝트 초기화, 서버 관리, DB 마이그레이션, WBS 동기화 등 직관적이고 강력한 명령어 세트를 제공합니다.

### 1.2 범위 (Scope)

**포함:**
- `jjiban init <name>` - 프로젝트 초기화
- `jjiban start` - 서버 시작 (옵션: -p, -d, -o)
- `jjiban stop` - 서버 종료
- `jjiban migrate` - DB 마이그레이션
- `jjiban status` - 서버 상태 확인
- `jjiban update` - 업데이트 체크
- `jjiban wbs sync` - WBS 동기화 (PRD → DB)
- `jjiban --version` - 버전 확인
- `jjiban --help` - 도움말

**제외:**
- 패키지 구조 (MODULE-01)
- Docker 관련 명령어 (MODULE-03)
- backup/restore 명령어 (MODULE-05)

### 1.3 인수 조건 (Acceptance Criteria)
- [ ] 모든 명령어가 정상 작동
- [ ] 도움말이 자동 생성되어 표시됨
- [ ] 에러 메시지가 사용자 친화적
- [ ] `jjiban wbs sync` 명령어로 PRD → DB 동기화 가능
- [ ] 대화형 프롬프트 지원 (Inquirer.js)
- [ ] 색상 및 스피너로 시각적 피드백 제공

---

## 2. Task 목록

### TASK-jjiban-05-02-01: init 명령어 구현 (2일)
**설명**: "프로젝트 초기화 명령어 구현"

**작업 내용**:
- 프로젝트 폴더 생성
- 템플릿 파일 복사
- config.json 생성
- SQLite DB 초기화
- Prisma 마이그레이션 실행
- README.md 생성

**완료 조건**:
- [ ] `jjiban init my-project` 실행 성공
- [ ] 템플릿 파일 복사 확인
- [ ] DB 생성 및 마이그레이션 완료

---

### TASK-jjiban-05-02-02: start/stop 명령어 구현 (2일)
**설명**: "서버 시작 및 종료 명령어 구현"

**작업 내용**:
- 서버 프로세스 관리
- PID 파일 관리
- 포트 옵션 (-p, --port)
- 데몬 모드 (-d, --daemon)
- 브라우저 열기 (-o, --open)
- Graceful shutdown

**완료 조건**:
- [ ] `jjiban start` 서버 시작
- [ ] `jjiban start -p 8080` 포트 지정
- [ ] `jjiban start -d` 백그라운드 실행
- [ ] `jjiban stop` 서버 종료

---

### TASK-jjiban-05-02-03: status 명령어 구현 (1일)
**설명**: "서버 상태 확인 명령어 구현"

**작업 내용**:
- 서버 실행 상태 확인
- 포트, PID 정보 표시
- 업타임 표시
- DB 연결 상태 확인

**완료 조건**:
- [ ] 서버 실행 중일 때 상태 표시
- [ ] 서버 미실행 시 안내 메시지

---

### TASK-jjiban-05-02-04: migrate 명령어 구현 (1일)
**설명**: "DB 마이그레이션 명령어 구현"

**작업 내용**:
- Prisma migrate deploy 실행
- 마이그레이션 상태 표시
- 에러 처리 및 롤백 안내

**완료 조건**:
- [ ] `jjiban migrate` 마이그레이션 실행
- [ ] 마이그레이션 히스토리 표시

---

### TASK-jjiban-05-02-05: update 명령어 구현 (1일)
**설명**: "업데이트 체크 명령어 구현"

**작업 내용**:
- npm registry에서 최신 버전 확인
- 현재 버전과 비교
- 업데이트 방법 안내

**완료 조건**:
- [ ] 최신 버전 확인 가능
- [ ] 업데이트 명령어 안내

---

### TASK-jjiban-05-02-06: wbs sync 명령어 구현 (3일)
**설명**: "PRD 문서에서 WBS 데이터 동기화 명령어 구현"

**작업 내용**:
- Markdown PRD 파싱
- Epic/Chain/Module/Task 추출
- DB 동기화 (생성/업데이트)
- dry-run 모드
- 충돌 해결 옵션

**완료 조건**:
- [ ] `jjiban wbs sync --epic epic-prd.md` 동작
- [ ] `jjiban wbs sync --chain chain-prd.md` 동작
- [ ] `jjiban wbs sync --module module-prd.md` 동작
- [ ] `jjiban wbs sync --all` 전체 동기화
- [ ] `jjiban wbs sync --dry-run` 미리보기

---

### TASK-jjiban-05-02-07: 공통 유틸리티 구현 (2일)
**설명**: "CLI 공통 기능 구현"

**작업 내용**:
- 로거 (Chalk 기반)
- 스피너 (Ora 기반)
- 설정 파일 로딩
- 에러 핸들링
- 대화형 프롬프트 (Inquirer.js)

**완료 조건**:
- [ ] 일관된 로깅 출력
- [ ] 에러 메시지 사용자 친화적
- [ ] 대화형 입력 지원

---

## 3. 의존성

### 3.1 선행 Modules
- MODULE-jjiban-05-01: CLI Package Structure (패키지 구조 필요)

### 3.2 후행 Modules (이 Module에 의존)
- MODULE-jjiban-05-04: Update & Migration (update 명령어 확장)
- MODULE-jjiban-05-05: Backup & Restore (backup/restore 명령어)

### 3.3 외부 의존성
- Commander.js ^11.0.0
- Inquirer.js ^9.0.0
- Chalk ^5.0.0
- Ora ^7.0.0
- fs-extra ^11.0.0
- open ^10.0.0

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
| CLI Framework | Commander.js | 명령어 정의 |
| Interactive | Inquirer.js | 대화형 입력 |
| Output | Chalk, Ora | 색상, 스피너 |
| File System | fs-extra | 파일 작업 |
| Markdown | marked, gray-matter | PRD 파싱 |

---

## 6. 참조 문서

- 상위 Chain PRD: `chain-prd.md`
- Chain 기본설계: `chain-basic-design.md`
- 명령어 상세: Section 4

---

## 7. 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2025-12-06 | 초안 작성 |
