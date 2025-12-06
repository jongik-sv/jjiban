# Chain PRD: LLM Integration & Automation

## 문서 정보

| 항목 | 내용 |
|------|------|
| Chain ID | CHAIN-jjiban-04 |
| Chain 이름 | LLM Integration & Automation |
| 문서 버전 | 1.0 |
| 작성일 | 2025-12-06 |
| 상태 | Draft |
| Chain 유형 | Feature |
| 예상 기간 | 2-3개월 |
| 상위 EPIC | jjiban - AI-Assisted Development Kanban Tool |
| 원본 PRD | projects/jjiban/jjiban-prd.md |

---

## 1. Chain 개요

### 1.1 Chain 비전
**"LLM과 함께 개발하는 자동화 워크플로우"**

웹 기반 터미널에서 Claude Code, Gemini CLI 등 LLM CLI를 실행하고, 워크플로우의 각 단계를 자동화하여 설계부터 구현까지 AI와 협업합니다.

### 1.2 범위 (Scope)

**포함:**
- LLM 통합 웹 터미널 (xterm.js, WebSocket)
- LLM CLI 실행 관리 (Claude Code, Gemini CLI)
- 프롬프트 템플릿 시스템
- 워크플로우 자동화 (Auto-Pilot: 설계 → 구현 → 테스트)
- 실행 이력 및 로그 관리
- 실행 결과 파일 표시

**제외:**
- 칸반/Gantt UI (CHAIN-02)
- 문서 생성 엔진 (CHAIN-03)

### 1.3 성공 지표
- ✅ LLM CLI가 웹 터미널에서 정상 실행
- ✅ 워크플로우 자동화 모드 지원 (Fully Automated, Human-in-the-Loop)
- ✅ 프롬프트 템플릿 20개 이상
- ✅ 실행 성공률 > 90%
- ✅ 터미널 응답 속도 < 500ms

---

## 2. Module (기능) 목록

### MODULE-jjiban-04-01: Web Terminal Integration (3주)
**비전**: "브라우저에서 LLM CLI를 실행하는 터미널"

**기능**:
- xterm.js 통합 (터미널 UI)
- WebSocket 실시간 통신 (양방향 스트리밍)
- node-pty 백엔드 (LLM CLI 실행)
- 대화형 입력 지원 (Y/N 확인, 추가 질문)
- 터미널 테마 및 폰트 설정
- 전체화면/분할화면 모드

**인수 조건**:
- [ ] Claude Code, Gemini CLI 실행 가능
- [ ] 실시간 출력 스트리밍
- [ ] 대화형 입력 처리
- [ ] 세션 관리 (Task별 독립 세션)

**예상 Task 수**: 6개

---

### MODULE-jjiban-04-02: LLM CLI Executor (2주)
**비전**: "LLM CLI 실행 및 프로세스 관리"

**기능**:
- LLM CLI 감지 (claude, gemini, codex 등)

- LLM 연결 설정 화면 (API 키 관리, 모델 선택 UI)


**인수 조건**:
- [ ] 3가지 LLM CLI 지원 (Claude, Gemini, OpenAI)
- [ ] API 키 안전 관리 (암호화 저장)
- [ ] 설정 화면에서 모델/CLI 선택 가능
- [ ] 프로세스 타임아웃 및 종료
- [ ] 에러 로그 기록


**예상 Task 수**: 5개

---

### MODULE-jjiban-04-03: Prompt Template System (2주)
**비전**: "재사용 가능한 프롬프트 템플릿 라이브러리"

**기능**:
- 프롬프트 템플릿 CRUD
- 템플릿 변수 치환 (taskName, documentPath 등)
- 카테고리 분류 (설계, 구현, 리뷰, 테스트)
- 템플릿 미리보기
- 버전 관리
- 즐겨찾기

**인수 조건**:
- [ ] 최소 20개 기본 템플릿 제공
- [ ] 템플릿 생성/수정/삭제
- [ ] 변수 치환 정확도 100%
- [ ] 카테고리별 필터링

**예상 Task 수**: 4개

---

### MODULE-jjiban-04-04: Workflow Automation (Auto-Pilot) (3주)
**비전**: "원클릭 자동 워크플로우 실행"

