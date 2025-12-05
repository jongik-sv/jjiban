# Chain PRD: Deployment & CLI Tools

## 문서 정보

| 항목 | 내용 |
|------|------|
| Chain ID | CHAIN-jjiban-05 |
| Chain 이름 | Deployment & CLI Tools |
| 문서 버전 | 1.0 |
| 작성일 | 2024-12-06 |
| 상태 | Draft |
| Chain 유형 | Feature |
| 예상 기간 | 1-2개월 |
| 상위 EPIC | jjiban - AI-Assisted Development Kanban Tool |
| 원본 PRD | projects/jjiban/jjiban-prd.md |

---

## 1. Chain 개요

### 1.1 Chain 비전
**"npm처럼 간편하게 설치하고 실행하는 CLI 도구"**

jjiban을 npm CLI 패키지로 배포하여 로컬에서 쉽게 설치하고 실행할 수 있도록 합니다. Docker 지원으로 다양한 환경에서 실행 가능합니다.

### 1.2 범위 (Scope)

**포함:**
- npm CLI 패키지 구조 및 명령어 (init, start, stop, migrate, status)
- CLI 도구 개발 (Commander.js, Inquirer.js)
- Docker 지원 (Dockerfile, docker-compose)
- 업데이트 및 마이그레이션 시스템
- 백업 및 복원 기능

**제외:**
- 애플리케이션 로직 (CHAIN-01~04)
- 클라우드 배포 (AWS, Azure 등)

### 1.3 성공 지표
- ✅ `npm install -g jjiban` 설치 성공
- ✅ `jjiban init` 명령으로 프로젝트 생성
- ✅ `jjiban start` 명령으로 서버 실행
- ✅ Docker 이미지 빌드 성공
- ✅ 크로스 플랫폼 지원 (Windows, macOS, Linux)

---

## 2. Module (기능) 목록

### MODULE-jjiban-05-01: CLI Package Structure (2주)
**비전**: "npm으로 배포 가능한 CLI 패키지 구조"

**기능**:
- Monorepo 구조 설계 (packages/cli, packages/server, packages/web)
- CLI 진입점 (bin/jjiban.js)
- 명령어 라우팅 (Commander.js)
- 프론트엔드/백엔드 번들링
- 템플릿 파일 포함
- package.json 설정

**인수 조건**:
- [ ] `npm pack` 성공
- [ ] 번들 크기 < 50MB
- [ ] 크로스 플랫폼 실행

**예상 Task 수**: 5개

---

### MODULE-jjiban-05-02: CLI Commands (2주)
**비전**: "직관적이고 강력한 CLI 명령어 세트"

**기능**:
- `jjiban init <name>` - 프로젝트 초기화
- `jjiban start` - 서버 시작 (옵션: -p, -d, -o)
- `jjiban stop` - 서버 종료
- `jjiban migrate` - DB 마이그레이션
- `jjiban status` - 서버 상태 확인
- `jjiban update` - 업데이트 체크
- `jjiban --version` - 버전 확인
- `jjiban --help` - 도움말

**인수 조건**:
- [ ] 모든 명령어 정상 작동
- [ ] 도움말 자동 생성
- [ ] 에러 메시지 사용자 친화적

**예상 Task 수**: 6개

---

### MODULE-jjiban-05-03: Docker Support (1주)
**비전**: "컨테이너 기반 배포 지원"

**기능**:
- Dockerfile 작성
- docker-compose.yml 작성
- 볼륨 마운트 (.jjiban, projects)
- 환경 변수 설정
- 다중 스테이지 빌드 (최적화)

**인수 조건**:
- [ ] Docker 이미지 빌드 성공
- [ ] docker-compose로 실행 가능
- [ ] 데이터 영속성 (볼륨)

**예상 Task 수**: 3개

---

### MODULE-jjiban-05-04: Update & Migration (1주)
**비전**: "버전 업그레이드 및 마이그레이션 자동화"

**기능**:
- 버전 체크 (npm registry 확인)
- 자동 업데이트 알림
- DB 마이그레이션 스크립트
- 설정 파일 마이그레이션
- 롤백 기능

**인수 조건**:
- [ ] 버전 체크 정확
- [ ] 마이그레이션 자동 실행
- [ ] 롤백 가능

**예상 Task 수**: 4개

---

### MODULE-jjiban-05-05: Backup & Restore (1주)
**비전**: "데이터 백업 및 복원 시스템"

**기능**:
- 백업 명령어 (`jjiban backup`)
- 복원 명령어 (`jjiban restore <backup>`)
- 백업 파일 압축 (tar.gz)
- 백업 목록 조회
- 스케줄 백업 (cron)

**인수 조건**:
- [ ] DB + 문서 백업
- [ ] 복원 정확도 100%
- [ ] 압축 및 해제 성공

**예상 Task 수**: 4개

---

## 3. 의존성

### 3.1 선행 Chains
- CHAIN-jjiban-01: Platform Foundation
- CHAIN-jjiban-02: Core Project Management
- CHAIN-jjiban-03: Workflow & Document Engine
- CHAIN-jjiban-04: LLM Integration & Automation

### 3.2 후행 Chains
- 없음

### 3.3 외부 의존성
- Commander.js (CLI 프레임워크)
- Inquirer.js (대화형 프롬프트)
- Chalk (색상 출력)
- Ora (스피너)
- Docker

---

## 4. 주요 명령어 상세

### 4.1 jjiban init

```bash
jjiban init my-project

# 실행 과정:
# 1. 프로젝트 폴더 생성
# 2. 템플릿 복사 (.jjiban, projects, templates)
# 3. SQLite DB 생성
# 4. Prisma 마이그레이션 실행
# 5. README.md 생성
```

### 4.2 jjiban start

```bash
jjiban start -p 3000 -d -o

# 옵션:
# -p, --port <port>      서버 포트 (기본: 3000)
# -d, --daemon           백그라운드 실행
# -o, --open             브라우저 자동 열기
```

---

## 5. 기술 스택

| 레이어 | 기술 | 비고 |
|--------|------|------|
| CLI Framework | Commander.js | 명령어 파싱 |
| Interactive | Inquirer.js | 대화형 프롬프트 |
| UI | Chalk, Ora | 색상, 스피너 |
| Bundling | Webpack 또는 esbuild | CLI 번들링 |
| Container | Docker | 컨테이너화 |

---

## 6. 마일스톤

| 마일스톤 | 목표일 | 산출물 |
|----------|--------|--------|
| M1: CLI 구조 & 명령어 | Week 4 | npm 패키지 구조, 기본 명령어 |
| M2: Docker & 배포 | Week 6 | Dockerfile, npm 배포 |
| M3: 업데이트 & 백업 | Week 8 | 마이그레이션, 백업 시스템 |

---

## 7. 참조 문서

- 원본 EPIC PRD: `projects/jjiban/jjiban-prd.md`
- Section 5: 배포 및 설치

---

## 8. 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2024-12-06 | 초안 작성 |
