# Epic PRD: AI-Powered Automation

## 문서 정보

| 항목 | 내용 |
|------|------|
| Epic ID | NEW-EPIC-05 |
| Epic 이름 | AI-Powered Automation (AI 기반 자동화) |
| 문서 버전 | 1.0 |
| 작성일 | 2024-12-06 |
| 상태 | Draft |
| Epic 유형 | Feature (기능) - 핵심 차별화 요소 |
| 예상 기간 | 5-6개월 |
| 상위 프로젝트 | jjiban (찌반) |
| 원본 PRD | `jjiban-prd.md` |

---

## 1. Epic 개요

### 1.1 Epic 비전

**"터미널에서 완전 자동 워크플로우까지 LLM 통합 개발 자동화"**

jjiban의 핵심 차별화 요소로, 수동 LLM 터미널, 자동화된 워크플로우, CLI 배포를 통합하여 "AI 개발 어시스턴트" 역량을 제공합니다. 개발자는 LLM과 대화하며 설계하고, 시스템은 전체 워크플로우를 자동으로 실행합니다.

### 1.2 범위 (Scope)

**포함:**
- **웹 기반 LLM 터미널**
  - xterm.js 기반 터미널
  - LLM CLI 실행 (Claude Code, Gemini CLI, Codex 등)
  - 실시간 출력 스트리밍 (WebSocket)
  - 대화형 입력 지원 (Y/N, 추가 질문)
  - 세션 관리 (Task별 독립 세션)
  - 실행 이력 & 로그 저장
- **LLM CLI 실행 & 세션 관리**
  - node-pty (PTY 프로세스 관리)
  - 멀티 LLM 지원 (Claude, Gemini, OpenAI)
  - 환경 변수 관리 (API Key)
  - 타임아웃 & 에러 처리
- **워크플로우 자동화 엔진 (Auto-Pilot)**
  - 완전 자동 모드: 사람 개입 없이 전 과정 실행
  - 반자동 모드 (Human-in-the-Loop): 단계별 승인
  - 파이프라인 정의 (YAML/JSON)
  - 에러 처리 & 재시도
- **프롬프트 템플릿 시스템**
  - 사전 정의 프롬프트 (설계 생성, 리뷰 요청 등)
  - 변수 치환 ({{taskName}}, {{prdContent}})
  - 템플릿 CRUD
  - 카테고리 & 태그
- **결과 파일 추적 & Diff 표시**
  - LLM이 생성/수정한 파일 자동 감지
  - 파일 diff 표시 (before/after)
  - 파일 저장 경로 표시
- **CLI 배포 & 배포**
  - npm CLI 패키지 (jjiban)
  - init, start, stop, migrate, status 명령어
  - Docker 지원 (선택)

**제외:**
- 터미널 UI (NEW-EPIC-04에서 제공)
- 워크플로우 상태 관리 (NEW-EPIC-03에서 처리)

### 1.3 성공 지표

- ✅ LLM 응답 스트리밍 지연 < 200ms
- ✅ 자동 워크플로우 완료율 > 80% (에러 없이)
- ✅ 프롬프트 템플릿 재사용률 > 60%
- ✅ CLI 설치 성공률 > 95%
- ✅ 세션 안정성 (크래시 없음) > 99%

---

## 2. Chain (기능) 목록

### CHAIN-05-01: LLM Terminal (2-3개월)
**비전**: "웹에서 LLM과 대화하며 개발하기"

**범위**:
- **웹 터미널 (xterm.js)**
  - 터미널 UI는 NEW-EPIC-04에서 제공
  - 백엔드: PTY 프로세스 관리
  - WebSocket 양방향 통신
  - 실시간 출력 스트리밍
- **LLM CLI 실행**
  - node-pty로 CLI 프로세스 실행
  - 지원 LLM: Claude Code (`claude`), Gemini CLI (`gemini`), Codex CLI (`codex`)
  - 환경 변수 주입 (ANTHROPIC_API_KEY, GOOGLE_API_KEY)
  - Working Directory 설정 (Task 폴더)
- **대화형 입력**
  - stdin 입력 전달
  - Y/N 확인 처리
  - 추가 질문 응답
- **세션 관리**
  - Task별 독립 세션
  - 세션 생성/종료/재연결
  - 세션 타임아웃 (30분)
- **로그 & 히스토리**
  - 실행 로그 저장 (logs/{taskId}-{timestamp}.log)
  - 히스토리 조회 (최근 10개)
  - 로그 다운로드

**기술 스택**:
- Backend: Node.js + Express
- PTY: node-pty (또는 Windows: child_process)
- WebSocket: Socket.IO
- 로그: winston

**산출물**:
- Terminal Service (Backend)
- PTY Manager
- WebSocket Handler
- 세션 관리 API

---

### CHAIN-05-02: Workflow Automation (2-3개월)
**비전**: "전 과정을 자동으로 실행하는 Auto-Pilot"

**범위**:
- **자동화 파이프라인**
  - YAML 파이프라인 정의
  ```yaml
  pipeline:
    - step: draft
      llm: claude
      prompt: "설계 문서 초안 생성"
      output: 02-detail-design.md
    - step: review
      llm: gemini
      prompt: "설계 검증"
      output: 03-detail-design-review-gemini-1.md
    - step: build
      llm: claude
      prompt: "TDD 기반 구현"
      output: 05-implementation.md
  ```
- **실행 모드**
  - 완전 자동: 에러 없으면 단계별 자동 진행
  - 반자동: 각 단계 후 사용자 승인 대기
  - 조건부: 품질 게이트 통과 시만 다음 단계