**기능**:
- 자동화 모드 선택 (Fully Automated, Human-in-the-Loop)
- 워크플로우 파이프라인 정의:
  ```
  [기본설계] → [상세설계] → [설계리뷰] →
  [구현 + TDD 테스트] → [E2E 테스트] → [코드리뷰] →
  [통합테스트] → [완료]
  ```
- 각 단계별 자동 실행
- **TDD 테스트 실행**: 구현 단계에서 단위 테스트 자동 실행 (`05-tdd-test-results.md` 생성)
- **E2E 테스트 실행**: Playwright 기반 E2E 테스트 자동 실행 (`05-e2e-test-results.md` 생성)
- **통합 테스트 실행**: 전체 시나리오 테스트 (`08-integration-test.md` 생성)
- 테스트 실패 시 자동 중단 및 피드백 요청
- 승인 대기 (Human-in-the-Loop 모드)
- 에러 발생 시 중단 및 알림
- 진행 상황 모니터링

**인수 조건**:
- [ ] Fully Automated 모드 지원
- [ ] Human-in-the-Loop 모드 지원 (단계별 승인)
- [ ] TDD 테스트 자동 실행 및 결과서 생성
- [ ] E2E 테스트 자동 실행 및 결과서 생성
- [ ] 테스트 실패 시 워크플로우 중단
- [ ] 에러 발생 시 중단 및 알림
- [ ] 진행 상황 실시간 표시

**예상 Task 수**: 8개

---

### MODULE-jjiban-04-05: Execution Log & History (2주)
**비전**: "LLM 실행 이력 및 결과 파일 관리"

**기능**:
- 실행 로그 저장 (세션별)
- 실행 결과 파일 자동 감지
- 파일 diff 표시 (수정된 경우)
- 로그 검색 및 필터링
- 실행 통계 (성공/실패, 소요 시간)

**인수 조건**:
- [ ] 모든 실행 로그 저장
- [ ] 생성/수정된 파일 자동 감지
- [ ] 파일 diff 표시
- [ ] 로그 검색 기능

**예상 Task 수**: 4개

---

## 3. 의존성

### 3.1 선행 Chains
- CHAIN-jjiban-01: Platform Foundation
- CHAIN-jjiban-03: Workflow & Document Engine

### 3.2 후행 Chains
- 없음

### 3.3 외부 의존성
- xterm.js (터미널 UI)
- node-pty (PTY 프로세스 실행)
- Socket.IO 또는 WebSocket (실시간 통신)
- Claude Code CLI
- Gemini CLI
- OpenAI Codex CLI

---

## 4. 주요 API 목록

| API | Method | 경로 | 설명 |
|-----|--------|------|------|
| 터미널 세션 생성 | POST | `/api/terminal/session` | WebSocket 세션 시작 |
| LLM 명령 실행 | POST | `/api/llm/execute` | LLM CLI 실행 |
| 프롬프트 템플릿 목록 | GET | `/api/prompts` | 템플릿 목록 조회 |
| 워크플로우 자동화 시작 | POST | `/api/workflow/auto/:taskId` | Auto-Pilot 시작 |
| 실행 로그 조회 | GET | `/api/logs/:sessionId` | 로그 조회 |

---

## 5. 기술 스택

| 레이어 | 기술 | 비고 |
|--------|------|------|
| Terminal UI | xterm.js | 브라우저 터미널 |
| Backend PTY | node-pty | LLM CLI 실행 |
| Real-time | WebSocket 또는 Socket.IO | 양방향 스트리밍 |
| LLM CLI | Claude Code, Gemini CLI, Codex CLI | 고정 서버 |

---

## 6. 마일스톤

| 마일스톤 | 목표일 | 산출물 |
|----------|--------|--------|
| M1: 웹 터미널 | Week 3 | xterm.js, WebSocket 연동 |
| M2: LLM 실행 | Week 6 | LLM CLI 실행 관리 |
| M3: 프롬프트 & 자동화 | Week 9 | 템플릿 시스템, Auto-Pilot |
| M4: 로그 & 통합 | Week 12 | 실행 이력, 전체 통합 |

---

## 7. 참조 문서

- 원본 EPIC PRD: `projects/jjiban/jjiban-prd.md`
- Section 3.4: LLM 통합 웹 터미널
- Section 3.5: 워크플로우 자동화

---

## 8. 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.1 | 2025-12-06 | Auto-Pilot에 TDD/E2E/통합 테스트 실행 단계 명시 |
| 1.0 | 2025-12-06 | 초안 작성 |
