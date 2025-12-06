# Module PRD: CLI Package Structure

## 문서 정보

| 항목 | 내용 |
|------|------|
| Module ID | MODULE-jjiban-05-01 |
| Module 이름 | CLI Package Structure |
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
**"As a developer, I want to install jjiban via npm so that I can quickly set up and run a development kanban tool locally."**

npm 패키지로 배포 가능한 CLI 패키지 구조를 설계하고 구현합니다. Monorepo 구조로 CLI, Server, Web을 관리하며, 번들링을 통해 단일 npm 패키지로 배포합니다.

### 1.2 범위 (Scope)

**포함:**
- Monorepo 구조 설계 (packages/cli, packages/server, packages/web)
- CLI 진입점 (bin/jjiban.js)
- 명령어 라우팅 (Commander.js)
- 프론트엔드/백엔드 번들링
- 템플릿 파일 포함
- package.json 설정

**제외:**
- 개별 CLI 명령어 구현 (MODULE-02)
- Docker 지원 (MODULE-03)
- 업데이트/마이그레이션 (MODULE-04)

### 1.3 인수 조건 (Acceptance Criteria)
- [ ] `npm pack` 명령어로 tarball 생성 성공
- [ ] 번들 크기 < 50MB
- [ ] Windows, macOS, Linux에서 실행 가능
- [ ] `npx jjiban --version` 명령어 정상 동작
- [ ] 템플릿 파일 포함 확인

---

## 2. Task 목록

### TASK-jjiban-05-01-01: Monorepo 구조 설계 (2일)
**설명**: "pnpm workspace 기반 Monorepo 구조 설계"

**작업 내용**:
- pnpm-workspace.yaml 설정
- 패키지 간 의존성 정의
- 공통 설정 파일 (tsconfig.base.json, .eslintrc)

**완료 조건**:
- [ ] packages/cli, packages/server, packages/web 폴더 생성
- [ ] pnpm install 성공
- [ ] 패키지 간 참조 가능

---

### TASK-jjiban-05-01-02: CLI 진입점 구현 (2일)
**설명**: "bin/jjiban.js 진입점 및 Commander.js 설정"

**작업 내용**:
- bin/jjiban.js 생성 (shebang 포함)
- Commander.js 기본 설정
- 버전 및 도움말 명령어
- 명령어 라우팅 구조

**완료 조건**:
- [ ] `jjiban --version` 동작
- [ ] `jjiban --help` 도움말 표시
- [ ] 명령어 라우팅 구조 완성

---

### TASK-jjiban-05-01-03: 프론트엔드 번들링 (2일)
**설명**: "Next.js 프론트엔드를 static export로 번들링"

**작업 내용**:
- next.config.js output: 'export' 설정
- 빌드 스크립트 작성
- CLI 패키지로 복사 스크립트

**완료 조건**:
- [ ] `pnpm --filter web build` 성공
- [ ] packages/cli/web/dist 생성
- [ ] 정적 파일 서빙 가능

---

### TASK-jjiban-05-01-04: 백엔드 번들링 (2일)
**설명**: "NestJS 백엔드를 단일 파일로 번들링"

**작업 내용**:
- esbuild 또는 webpack 설정
- Prisma 클라이언트 포함
- 번들 스크립트 작성

**완료 조건**:
- [ ] `pnpm --filter server build` 성공
- [ ] packages/cli/server/dist/main.js 생성
- [ ] Prisma 스키마 포함

---

### TASK-jjiban-05-01-05: npm 패키지 설정 (2일)
**설명**: "package.json 및 배포 설정"

**작업 내용**:
- packages/cli/package.json 설정
- bin 필드 설정
- files 필드로 포함 파일 지정
- npm publish 테스트

**완료 조건**:
- [ ] `npm pack` 성공
- [ ] tarball 크기 < 50MB
- [ ] 필수 파일 모두 포함

---

## 3. 의존성

### 3.1 선행 Modules
- CHAIN-jjiban-01~04의 Frontend/Backend 구현 완료

### 3.2 후행 Modules (이 Module에 의존)
- MODULE-jjiban-05-02: CLI Commands
- MODULE-jjiban-05-03: Docker Support
- MODULE-jjiban-05-04: Update & Migration
- MODULE-jjiban-05-05: Backup & Restore

### 3.3 외부 의존성
- Commander.js ^11.0.0
- pnpm (workspace)
- esbuild 또는 webpack
- Node.js >= 18

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
| CLI Framework | Commander.js | 명령어 파싱 |
| Monorepo | pnpm workspace | 패키지 관리 |
| Bundler | esbuild | 빠른 번들링 |
| Package Manager | npm | 배포 |

---

## 6. 참조 문서

- 상위 Chain PRD: `chain-prd.md`
- Chain 기본설계: `chain-basic-design.md`
- Monorepo 구조 참조: Section 1.1

---

## 7. 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2025-12-06 | 초안 작성 |