- **LLM 실행 오케스트레이션**
  - 파이프라인 해석
  - LLM CLI 순차 실행
  - 결과 파일 검증
  - 다음 단계 트리거
- **에러 처리 & 재시도**
  - LLM 에러 감지 (timeout, API error)
  - 자동 재시도 (최대 3회)
  - 에러 발생 시 사용자 알림
  - 롤백 지원

**기술 스택**:
- Backend: Node.js
- 파이프라인: js-yaml (파싱)
- 오케스트레이션: async/await + Promise 체인
- 에러 처리: try-catch + 재시도 로직

**산출물**:
- Automation Service (Backend)
- Pipeline Executor
- 자동화 실행 API (POST /api/automation/run)
- 진행 상태 조회 API (GET /api/automation/status/:id)

---

### CHAIN-05-03: CLI Deployment (2-3개월)
**비전**: "npm install 한 번으로 jjiban 설치"

**범위**:
- **npm CLI 패키지**
  - 패키지명: `jjiban`
  - bin 명령어: `jjiban`
  - 전역 설치: `npm install -g jjiban`
  - npx 실행: `npx jjiban`
- **CLI 명령어**
  - `jjiban init <name>`: 프로젝트 초기화
  - `jjiban start [-p <port>]`: 서버 시작
  - `jjiban stop`: 서버 종료
  - `jjiban migrate [--reset]`: DB 마이그레이션
  - `jjiban status`: 서버 상태 확인
  - `jjiban update`: 버전 업데이트 체크
  - `jjiban --version`: 버전 표시
  - `jjiban --help`: 도움말
- **프로젝트 템플릿**
  - `.jjiban/` 폴더 생성 (config.json, llm-config.yaml, jjiban.db)
  - `projects/` 폴더 생성
  - `templates/` 폴더 복사
  - Prisma 마이그레이션 실행
- **번들링**
  - 프론트엔드 빌드 (React → static files)
  - 백엔드 빌드 (Node.js → dist/)
  - CLI 패키지에 포함 (cli/web/, cli/server/)
- **Docker 지원 (선택)**
  - Dockerfile
  - docker-compose.yml
  - 이미지 빌드 & 배포

**기술 스택**:
- CLI Framework: Commander.js
- 프롬프트: Inquirer.js
- 스피너: ora
- 색상: chalk
- 번들링: Webpack (백엔드), Vite (프론트엔드)
- Docker: Dockerfile, docker-compose

**산출물**:
- CLI 패키지 (packages/cli/)
- 명령어 구현 (cli/commands/)
- npm 배포 스크립트
- Docker 이미지 (선택)

---

## 3. 통합된 기존 EPICs

| 기존 EPIC | 새 위치 | 변경사항 |
|----------|---------|---------|
| **EPIC-008** (LLM Terminal) | **CHAIN-05-01** | EPIC → Chain으로 강등 |
| **EPIC-009** (Workflow Automation) | **CHAIN-05-02** | EPIC → Chain으로 강등 |
| **EPIC-010** (CLI Deployment) | **CHAIN-05-03** | EPIC → Chain으로 강등 |

**통합 근거**: 세 가지 모두 jjiban의 핵심 차별화 요소인 "AI 개발 어시스턴트" 역량을 구성합니다. 수동 LLM 터미널, 자동화된 워크플로우, 배포 메커니즘이 함께 완전한 AI 기반 개발 환경을 제공합니다.

---

## 4. 의존성 및 일정

### 4.1 선행 EPICs
- **NEW-EPIC-01** (Platform Foundation) - 시스템 인프라
- **NEW-EPIC-03** (Workflow & Document Engine) - 워크플로우 상태, 문서
- **NEW-EPIC-04** (Visualization & UX) - 터미널 UI

### 4.2 후행 EPICs
- 없음 (최종 기능)

### 4.3 주요 마일스톤

| 마일스톤 | 목표일 | 산출물 |
|----------|--------|--------|
| M1: LLM 터미널 완료 | Month 2 | 웹 터미널, PTY, WebSocket, 세션 관리 |
| M2: 자동화 엔진 완료 | Month 4 | 파이프라인, 자동 실행, 에러 처리 |
| M3: CLI 패키지 완료 | Month 6 | npm 패키지, 명령어, 번들링, 배포 |

---

## 5. 기술 스택

| 레이어 | 기술 | 비고 |
|--------|------|------|
| **Backend** | Node.js + Express | Terminal & Automation Service |
| PTY | node-pty | 터미널 프로세스 관리 |
| WebSocket | Socket.IO | 실시간 스트리밍 |
| 파이프라인 | js-yaml | YAML 파싱 |
| **CLI** | Commander.js | CLI 프레임워크 |
| 번들링 | Webpack (BE), Vite (FE) | 빌드 |
| Docker | Dockerfile | 선택적 배포 |

---

## 6. 참조 문서

- 원본 PRD: `C:\project\jjiban\jjiban-prd.md`
- 기존 EPIC PRD:
  - `C:\project\jjiban\.archive\epic-restructure-backup-20241206\projects\EPIC-008-llm-terminal\epic-prd.md`
  - `C:\project\jjiban\.archive\epic-restructure-backup-20241206\projects\EPIC-009-workflow-automation\epic-prd.md`
  - `C:\project\jjiban\.archive\epic-restructure-backup-20241206\projects\EPIC-010-cli-deployment\epic-prd.md`
- 재구조화 계획: `C:\Users\sviso\.claude\plans\parallel-petting-pike.md`

---

## 7. 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2024-12-06 | EPIC 재구조화 - EPIC-008 + EPIC-009 + EPIC-010 → NEW-EPIC-05 통합 |
